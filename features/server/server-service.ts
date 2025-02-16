import { ServerWithMembers, ServerWithMembersWithUserProfiles } from "@/shared/types";
import { getEnv } from "@/shared/utils/env";
import { getAuthTokenOnServer } from "@/shared/utils/server";
import { Server } from "@prisma/client";
import axios, { Axios, AxiosResponse } from "axios";
import queryString from "query-string";

class ServerService {
  apiEndpoint: string;
  constructor() {
    this.apiEndpoint = getEnv("API_URL");
  }

  async getServersByUserId(userId: string): Promise<ServerWithMembersWithUserProfiles[] | Server[] | null> {
    try {

      const { data: servers }: { data: ServerWithMembersWithUserProfiles[] | Server[] } = await axios.get(`${this.apiEndpoint}/servers`, {
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
      console.log("[SERVER_SERVICE:getServerWithMembersWithUserProfiles] ", err)
      return null
    }
  }

  async getServer(serverId: string, options?: ["members"]): Promise<ServerWithMembers | null>;
  async getServer(serverId: string, options?: ["user", "members"] | ["user"]): Promise<ServerWithMembersWithUserProfiles | null>;
  async getServer(serverId: string, options?: undefined | []): Promise<Server | null>;
  async getServer(serverId: string, options?: string[]): Promise<ServerWithMembersWithUserProfiles | ServerWithMembers | Server | null> {
    try {
      const url = queryString.stringifyUrl({
        url: `${this.apiEndpoint}/servers/${serverId}`,
        query: {
          user: options?.includes("users") ? true : false,
          member: options?.includes("members") ? true : false,
        },
      })

      const token = await getAuthTokenOnServer();
      const { data: server }: AxiosResponse<
        | ServerWithMembersWithUserProfiles
        | ServerWithMembers
        | Server> = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      return server
    } catch (err) {
      console.error("[SERVER_SERVICE:getServerWithMembersWithUserProfiles] ", err)
      return null
    }
  }
  async joinServerByInviteCode(inviteCode: string): Promise<{ serverId: Server["id"] | null, error: string | null }> {
    try {
      const token = await getAuthTokenOnServer();
      const endpoint = `${this.apiEndpoint}/servers/join/invite`

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