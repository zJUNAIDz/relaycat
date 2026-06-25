"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { conversationService } from "../conversation-service";

export const dmKeys = {
  list: ["dm", "list"] as const,
  detail: (channelId: string) => ["dm", channelId] as const,
};

/** The current user's DM channels for the sidebar. */
export function useDmChannels() {
  return useQuery({
    queryKey: dmKeys.list,
    queryFn: () => conversationService.list(),
  });
}

export function useDmChannel(channelId: string) {
  return useQuery({
    queryKey: dmKeys.detail(channelId),
    queryFn: () => conversationService.get(channelId),
    enabled: !!channelId,
  });
}

/**
 * Open (get-or-create) a DM with a user and navigate to it. Used by the
 * "Message" action in profile popups and the friends list.
 */
export function useOpenDm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => conversationService.open(userId),
    onSuccess: (channel) => {
      queryClient.invalidateQueries({ queryKey: dmKeys.list });
      router.push(`/channels/me/${channel.id}`);
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.error ?? "Could not open DM"),
  });
}
