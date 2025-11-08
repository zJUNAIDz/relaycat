import AuthScreen from "./auth-screen";

const AuthPage = async ({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) => {
  const { login } = (await searchParams);
  return (
    <AuthScreen isLoginParam = { login != undefined} />
  )
}
export default AuthPage