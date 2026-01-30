import { db } from "@/db";
import * as authSchema from "@/db/schema/auth-schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { sendPasswordResetEmail, sendVerificationEmail, sendWelcomeEmail } from "./mail";
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),
  trustedOrigins: process.env.AUTH_TRUSTED_ORIGINS
    ? process.env.AUTH_TRUSTED_ORIGINS.split(",")
    : ["http://localhost:3000"],
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, token, url }, request) => {
      sendPasswordResetEmail(user, url);
      console.log(`password reset for user: ${user.email}\n url:${url}`);
    },
  },
  socialProviders: {
    github: {
      prompt: "select_account",
      clientId: process.env.AUTH_GITHUB_ID as string,
      clientSecret: process.env.AUTH_GITHUB_SECRET as string,
    },
    google: {
      prompt: "select_account",
      clientId: process.env.AUTH_GOOGLE_ID as string,
      clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
    },
  },
  emailVerification: {
    sendVerificationEmail: async (data, request) => {
      sendVerificationEmail(data.user, data.url);
      console.log(data);
    },
    afterEmailVerification: async (user, request) => {
      sendWelcomeEmail(user);
      console.log(`${user.email} logged in successfully`);
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day (every 1 day, the session expiration is updated to current date + expiresIn duration)
  },
  development: process.env.NODE_ENV !== "production",
  advanced: {
    cookiePrefix: "auth",
    useSecureCookies: true,
  },
});
