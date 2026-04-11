import { authClient } from "@/shared/lib/auth-client";
import { headers } from "next/headers";

export const getCurrentUser = async () => {
  try {
    const { data, error } = await authClient.getSession({
      fetchOptions: {
        headers: await headers(),
      },
    });
    // console.log({ data, error });
    if (error) return null;
    return data?.user || null;
  } catch (err) {
    console.warn(
      "getCurrentUser: authClient.getSession() failed during build/prerender",
      err,
    );
    return null;
  }
};
