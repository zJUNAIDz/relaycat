import { getCurrentUser } from "@/shared/utils/server";
import AuthScreen from "./auth-screen";

const AuthPage = async ({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) => {
  const { login } = (await searchParams);
  const isAuthenticated = await getCurrentUser()
  return (
    <AuthScreen isAuthenticated={!!isAuthenticated} isLoginParam={login != undefined} />
  )
}
export default AuthPage