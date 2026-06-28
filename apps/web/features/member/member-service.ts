import axiosClient from "@/shared/lib/axios-client";
import { MemberRole, ServerWithMembersAndUser } from "@/shared/types";
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

  /** Remove a member from a server. Returns the updated server. */
  async kick(
    serverId: string,
    memberId: string,
  ): Promise<ServerWithMembersAndUser> {
    const url = queryString.stringifyUrl({
      url: `/members/kick`,
      query: { serverId, memberId },
    });
    const { data } = await axiosClient.delete<{
      server: ServerWithMembersAndUser;
    }>(url);
    return data.server;
  }

  /** Change a member's role. Returns the updated server. */
  async changeRole(
    serverId: string,
    memberId: string,
    role: MemberRole,
  ): Promise<ServerWithMembersAndUser> {
    const url = queryString.stringifyUrl({
      url: `/members/changeRole`,
      query: { serverId, memberId },
    });
    const { data } = await axiosClient.patch<{
      server: ServerWithMembersAndUser;
    }>(url, { serverId, memberId, role });
    return data.server;
  }
}
export const memberService = new MemberService();
