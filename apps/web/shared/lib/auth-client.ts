import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: process.env.NEXT_PUBLIC_API_URL!,
});

export async function signinWithEmail(
  email: string,
  password: string,
  rememberMe: boolean = false,
) {
  return await authClient.signIn.email(
    {
      email,
      password,
      rememberMe,
      callbackURL: "/",
    },
    {
      onError: (ctx) => {
        // Handle the error
        if (ctx.error.status === 403) {
          throw new Error("Please verify your email address");
        }
        //you can also show the original error message
        throw new Error(ctx.error.message);
      },
    },
  );
}

export async function signupWithEmail(
  email: string,
  password: string,
  name: string,
) {
  return await authClient.signUp.email(
    {
      email,
      password,
      name,
      callbackURL: "/",
    },
    {
      onError: (ctx) => {
        throw new Error(ctx.error.message);
      },
    },
  );
}

export async function signIn(provider: string, callbackURL: string = "/") {
  await authClient.signIn.social({
    provider,
    callbackURL,
  });
}

export type User = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null;
};
export type Session = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  expiresAt: Date;
  token: string;
  ipAddress?: string | null | undefined;
  userAgent?: string | null | undefined;
};
