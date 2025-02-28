import { auth } from "@/auth";

export const getAuthTokenOnServer = async () => {
  const session = await auth()
  const token = session?.apiToken
  if (token) return token
  throw new Error("No token found")
};
export const getCurrentUser = async () => {
  const session = await auth()
  if (!session) return null
  return session.user
}
