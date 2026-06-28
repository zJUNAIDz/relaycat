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

  /** Rotate the server's invite code and return the updated server. */
  async regenerateInviteCode(
    serverId: string,
  ): Promise<ServerWithMembersUserAndChannels> {
    const { data } = await axiosClient.patch<{
      server: ServerWithMembersUserAndChannels;
    }>(`/servers/${serverId}/invite-code`);
    return data.server;
  }

  /** Leave a server the current user is a member of. */
  async leaveServer(serverId: string): Promise<void> {
    const url = queryString.stringifyUrl({
      url: `/servers/leave`,
      query: { serverId },
    });
    await axiosClient.patch(url, { serverId });
  }
}

export const serverService = new ServerService(CONFIG.API_URL);
