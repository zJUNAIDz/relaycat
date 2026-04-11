import { Channel } from "@/generated/prisma/client";
import axiosClient from "@/shared/lib/axios-client";
import { AxiosError, AxiosResponse } from "axios";

class ChannelService {
  async getChannelById(channelId: string) {
    try {
      const {
        data,
      }: AxiosResponse<{ channel: Channel | null }> = await axiosClient.get(
        `/channels/${channelId}`,
      );
      console.log("getChannelById data:", data);
      const channel = data.channel;
      if (!channel) {
        return { channel: null, error: "Channel not found" };
      }
    
      return { channel, error: null };
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.response?.data);
        return { channel: null, error: error.response?.data.error };
      }
      console.log("[getChannelById] ", error);
      return { channel: null, error: "Something went wrong" };
    }
  }
}

export const channelService = new ChannelService();
