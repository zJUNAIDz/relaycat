import axiosClient from "@/shared/lib/axios-client";
import { AxiosResponse } from "axios";

class ChannelService {
  async getChannelById(channelId: string) {
    const { data }: AxiosResponse<{ channel: any | null }> =
      await axiosClient.get(`/channels/${channelId}`);
    return data.channel;
  }
}

export const channelService = new ChannelService();
