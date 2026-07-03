import axiosClient from "@/shared/lib/axios-client";
import { Member } from "@repo/types";
import queryString from "query-string";

class MemberService {
  async getMemberById(memberId: string): Promise<Member> {
    const {
      data: { member, error },
    } = await axiosClient.get(`/members/${memberId}`);
    if (error) {
      throw new Error(error);
    }
    return member;
  }
  async getMemberByUserId(userId: string): Promise<Member> {
    const {
      data: { member, error },
    } = await axiosClient.get(`/members/user/${userId}`);
    if (error) {
      throw new Error(error);
    }
    return member;
  }
  async getMembersByServerId(serverId: string): Promise<Member[]> {
    const {
      data: { members, error },
    } = await axiosClient.get(`/members/server/${serverId}`);
    if (error) {
      throw new Error(error);
    }
    return members;
  }

  /** Remove a member from a server. The roster is refetched by the caller. */
  async kick(serverId: string, memberId: string): Promise<void> {
    const url = queryString.stringifyUrl({
      url: `/members/kick`,
      query: { serverId, memberId },
    });
    await axiosClient.delete(url);
  }
}
export const memberService = new MemberService();
