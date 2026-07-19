import { uploadToS3 } from "@/shared/lib/s3-upload";
import type { ProfileWithUser, UpdateProfileInput } from "@repo/types";
import { USERNAME_REGEX } from "@repo/types";
import { onboardingService } from "./onboarding-service";

// --- shape ------------------------------------------------------------------

export const STEPS = [
  "welcome",
  "identity",
  "appearance",
  "about",
  "server",
] as const;
export type Step = (typeof STEPS)[number];

/** Text fields survive a refresh; Files can't be serialised, so they don't. */
export type Draft = {
  username: string;
  displayName: string;
  pronouns: string;
  status: string;
  bio: string;
  accentColor: string;
};

export type ImageSlot = {
  /** Existing resolved URL, or an object URL for a freshly picked file. */
  preview: string | null;
  file: File | null;
};

/** Result of the live handle check. `unchecked` = nothing typed yet. */
export type UsernameCheck =
  | { state: "unchecked" }
  | { state: "invalid"; reason: string }
  | { state: "checking" }
  | { state: "available" }
  | { state: "taken" };

export type OnboardingState = {
  step: Step;
  /** 0-based index of `step` within STEPS — handy for progress bars. */
  index: number;
  draft: Draft;
  avatar: ImageSlot;
  banner: ImageSlot;
  usernameCheck: UsernameCheck;
  /** True while the profile is being uploaded/saved or onboarding finalised. */
  busy: boolean;
  error: string | null;
  /** Set once the profile has been persisted (end of the `about` step). */
  profileSaved: boolean;
  /** False until the existing profile has been fetched and folded into `draft`. */
  hydrated: boolean;
  /** The signed-in user's auth name, for greetings and placeholders. */
  authName: string;
};

export const DEFAULT_ACCENT = "#5865F2";
const DRAFT_KEY = "relaycat:onboarding-draft";
const USERNAME_DEBOUNCE_MS = 350;

const EMPTY_DRAFT: Draft = {
  username: "",
  displayName: "",
  pronouns: "",
  status: "",
  bio: "",
  accentColor: DEFAULT_ACCENT,
};

const EMPTY_SLOT: ImageSlot = { preview: null, file: null };

const INITIAL: OnboardingState = {
  step: "welcome",
  index: 0,
  draft: EMPTY_DRAFT,
  avatar: EMPTY_SLOT,
  banner: EMPTY_SLOT,
  usernameCheck: { state: "unchecked" },
  busy: false,
  error: null,
  profileSaved: false,
  hydrated: false,
  authName: "",
};

const orNull = (v: string) => {
  const t = v.trim();
  return t.length ? t : null;
};

/**
 * Derive a legal starting handle from an auth name / email local-part:
 * lowercase, strip anything outside [a-z0-9._], pad to the 2-char minimum.
 */
export function suggestUsername(seed: string): string {
  const base = seed
    .toLowerCase()
    .replace(/@.*$/, "")
    .replace(/[^a-z0-9._]/g, "")
    .replace(/^[^a-z0-9]+/, "")
    .slice(0, 32);
  if (base.length >= 2) return base;
  return base ? `${base}_1` : "";
}

/** Local (pre-network) validity of a handle. */
function validateUsername(username: string): string | null {
  if (!username) return "Pick a username so friends can find you";
  if (!USERNAME_REGEX.test(username)) {
    return "2–32 characters: lowercase letters, numbers, dot or underscore";
  }
  return null;
}

// --- machine ----------------------------------------------------------------

/**
 * Plain, framework-free owner of the onboarding wizard: step sequencing, the
 * draft, the debounced handle check, and the save/finish orchestration. React
 * binds to it through a thin `useSyncExternalStore` hook ({@link useOnboarding}),
 * so none of this lives in component lifecycle — no stale closures, no
 * double-run effects, and the async request-ordering below is actually
 * enforceable.
 *
 * Mirrors the `pushManager` pattern: single instance, snapshot + subscribe.
 */
class OnboardingMachine {
  private state: OnboardingState = INITIAL;
  private readonly listeners = new Set<() => void>();

  /** Guards against a slow username check clobbering a newer one. */
  private checkToken = 0;
  private checkTimer: ReturnType<typeof setTimeout> | null = null;
  private checkAbort: AbortController | null = null;

  private initialized = false;

