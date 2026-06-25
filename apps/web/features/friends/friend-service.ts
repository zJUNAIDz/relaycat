import axiosClient from "@/shared/lib/axios-client";
import type { FriendRequest, FriendUser } from "@repo/types";

/**
 * Thin wrapper over the `/friends` API. Keeps all friend network calls in one
 * place so hooks/components stay declarative.
 */
class FriendService {
  /** Accepted friends. */
  async list(): Promise<FriendUser[]> {
    const { data } = await axiosClient.get<{ friends: FriendUser[] }>(
      "/friends",
    );
    return data.friends;
  }

  /** Pending requests (incoming + outgoing). */
  async requests(): Promise<FriendRequest[]> {
    const { data } = await axiosClient.get<{ requests: FriendRequest[] }>(
      "/friends/requests",
    );
    return data.requests;
  }

  /** Search users by (partial) username. */
  async search(q: string): Promise<FriendUser[]> {
    const { data } = await axiosClient.get<{ users: FriendUser[] }>(
      "/friends/search",
      { params: { q } },
    );
    return data.users;
  }

  async sendRequest(username: string): Promise<void> {
    await axiosClient.post("/friends/requests", { username });
  }

  /** Send a request by user id (from profile popups, where we have the id). */
  async sendRequestToUser(userId: string): Promise<void> {
    await axiosClient.post(`/friends/${userId}/request`);
  }

  async accept(friendshipId: string): Promise<void> {
    await axiosClient.post(`/friends/requests/${friendshipId}/accept`);
  }

  async decline(friendshipId: string): Promise<void> {
    await axiosClient.post(`/friends/requests/${friendshipId}/decline`);
  }

  /** Remove a friend or cancel an outgoing request. */
  async remove(userId: string): Promise<void> {
    await axiosClient.delete(`/friends/${userId}`);
  }

  async block(userId: string): Promise<void> {
    await axiosClient.post(`/friends/${userId}/block`);
  }
}

export const friendService = new FriendService();
