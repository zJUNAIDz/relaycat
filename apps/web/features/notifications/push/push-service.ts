import axiosClient from "@/shared/lib/axios-client";

/** Wrapper over the `/push` API for Web Push subscription management. */
class PushService {
  /** The server's VAPID public key, or null when push is disabled server-side. */
  async getVapidPublicKey(): Promise<string | null> {
    const { data } = await axiosClient.get<{ publicKey: string | null }>(
      "/push/public-key",
    );
    return data.publicKey;
  }

  /** Register this device's push subscription with the server. */
  async subscribe(subscription: PushSubscriptionJSON): Promise<void> {
    await axiosClient.post("/push/subscribe", subscription);
  }

  /** Drop this device's push subscription on the server. */
  async unsubscribe(endpoint: string): Promise<void> {
    await axiosClient.post("/push/unsubscribe", { endpoint });
  }
}

export const pushService = new PushService();
