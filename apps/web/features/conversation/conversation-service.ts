import axiosClient from "@/shared/lib/axios-client";
import type { DmChannel } from "@repo/types";

/**
 * 1-1 direct-message channels. A DM reuses the server `channels` table (type
 * "DM") and is addressed by its channelId, so message reads/writes go through
 * the same chat components as server channels.
 */
class ConversationService {
  /** All DM channels for the current user. */
  async list(): Promise<DmChannel[]> {
    const { data } = await axiosClient.get<{ channels: DmChannel[] }>("/dm");
    return data.channels;
  }

  /** Fetch a single DM channel (also used to resolve the other participant). */
  async get(channelId: string): Promise<DmChannel> {
    const { data } = await axiosClient.get<{ channel: DmChannel }>(
      `/dm/${channelId}`,
    );
    return data.channel;
  }

  /** Get-or-create the DM channel with another user, returning it. */
  async open(userId: string): Promise<DmChannel> {
    const { data } = await axiosClient.post<{ channel: DmChannel }>("/dm", {
      userId,
    });
    return data.channel;
  }
}

export const conversationService = new ConversationService();
