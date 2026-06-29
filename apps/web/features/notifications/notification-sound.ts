const STORAGE_KEY = "relaycat:notif-sound-muted";

/**
 * Plain, framework-free owner of the notification chime and the user's mute
 * preference. Synthesizes a short two-note tone via Web Audio (no asset), so
 * `play()` is a no-op-safe call from `notification-actions`. The React layer is
 * a thin `useSyncExternalStore` binding ({@link useNotificationSoundPref}) — none
 * of this lives in component lifecycle. See [[avoid-react-lifecycle-for-logic]].
 *
 * Mirrors the `pushManager` pattern: single instance, snapshot + subscribe.
 */
class NotificationSound {
  private muted = readMutedPref();
  private readonly listeners = new Set<() => void>();
  private ctx: AudioContext | null = null;

  // --- React interop (bound for direct use in the hook) ---

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): boolean => this.muted;

  // SSR has no preference; default to unmuted to match the common client case.
  getServerSnapshot = (): boolean => false;

  // --- Actions ---

  toggleMuted = (): void => this.setMuted(!this.muted);

  setMuted = (muted: boolean): void => {
    if (muted === this.muted) return;
    this.muted = muted;
    try {
      window.localStorage.setItem(STORAGE_KEY, muted ? "1" : "0");
    } catch {
      /* private mode / storage disabled — preference is in-memory only */
    }
    this.listeners.forEach((l) => l());
  };

  /** Play the chime. No-op when muted, on the server, or if audio is blocked. */
  play = (): void => {
    if (this.muted || typeof window === "undefined") return;
    try {
      const ctx = this.audioContext();
      if (!ctx) return;
      // Some browsers suspend the context until a gesture; resume best-effort.
      if (ctx.state === "suspended") void ctx.resume();
      this.chime(ctx);
    } catch {
      /* autoplay policy or no Web Audio — silently skip */
    }
  };

  // --- Internals ---

  private audioContext(): AudioContext | null {
    if (this.ctx) return this.ctx;
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    this.ctx = new Ctor();
    return this.ctx;
  }

  /** A soft, quick two-note rise (E6 → A6) with a gentle envelope. */
  private chime(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const notes = [
      { freq: 1318.51, start: 0, dur: 0.12 },
      { freq: 1760.0, start: 0.1, dur: 0.18 },
    ];
    for (const { freq, start, dur } of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const t0 = now + start;
      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(0.15, t0 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    }
  }
}

function readMutedPref(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export const notificationSound = new NotificationSound();
