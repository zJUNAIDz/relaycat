import axiosClient from "@/shared/lib/axios-client";
import type { ProfileWithUser, UpdateProfileInput } from "@repo/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const profileKeys = {
  me: ["profile", "me"] as const,
  byUser: (userId: string) => ["profile", userId] as const,
};

/** Current user's profile (auto-created server-side on first fetch). */
export function useMyProfile() {
  return useQuery({
    queryKey: profileKeys.me,
    queryFn: async () => {
      const { data } = await axiosClient.get<ProfileWithUser>("/profiles/me");
      return data;
    },
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["updateProfile"],
    mutationFn: async (payload: UpdateProfileInput) => {
      const { data } = await axiosClient.patch<ProfileWithUser>(
        "/profiles/me",
        payload,
      );
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.me, data);
      queryClient.invalidateQueries({ queryKey: profileKeys.me });
    },
  });
}
