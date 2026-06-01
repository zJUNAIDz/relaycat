import axiosClient from "@/shared/lib/axios-client";
import { Channel } from "@repo/types";
import { AxiosResponse } from "axios";

class ChannelService {
  async getChannelById(channelId: string) {
    const { data }: AxiosResponse<{ channel: Channel | null }> =
      await axiosClient.get(`/channels/${channelId}`);
    return data.channel ?? null;
  }
}

export const channelService = new ChannelService();
