import { memberService } from "@/features/member/member-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * React Query mutations for member management. Kicking invalidates the
 * `["server"]` query that drives the sidebar/roster so it refetches.
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
    }): Promise<void> => memberService.kick(serverId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["server"] });
    },
  });
}
