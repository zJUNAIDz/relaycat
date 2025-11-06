import { Channel } from "@/generated/prisma/client";
import { API_URL } from "@/shared/lib/constants";
import { getAuth } from "@/shared/utils/server";
import axios, { AxiosError, AxiosResponse } from "axios";

class ChannelService {
  async getChannelById(channelId: Channel["id"]) {
    const { apiToken } = await getAuth()
    try {
      const { data: { channel } }: AxiosResponse<{ channel: Channel | null }> = await axios.get(`${API_URL}/channels/${channelId}`, {
        headers: {
          "Authorization": `Bearer ${apiToken}`
        }
      })
      if (!channel) {
        return { channel: null, error: "Channel not found" }
      }
      return { channel, error: null }
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.response?.data)
        return { channel: null, error: error.response?.data.error }
      }
      console.log("[getChannelById] ", error)
      return { channel: null, error: "Something went wrong" }
    }
  }
}

export const channelService = new ChannelService()