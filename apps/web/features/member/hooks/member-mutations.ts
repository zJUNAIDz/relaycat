import { memberService } from "@/features/member/member-service";
import { MemberRole, ServerWithMembersAndUser } from "@/shared/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * React Query mutations for member management. Both resolve to the updated
 * server (so callers can refresh whatever holds the member list) and invalidate
 * the `["server"]` query that drives the sidebar.
 */

export function useKickMemberMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["kickMember"],
    mutationFn: ({
      serverId,
      memberId,
    }: {
      serverId: string;
      memberId: string;
    }): Promise<ServerWithMembersAndUser> =>
      memberService.kick(serverId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["server"] });
    },
  });
}

export function useChangeMemberRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["changeMemberRole"],
    mutationFn: ({
      serverId,
      memberId,
      role,
    }: {
      serverId: string;
      memberId: string;
      role: MemberRole;
    }): Promise<ServerWithMembersAndUser> =>
      memberService.changeRole(serverId, memberId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["server"] });
    },
  });
}
