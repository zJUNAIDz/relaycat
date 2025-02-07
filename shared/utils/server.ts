import { auth } from "@/auth";

export const getAuthTokenOnServer = async () => {
  const session = await auth()
  const token = session?.apiToken
  if (token) return token
  throw new Error("No token found")
};
