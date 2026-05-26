import axiosClient from "@/shared/lib/axios-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useServerMutation(serverId: string) {
  const queryClient = useQueryClient();
  const editServerMutation = useMutation({
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
  return { editServerMutation };
}
