import { fetchVapidPublicKey, subscribePush, unsubscribePush } from "./api";

export type PushStatus =
  | "loading"
  | "unsupported"
  | "denied"
  | "off"
  | "on";

export type PushState = { status: PushStatus; busy: boolean };

const SW_PATH = "/sw.js";

/** VAPID keys are base64url; PushManager wants a binary application key. */
function urlBase64ToBytes(base64: string): BufferSource {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(normalized);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

function isSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

async function getRegistration(): Promise<ServiceWorkerRegistration> {
  const existing = await navigator.serviceWorker.getRegistration(SW_PATH);
  return existing ?? navigator.serviceWorker.register(SW_PATH);
}

/**
 * Plain, framework-free owner of this browser's Web Push subscription. Holds the
 * status, exposes enable/disable, and notifies subscribers on change — the React
 * layer is a thin `useSyncExternalStore` binding ({@link useWebPush}), so none of
 * this imperative logic lives in component lifecycle.
 *
 * Mirrors the `clientSocketManager` pattern: single instance, lazy init on first
 * subscriber, snapshot + subscribe for React interop.
 */
class PushManager {
  // Stable snapshots: getSnapshot must return the same reference until changed.
  private state: PushState = { status: "loading", busy: false };
  private static readonly SERVER_STATE: PushState = {
    status: "loading",
    busy: false,
  };
  private readonly listeners = new Set<() => void>();
  private initialized = false;

  // --- React interop (bound so they can be passed directly to the hook) ---

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    // Reconcile against the browser exactly once, on the first subscriber.
    if (!this.initialized) {
      this.initialized = true;
      void this.reconcile();
    }
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): PushState => this.state;

  getServerSnapshot = (): PushState => PushManager.SERVER_STATE;

  // --- Actions ---

  enable = async (): Promise<void> => {
    if (this.state.busy) return;
    this.set({ busy: true });
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        this.set({ status: permission === "denied" ? "denied" : "off" });
        return;
      }
      const publicKey = await fetchVapidPublicKey();
      if (!publicKey) {
        // Server has push disabled — nothing the client can do.
        this.set({ status: "off" });
        return;
      }
      const reg = await getRegistration();
      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToBytes(publicKey),
        }));
      await subscribePush(sub.toJSON());
      this.set({ status: "on" });
    } catch {
      this.set({ status: "off" });
    } finally {
      this.set({ busy: false });
    }
  };

  disable = async (): Promise<void> => {
    if (this.state.busy) return;
    this.set({ busy: true });
    try {
      const reg = await getRegistration();
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await unsubscribePush(sub.endpoint);
        await sub.unsubscribe();
      }
      this.set({ status: "off" });
    } catch {
      // Leave status as-is; the user can retry.
    } finally {
      this.set({ busy: false });
    }
  };

  // --- Internals ---

  private async reconcile(): Promise<void> {
    if (!isSupported()) return this.set({ status: "unsupported" });
    if (Notification.permission === "denied")
      return this.set({ status: "denied" });
    try {
      const reg = await getRegistration();
      const sub = await reg.pushManager.getSubscription();
      this.set({ status: sub ? "on" : "off" });
    } catch {
      this.set({ status: "off" });
    }
  }

  private set(patch: Partial<PushState>): void {
    // New object only when something actually changed, preserving snapshot identity.
    const next = { ...this.state, ...patch };
    if (next.status === this.state.status && next.busy === this.state.busy) return;
    this.state = next;
    this.listeners.forEach((l) => l());
  }
}

export const pushManager = new PushManager();
