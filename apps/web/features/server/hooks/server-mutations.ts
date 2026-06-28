import { serverService } from "@/features/server/server-service";
import axiosClient from "@/shared/lib/axios-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type ServerMutationPayload = {
  name: string;
  image: string;
  description?: string | null;
  isPublic?: boolean;
};

export function useEditServerMutation(serverId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["server", serverId],
    mutationFn: async (payload: ServerMutationPayload) => {
      const response = await axiosClient.patch(`/servers/${serverId}`, payload);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["server", serverId] });
      queryClient.invalidateQueries({ queryKey: ["currentUserServers"] });
    },
  });
}
export function useCreateServerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["createServer"],
    mutationFn: async (payload: ServerMutationPayload) => {
      const response = await axiosClient.post(`/servers`, payload);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserServers"] });
    },
  });
}
export function useDeleteServerMutation(serverId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["deleteServer", serverId],
    mutationFn: async () => {
      const response = await axiosClient.delete(`/servers/${serverId}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserServers"] });
    },
  });
}

/** Rotate a server's invite code, resolving to the updated server. */
export function useRegenerateInviteMutation() {
  return useMutation({
    mutationKey: ["regenerateInvite"],
    mutationFn: (serverId: string) =>
      serverService.regenerateInviteCode(serverId),
  });
}
