import { API_URL } from "@/shared/lib/constants";
import { UserAuthStatus, UserProfileResponse } from "@/shared/types";
import { authClient, User } from "./auth-client";
import axiosClient from "./axios-client";


const currentProfile = async (): Promise<UserProfileResponse> => {
  try {
    const { data, error } = await authClient.getSession();
    if (error) {
      return { profile: null, status: UserAuthStatus.UNAUTHENTICATED };
    }
    const session = data?.session;
    if (!session) {
      return { profile: null, status: UserAuthStatus.UNAUTHENTICATED };
    }
    const user = data.user;
    if (!user) return { profile: null, status: UserAuthStatus.AUTHENTICATED };
    const { data: { profile } }: { data: { profile: User | null } } = await axiosClient.get(`${API_URL}/profiles/${user.id}`)
    if (!profile) return { profile: null, status: UserAuthStatus.DELETED }
    return { profile, status: UserAuthStatus.AUTHENTICATED };
  } catch (err) {
    console.error("[currentProfile] ", err)
    return { profile: null, status: UserAuthStatus.ERROR }
  }
}
export default currentProfile;