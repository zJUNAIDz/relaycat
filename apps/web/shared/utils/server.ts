import { authClient } from "@/shared/lib/auth-client";

export const getCurrentUser = async () => {
  try {
    const { data, error } = await authClient.getSession();
    console.log({ shouBeError: data });
    if (error) return null;
    return data?.user || null;
  } catch (err) {
    console.warn(
      "getCurrentUser: authClient.getSession() failed during build/prerender",
      err
    );
    return null;
  }
};
