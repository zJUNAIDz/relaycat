import axiosClient from "@/shared/lib/axios-client";
import { Member } from "@repo/types";

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
}
export const memberService = new MemberService();