  // --- React interop (bound; safe to pass straight to the hook) ---

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    // Lazy init on first subscriber — the fetch belongs to the machine, not to
    // a component effect, so it can't double-run or race a remount.
    if (!this.initialized) {
      this.initialized = true;
      void this.hydrate();
    }
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): OnboardingState => this.state;
  getServerSnapshot = (): OnboardingState => INITIAL;

  private set(patch: Partial<OnboardingState>) {
    this.state = { ...this.state, ...patch };
    for (const l of this.listeners) l();
  }

  // --- lifecycle ---

  /**
   * Seed the wizard from the user's existing profile — OAuth users already have
   * a name and an avatar, and there may be a draft from a half-finished attempt
   * before a refresh. A stored draft wins, since it's the more recent intent.
   */
  private async hydrate(): Promise<void> {
    let profile: ProfileWithUser;
    try {
      profile = await onboardingService.getMyProfile();
    } catch (err) {
      this.set({ error: toMessage(err), hydrated: true });
      return;
    }

    const authName = profile.user?.name ?? "";
    const stored = this.readDraft();
    const draft: Draft = stored ?? {
      username:
        profile.username ??
        suggestUsername(authName || profile.user?.email || ""),
      displayName: profile.displayName ?? authName,
      pronouns: profile.pronouns ?? "",
      status: profile.status ?? "",
      bio: profile.bio ?? "",
      accentColor: profile.accentColor ?? DEFAULT_ACCENT,
    };

    this.set({
      draft,
      authName,
      avatar: { preview: profile.avatar ?? null, file: null },
      banner: { preview: profile.banner ?? null, file: null },
      hydrated: true,
    });

    if (draft.username) void this.checkUsername(draft.username);
  }

  /** Full teardown, so a later visit (e.g. a different user) starts clean. */
  reset = () => {
    this.cancelCheck();
    this.revokePreviews();
    this.clearDraft();
    this.initialized = false;
    this.state = INITIAL;
    for (const l of this.listeners) l();
  };

  // --- draft ---

  setField = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    const draft = { ...this.state.draft, [key]: value };
    this.set({ draft, error: null });
    this.persistDraft(draft);

    if (key === "username") this.scheduleUsernameCheck(String(value));
  };

  setImage = (slot: "avatar" | "banner", file: File | null) => {
    const current = this.state[slot];
    // Only object URLs are ours to revoke; a persisted https URL is not.
    if (current.file && current.preview?.startsWith("blob:")) {
      URL.revokeObjectURL(current.preview);
    }
    this.set({
      [slot]: file
        ? { preview: URL.createObjectURL(file), file }
        : { preview: null, file: null },
    } as Partial<OnboardingState>);
  };

  // --- username check ---

  /** Debounced; validates locally first so we don't ask the server about junk. */
  private scheduleUsernameCheck(raw: string) {
    this.cancelCheck();
    const username = raw.trim().toLowerCase();

    const reason = validateUsername(username);
    if (reason) {
      this.set({
        usernameCheck: username
          ? { state: "invalid", reason }
          : { state: "unchecked" },
      });
      return;
    }

    this.set({ usernameCheck: { state: "checking" } });
    this.checkTimer = setTimeout(
      () => void this.checkUsername(username),
      USERNAME_DEBOUNCE_MS,
    );
  }

  private async checkUsername(raw: string) {
    const username = raw.trim().toLowerCase();
    const reason = validateUsername(username);
    if (reason) {
      this.set({ usernameCheck: { state: "invalid", reason } });
      return;
    }

    const token = ++this.checkToken;
    this.checkAbort = new AbortController();
    this.set({ usernameCheck: { state: "checking" } });

    try {
      const { available } = await onboardingService.checkUsername(
        username,
        this.checkAbort.signal,
      );
      // A newer keystroke already superseded this request — drop the result.
      if (token !== this.checkToken) return;
      this.set({ usernameCheck: { state: available ? "available" : "taken" } });
    } catch {
      if (token !== this.checkToken) return;
      // Network/abort: don't claim taken, just fall back to unverified.
      this.set({ usernameCheck: { state: "unchecked" } });
    }
  }

  private cancelCheck() {
    if (this.checkTimer) clearTimeout(this.checkTimer);
    this.checkTimer = null;
    this.checkAbort?.abort();
    this.checkAbort = null;
  }

  // --- navigation ---

  /** Can the wizard advance from the current step? */
  canAdvance(): boolean {
    if (this.state.busy) return false;
    if (this.state.step !== "identity") return true;
    // Handle is the one hard requirement; a check that failed to reach the
    // server ("unchecked") still passes — the PATCH is the real gate.
    const { state } = this.state.usernameCheck;
    return state === "available" || state === "unchecked";
  }

  next = async (): Promise<void> => {
    if (!this.canAdvance()) return;
    // Leaving `about` is the commit point: persist the profile so that whatever
    // the user does on the server step (create, join, browse) acts as a real,
    // fully-formed identity rather than a half-filled draft.
    if (this.state.step === "about" && !this.state.profileSaved) {
      const ok = await this.saveProfile();
      if (!ok) return;
    }
    this.goTo(STEPS[Math.min(this.state.index + 1, STEPS.length - 1)]!);
  };

  back = () => {
    if (this.state.busy) return;
    this.goTo(STEPS[Math.max(this.state.index - 1, 0)]!);
  };

  goTo = (step: Step) => {
    this.set({ step, index: STEPS.indexOf(step), error: null });
  };

  // --- persistence ---

  /** Upload any picked images, then PATCH the profile. Returns success. */
  private async saveProfile(): Promise<boolean> {
    const { draft, avatar, banner } = this.state;
    this.set({ busy: true, error: null });

    try {
      const payload: UpdateProfileInput = {
        username: draft.username.trim().toLowerCase(),
        displayName: orNull(draft.displayName),
        bio: orNull(draft.bio),
        pronouns: orNull(draft.pronouns),
        status: orNull(draft.status),
        accentColor: orNull(draft.accentColor),
      };

      const name = draft.displayName || draft.username;
      if (avatar.file) {
        payload.avatar = await uploadToS3(avatar.file, "profile-picture", name);
      }
      if (banner.file) {
        payload.banner = await uploadToS3(banner.file, "profile-banner", name);
      }

      await onboardingService.updateProfile(payload);
      this.set({ busy: false, profileSaved: true });
      this.clearDraft();
      return true;
    } catch (err) {
      this.set({ busy: false, error: toMessage(err) });
      // 409 means someone took the handle between the check and the save; send
      // them back to fix it rather than leaving a dead "Continue" button.
      if (isConflict(err)) {
        this.set({ usernameCheck: { state: "taken" } });
        this.goTo("identity");
      }
      return false;
    }
  }

  /**
   * Finalise onboarding. Every exit from the server step routes through here
   * *before* navigating, so the app shell's gate sees a completed profile and
   * doesn't bounce the user straight back into the wizard.
   */
  finish = async (): Promise<ProfileWithUser | null> => {
    if (this.state.busy) return null;

    // Reachable with an unsaved profile if the user jumps straight here.
    if (!this.state.profileSaved) {
      const saved = await this.saveProfile();
      if (!saved) return null;
    }

    this.set({ busy: true, error: null });
    try {
      // Returned so the caller can prime the react-query cache *before* routing
      // away: a stale `onboardingCompletedAt: null` would make the app shell's
      // gate bounce the user straight back into the wizard.
      const profile = await onboardingService.completeOnboarding();
      this.set({ busy: false });
      this.clearDraft();
      this.revokePreviews();
      return profile;
    } catch (err) {
      this.set({ busy: false, error: toMessage(err) });
      return null;
    }
  };

  // --- draft storage (text only; Files aren't serialisable) ---

  private persistDraft(draft: Draft) {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // Private mode / quota — the draft is a convenience, not a requirement.
    }
  }

  private readDraft(): Draft | null {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (!raw) return null;
      return { ...EMPTY_DRAFT, ...(JSON.parse(raw) as Partial<Draft>) };
    } catch {
      return null;
    }
  }

  private clearDraft() {
    try {
      sessionStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
  }

  private revokePreviews() {
    for (const slot of [this.state.avatar, this.state.banner]) {
      if (slot.file && slot.preview?.startsWith("blob:")) {
        URL.revokeObjectURL(slot.preview);
      }
    }
  }
}

function isConflict(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "response" in err &&
    (err as { response?: { status?: number } }).response?.status === 409
  );
}

function toMessage(err: unknown): string {
  if (typeof err === "object" && err !== null && "response" in err) {
    const data = (err as { response?: { data?: { error?: string } } }).response
      ?.data;
    if (data?.error) return data.error;
  }
  return err instanceof Error ? err.message : "Something went wrong";
}

export const onboardingMachine = new OnboardingMachine();
