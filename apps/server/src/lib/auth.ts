import { db } from "@/db";
import * as authSchema from "@/db/schema/auth-schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { logger } from "./logger";
import { mailService } from "./mail";
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
      mailService.sendPasswordResetEmail({
        to: [user.email],
        resetLink: url,
      });
      logger.info({ user, url, request }, "password reset requested");
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
      await mailService.sendVerificationEmail({
        to: [data.user.email],
        verificationLink: data.url,
      });
      logger.info({ data, request }, "verification email sent");
    },
    afterEmailVerification: async (user, request) => {
      const baseUrl = process.env.CLIENT_URL || "http://localhost:3000";
      await mailService.sendWelcomeEmail({
        to: [user.email],
        username: user.name || "User",
        actionUrl: `${baseUrl}/channels/me`,
        loginUrl: `${baseUrl}/login`,
        guideUrl: `${baseUrl}/guide`,
      });
      logger.info({ user, request }, "logged in successfully");
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
