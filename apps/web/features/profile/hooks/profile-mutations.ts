import axiosClient from "@/shared/lib/axios-client";
import type { ProfileWithUser, UpdateProfileInput } from "@repo/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const profileKeys = {
  me: ["profile", "me"] as const,
  byUser: (userId: string) => ["profile", userId] as const,
};

/**
 * Another user's full profile (banner, bio, pronouns, status, links, …).
 * Fetched lazily — pass `enabled: false` until the card is actually opened so
 * member rosters don't fire a request per row. Backfilled server-side, so it
 * resolves for every member.
 */
export function useUserProfile(userId: string, enabled = true) {
  return useQuery({
    queryKey: profileKeys.byUser(userId),
    queryFn: async () => {
      const { data } = await axiosClient.get<ProfileWithUser>(
        `/profiles/${userId}`,
      );
      return data;
    },
    enabled: !!userId && enabled,
    staleTime: 5 * 60 * 1000,
  });
}

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
