import { API_URL } from "@/shared/lib/constants";
import { ServerWithMembersAndUser, ServerWithMembersOnly, ServerWithMembersUserAndChannels } from "@/shared/types";
import { getEnv } from "@/shared/utils/env";
import { getAuthTokenOnServer } from "@/shared/utils/server";
import { Server } from "@prisma/client";
import axios, { AxiosResponse } from "axios";
import queryString from "query-string";

class ServerService {
  API_URL: string;
  constructor() {
    this.API_URL = API_URL;
  }

  async getServersByUserId(userId: string): Promise<ServerWithMembersAndUser[] | Server[] | null> {
    try {

      const { data: servers }: { data: ServerWithMembersAndUser[] | Server[] } = await axios.get(`${this.API_URL}/servers`, {
        params: {
          userId
        },
        headers: {
          Authorization: `Bearer ${await getAuthTokenOnServer()}`
        }
      });
      if (!servers) return null
      return servers;
    } catch (err) {
      console.error("[SERVER_SERVICE:getServerWithMembersWithUserProfiles] ", err)
      return null
    }
  }

  async getServer(serverId: string, options?: ["members"]): Promise<ServerWithMembersOnly | null>;
  async getServer(serverId: string, options?: ["user", "members"] | ["user"]): Promise<ServerWithMembersAndUser | null>;
  async getServer(serverId: string, options?: ["user", "members", "channels"] | ["user", "channels"]): Promise<ServerWithMembersUserAndChannels>
  async getServer(serverId: string, options?: undefined | []): Promise<Server | null>;
  async getServer(serverId: string, options?: string[]): Promise<ServerWithMembersAndUser | ServerWithMembersOnly | Server | null> {
    try {
      const url = queryString.stringifyUrl({
        url: `${this.API_URL}/servers/${serverId}`,
        query: {
          user: options?.includes("users") ? true : false,
          member: options?.includes("members") ? true : false,
          options: options?.toString()
        },
      })

      const token = await getAuthTokenOnServer();
      const { data: server }:
        AxiosResponse<
          | Server
          | ServerWithMembersOnly
          | ServerWithMembersAndUser
          | ServerWithMembersUserAndChannels
        > = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }

        })
      return server
    } catch (err) {
      console.error("[SERVER_SERVICE:getServer] ", err)
      return null
    }
  }
  async joinServerByInviteCode(inviteCode: string): Promise<{ serverId: Server["id"] | null, error: string | null }> {
    try {
      const token = await getAuthTokenOnServer();
      const endpoint = `${this.API_URL}/servers/join/invite`

      const { data: { serverId, error } }: AxiosResponse<{ serverId: Server["id"] | null, error: string | null }> = await axios.patch(endpoint, { inviteCode }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!serverId) return { serverId: null, error }
      return { serverId, error: null }
    } catch (err) {
      console.error("[SERVER_SERVICE:joinServerByInviteCode] ", err)
      return {
        serverId: null, error: "Something went wrong"
      }
    }
  }

}

export const serverService = new ServerService();