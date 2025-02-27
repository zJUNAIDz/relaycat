
import AuthErrorComponent from './auth-error';

export default async function AuthErrorPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const error = (await searchParams).error;
  console.log("Error search param: ", error)
  const getErrorMessage = () => {
    switch (error) {
      case 'CredentialsSignin':
        return 'Invalid email or password';
      case 'OAuthAccountNotLinked':
        return 'Account already exists with different provider';
      default:
        return 'An unexpected error occurred';
    }
  };

  return (
    <AuthErrorComponent getErrorMessage={getErrorMessage} />
  );
}