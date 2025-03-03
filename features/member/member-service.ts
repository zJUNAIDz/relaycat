import { getAuthTokenOnServer } from "@/shared/utils/server";
import { Member } from "@prisma/client";
import axios from "axios";

class MemberService {
  private API_URL = process.env.NEXT_PUBLIC_API_URL!;
  async getMemberById(memberId: Member["id"]) {
    try {
      const { data: { member, error } } = await axios.get(`${this.API_URL}/members/${memberId}`, {
        headers: {
          "Authorization": `Bearer ${await getAuthTokenOnServer()}`
        }
      })
      if (error) {
        return { error }
      }
      return { member }
    } catch (error) {
      console.log("[getMemberById] ", error)
      return { error }
    }
  }
  async getMemberByUserId(userId: Member["userId"]) {
    try {
      const { data: { member, error } } = await axios.get(`${this.API_URL}/members/user/${userId}`, {
        headers: {
          "Authorization": `Bearer ${await getAuthTokenOnServer()}`
        }
      })
      if (error) {
        return { error }
      }
      return { member }
    } catch (error) {
      console.log("[getMemberByUserId] ", error)
      return { error }
    }
  }
  async getMembersByServerId(serverId: string) {
    try {
      const { data: { members, error } } = await axios.get(`${this.API_URL}/members/server/${serverId}`, {
        headers: {
          "Authorization": `Bearer ${await getAuthTokenOnServer()}`
        }
      })
      if (error) {
        return { error }
      }
      return { members }
    } catch (error) {
      console.log("[getMembersByServerId] ", error)
      return { error }
    }
  }
}
export const memberService = new MemberService();