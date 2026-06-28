import axiosClient from "@/shared/lib/axios-client";
import { ChannelType } from "@/shared/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * React Query mutations for the channel feature. Channels always live under a
 * server, so every mutation invalidates the `["server"]` query that drives the
 * sidebar/channel list.
 */

export type ChannelFormValues = {
  name: string;
  type: ChannelType;
};

export type CreateChannelPayload = ChannelFormValues & { serverId: string };

export function useCreateChannelMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["createChannel"],
    mutationFn: (payload: CreateChannelPayload) =>
      axiosClient.post("/channels", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["server"] });
    },
  });
}

export function useEditChannelMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["editChannel"],
    mutationFn: ({
      channelId,
      data,
    }: {
      channelId: string;
      data: ChannelFormValues;
    }) => axiosClient.patch(`/channels/${channelId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["server"] });
    },
  });
}

export function useDeleteChannelMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["deleteChannel"],
    mutationFn: (channelId: string) =>
      axiosClient.delete(`/channels/${channelId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["server"] });
    },
  });
}
