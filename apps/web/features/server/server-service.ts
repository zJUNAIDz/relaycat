import axiosClient from "@/shared/lib/axios-client";
import { CONFIG } from "@/shared/lib/config";
import { Server, ServerWithMembersUserAndChannels } from "@/shared/types";
import { AxiosResponse } from "axios";
import queryString from "query-string";

class ServerService {
  API_URL: string;
  constructor(apiUrl: string) {
    this.API_URL = apiUrl;
  }

  async getCurrentUserServers(): Promise<
    ServerWithMembersUserAndChannels[] | null
  > {
    try {
      const { data: servers }: { data: ServerWithMembersUserAndChannels[] } =
        await axiosClient.get(`/servers`);
      if (!servers) return null;
      return servers;
    } catch (err) {
      console.error(
        "[SERVER_SERVICE:getServerWithMembersWithUserProfiles] ",
        err,
      );
      return null;
    }
  }

  async getServer(
    serverId: string,
  ): Promise<ServerWithMembersUserAndChannels | null> {
    try {
      const url = queryString.stringifyUrl({
        url: `/servers/${serverId}`,
      });

      const { data: server }: AxiosResponse<ServerWithMembersUserAndChannels> =
        await axiosClient.get(url);
      return server;
    } catch (err) {
      console.error("[SERVER_SERVICE:getServer] ", err);
      return null;
    }
  }
  async joinServerByInviteCode(
    inviteCode: string,
  ): Promise<{ serverId: Server["id"] | null; error: string | null }> {
    try {
      const endpoint = `/servers/join/${inviteCode}`;

      const {
        data: { serverId, error },
      }: AxiosResponse<{
        serverId: Server["id"] | null;
        error: string | null;
      }> = await axiosClient.patch(endpoint);

      if (!serverId) return { serverId: null, error };
      return { serverId, error: null };
    } catch (err) {
      console.error("[SERVER_SERVICE:joinServerByInviteCode] ", err);
      return {
        serverId: null,
        error: "Something went wrong",
      };
    }
  }
}

export const serverService = new ServerService(CONFIG.API_URL);
