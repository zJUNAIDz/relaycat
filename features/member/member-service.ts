import { getAuthTokenOnServer } from "@/shared/utils/server";
import { Member } from "@/generated/prisma/client";
import axios from "axios";

class MemberService {
  private API_URL = process.env.NEXT_PUBLIC_API_URL!;
  async getMemberById(memberId: Member["id"]): Promise<{ member: Member, error: null } | { member: null, error: string }> {
    try {
      const { data: { member, error } } = await axios.get(`${this.API_URL}/members/${memberId}`, {
        headers: {
          "Authorization": `Bearer ${await getAuthTokenOnServer()}`
        }
      })
      if (error) {
        return { member: null, error }
      }
      return { member, error: null }
    } catch (error) {
      console.log("[getMemberById] ", error)
      if (axios.isAxiosError(error)) {
        return { member: null, error: error.response?.data.error }
      }
      return { member: null, error: "Failed to get member by member id" }
    }
  }
  async getMemberByUserId(userId: Member["userId"]): Promise<{ member: Member, error: null } | { member: null, error: string }> {
    try {
      const { data: { member, error } } = await axios.get(`${this.API_URL}/members/user/${userId}`, {
        headers: {
          "Authorization": `Bearer ${await getAuthTokenOnServer()}`
        }
      })
      if (error) {
        return { member: null, error }
      }
      return { member, error: null }
    } catch (error) {
      console.log("[getMemberByUserId] ", error)
      if (axios.isAxiosError(error)) {
        return { member: null, error: error.response?.data.error }
      }
      return { member: null, error: "Failed to get member by user id" }
    }
  }
  async getMembersByServerId(serverId: string): Promise<{ members: Member[], error: null } | { member: null, error: string }> {
    try {
      const { data: { members, error } } = await axios.get(`${this.API_URL}/members/server/${serverId}`, {
        headers: {
          "Authorization": `Bearer ${await getAuthTokenOnServer()}`
        }
      })
      if (error) {
        return { member: null, error }
      }
      return { members, error: null }
    } catch (error) {
      console.log("[getMembersByServerId] ", error)
      if (axios.isAxiosError(error)) {
        return { member: null, error: error.response?.data.error }
      }
      return { member: null, error: "Failed to get members by server id" }
    }
  }
}
export const memberService = new MemberService();