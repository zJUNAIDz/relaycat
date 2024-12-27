import { auth } from "@/auth";
import { db } from "@/lib/db";
import { UserAuthStatus, UserProfileResponse } from "@/types";

/**
 * Fetches the current user's profile from the database based on their session.
 *
 * @async
 * @function currentProfile
 * @returns {Promise<UserProfileResponse>} Resolves to an object containing the user's profile and their authentication status.
 * 
 * @typedef {Object} UserProfileResponse
 * @property {User | null} profile - The user's profile if found, or `null` if not found.
 * @property {"AUTHENTICATED" | "UNAUTHENTICATED" | "NOTFOUND" | "DELETED" | "ERROR"} status - The authentication or error status.
 *
 * @throws Will log an error to the console if an unexpected error occurs during profile retrieval.
 *
 * @example
 * const { profile, status } = await currentProfile();
 * if (status === "AUTHENTICATED") {
 *   console.log("User Profile: ", profile);
 * } else {
 *   console.log("Authentication Status: ", status);
 * }
 */
const currentProfile = async (): Promise<UserProfileResponse> => {
  try {
    const session = await auth();
    const user = session?.user;
    if (!user) return { profile: null, status: UserAuthStatus.AUTHENTICATED };
    console.log("user: ", user);
    const profile = await db.user.findUnique({
      where: {
        id: user.id
      }
    });

    if (!profile) return { profile: null, status: UserAuthStatus.DELETED }
    return { profile, status: UserAuthStatus.AUTHENTICATED };
  } catch (err) {
    console.error("[currentProfile] ", err)
    return { profile: null, status: UserAuthStatus.ERROR }
  }
}
export default currentProfile;