import axiosClient from "@/shared/lib/axios-client";

/** The server's VAPID public key, or null when push is disabled server-side. */
export async function fetchVapidPublicKey(): Promise<string | null> {
  const { data } = await axiosClient.get<{ publicKey: string | null }>(
    "/push/public-key",
  );
  return data.publicKey;
}

/** Register this device's push subscription with the server. */
export async function subscribePush(
  subscription: PushSubscriptionJSON,
): Promise<void> {
  await axiosClient.post("/push/subscribe", subscription);
}

/** Drop this device's push subscription on the server. */
export async function unsubscribePush(endpoint: string): Promise<void> {
  await axiosClient.post("/push/unsubscribe", { endpoint });
}
