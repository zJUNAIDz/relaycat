import { db } from "@/db";
import * as authSchema from "@/db/schema/auth-schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { logger } from "./logger";
import { mailService } from "./mail";

const isProduction = process.env.NODE_ENV === "production";

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

const trustedOrigins = process.env.AUTH_TRUSTED_ORIGINS
  ? process.env.AUTH_TRUSTED_ORIGINS.split(",").map((origin) => origin.trim())
  : [CLIENT_URL];

export const auth = betterAuth({
  // Where Better Auth is served from. Used to build callback/cookie domains.
  baseURL: process.env.BETTER_AUTH_URL || process.env.AUTH_URL,
  // Signing/encryption key. Falls back so existing deployments keep working.
  secret:
    process.env.BETTER_AUTH_SECRET ||
    process.env.AUTH_SECRET ||
    process.env.JWT_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
    // Block sign-in until the email address is verified. This makes the
    // client-side 403 ("please verify your email") handling actually fire.
    requireEmailVerification: true,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      // Don't await mail delivery: keeps response timing constant (avoids
      // leaking whether an account exists) and never blocks the request.
      mailService
        .sendPasswordResetEmail({ to: [user.email], resetLink: url })
        .catch((error) =>
          logger.error({ error, email: user.email }, "failed to send reset email"),
        );
      logger.info({ email: user.email }, "password reset requested");
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
  account: {
    accountLinking: {
      // Let users who signed up with email later sign in with Google/GitHub
      // (same verified email) instead of hitting OAuthAccountNotLinked.
      enabled: true,
      trustedProviders: ["google", "github"],
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, token }) => {
      // Point the verification link at our branded web page, which then calls
      // the Better Auth verify-email endpoint with this token.
      const verificationLink = `${CLIENT_URL}/auth/verify-email?token=${encodeURIComponent(token)}`;
      mailService
        .sendVerificationEmail({ to: [user.email], verificationLink })
        .catch((error) =>
          logger.error(
            { error, email: user.email },
            "failed to send verification email",
          ),
        );
      logger.info({ email: user.email }, "verification email sent");
    },
    afterEmailVerification: async (user) => {
      mailService
        .sendWelcomeEmail({
          to: [user.email],
          username: user.name || "User",
          actionUrl: `${CLIENT_URL}/channels/me`,
          loginUrl: `${CLIENT_URL}/auth?login`,
          guideUrl: `${CLIENT_URL}/guide`,
        })
        .catch((error) =>
          logger.error({ error, email: user.email }, "failed to send welcome email"),
        );
      logger.info({ email: user.email }, "email verified");
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh expiry once per day
  },
  advanced: {
    cookiePrefix: "auth",
    // Secure cookies only in production — over http://localhost a Secure
    // cookie is silently dropped, which would break the session in dev.
    useSecureCookies: isProduction,
    // In production the web app and API are typically on different
    // (sub)domains, so cookies must be SameSite=None; Secure to be sent
    // on cross-site credentialed requests.
    ...(isProduction
      ? {
          defaultCookieAttributes: {
            sameSite: "none" as const,
            secure: true,
            partitioned: true,
          },
        }
      : {}),
  },
});
