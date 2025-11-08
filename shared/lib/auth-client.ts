import { createAuthClient } from "better-auth/react"
export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: process.env.NEXT_PUBLIC_API_URL!
});

export async function signinWIthEmail(email: string, password: string) {
  authClient.signIn.social
  await authClient.signIn.email({
    email,
    password,
    callbackURL: "/",
  }, {
    onError: (ctx) => {
      // Handle the error
      if (ctx.error.status === 403) {
        console.log("Please verify your email address")
      }
      //you can also show the original error message
      console.log(ctx.error.message)
    }
  });
}
export async function signIn(provider: string, callbackURL: string = "/") {
  await authClient.signIn.social({
    provider,
    callbackURL
  })
}

export type User = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null | undefined;
}
export type Session = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  expiresAt: Date;
  token: string;
  ipAddress?: string | null | undefined;
  userAgent?: string | null | undefined;
}