import axiosClient from "@/shared/lib/axios-client";
import type {
  ProfileWithUser,
  UpdateProfileInput,
  UsernameAvailability,
} from "@repo/types";

/** Network boundary for onboarding. Kept framework-free so the wizard machine
 * (and its tests) never reach for React or axios directly. */
export const onboardingService = {
  async getMyProfile(): Promise<ProfileWithUser> {
    const { data } = await axiosClient.get<ProfileWithUser>("/profiles/me");
    return data;
  },

  /** Advisory check — the PATCH still 409s if someone claims the handle first. */
  async checkUsername(
    username: string,
    signal?: AbortSignal,
  ): Promise<UsernameAvailability> {
    const { data } = await axiosClient.get<UsernameAvailability>(
      "/profiles/username-available",
      { params: { username }, signal },
    );
    return data;
  },

  async updateProfile(payload: UpdateProfileInput): Promise<ProfileWithUser> {
    const { data } = await axiosClient.patch<ProfileWithUser>(
      "/profiles/me",
      payload,
    );
    return data;
  },

  async completeOnboarding(): Promise<ProfileWithUser> {
    const { data } = await axiosClient.post<ProfileWithUser>(
      "/profiles/me/complete-onboarding",
    );
    return data;
  },
};
