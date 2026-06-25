"use client";

import { useSocket } from "@/shared/providers/socket-provider";
import { useAuth } from "@/shared/providers/auth-provider";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import React from "react";
import { toast } from "sonner";
import { friendService } from "../friend-service";

export const friendKeys = {
  list: ["friends", "list"] as const,
  requests: ["friends", "requests"] as const,
  search: (q: string) => ["friends", "search", q] as const,
};

export function useFriends() {
  return useQuery({ queryKey: friendKeys.list, queryFn: () => friendService.list() });
}

export function useFriendRequests() {
  return useQuery({
    queryKey: friendKeys.requests,
    queryFn: () => friendService.requests(),
  });
}

export function useUserSearch(q: string) {
  return useQuery({
    queryKey: friendKeys.search(q),
    queryFn: () => friendService.search(q),
    enabled: q.trim().length > 0,
  });
}

/**
 * Live refresh: the server emits `user:<myId>:friends` whenever this user's
 * friends or requests change, so we invalidate both lists on the event.
 */
export function useFriendRealtime() {
  const { socket } = useSocket();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  React.useEffect(() => {
    if (!socket || !userId) return;
    const event = `user:${userId}:friends`;
    const handler = () => {
      queryClient.invalidateQueries({ queryKey: friendKeys.list });
      queryClient.invalidateQueries({ queryKey: friendKeys.requests });
    };
    socket.on(event, handler);
    return () => {
      socket.off(event, handler);
    };
  }, [socket, userId, queryClient]);
}

/** Mutations that touch the friend graph, invalidating the relevant lists. */
export function useFriendActions() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: friendKeys.list });
    queryClient.invalidateQueries({ queryKey: friendKeys.requests });
  };

  // Errors are surfaced by the global mutation handler (see QueryProvider).
  const sendRequest = useMutation({
    mutationFn: (username: string) => friendService.sendRequest(username),
    onSuccess: () => {
      toast.success("Friend request sent");
      invalidate();
    },
  });

  const sendRequestToUser = useMutation({
    mutationFn: (userId: string) => friendService.sendRequestToUser(userId),
    onSuccess: () => {
      toast.success("Friend request sent");
      invalidate();
    },
  });

  const accept = useMutation({
    mutationFn: (id: string) => friendService.accept(id),
    onSuccess: () => {
      toast.success("Friend added");
      invalidate();
    },
  });

  const decline = useMutation({
    mutationFn: (id: string) => friendService.decline(id),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (userId: string) => friendService.remove(userId),
    onSuccess: () => {
      toast.success("Removed");
      invalidate();
    },
  });

  const block = useMutation({
    mutationFn: (userId: string) => friendService.block(userId),
    onSuccess: () => {
      toast.success("Blocked");
      invalidate();
    },
  });

  return { sendRequest, sendRequestToUser, accept, decline, remove, block };
}
