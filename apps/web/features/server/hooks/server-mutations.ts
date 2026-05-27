import axiosClient from "@/shared/lib/axios-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useEditServerMutation(serverId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["server", serverId],
    mutationFn: async ({ name, image }: { name: string; image: string }) => {
      const response = await axiosClient.patch(`/servers/${serverId}`, {
        name,
        image,
      });
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
    mutationFn: async ({ name, image }: { name: string; image: string }) => {
      const response = await axiosClient.post(`/servers`, {
        name,
        image,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserServers"] });
    },
  });
}
