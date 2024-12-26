import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./lib/db";
import { JWTOptions } from "next-auth/jwt";
import { SignJWT } from "jose";

function getCredentials() {
  const clientId = process.env.AUTH_GOOGLE_ID!;
  const clientSecret = process.env.AUTH_GOOGLE_SECRET!;
  if (!clientId || !clientId.length) {
    throw new Error(`Google Client Id missing: ${clientId}`);
  }
  if (!clientSecret || !clientSecret.length) {
    throw new Error(`Google Client Secret missing: ${clientSecret}`);
  }
  return { clientId, clientSecret };
}

async function setToken(user: User) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
  const apiToken = await new SignJWT({
    user
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
  return apiToken;
}

export const {
  handlers,
  signIn,
  signOut,
  auth,
} = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    Google({
      clientId: getCredentials().clientId,
      clientSecret: getCredentials().clientSecret,
    }),
  ],
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  jwt: {
    secret: process.env.JWT_SECRET! || "",
    maxAge: 60 * 60 * 24 * 30,
  } as Partial<JWTOptions>,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const apiToken = await setToken(user as User);
        token.apiToken = apiToken;

        //* This block runs when the user signs in for the first time.
        token.sub = user.id as string;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
      }

      return token;
    },
    async session({ token, session }) {
      if (token) {
        session.user.id = token.sub as string;
        session.user.name = token.name || "No Name";
        session.user.email = token.email || "No Email";
        session.user.image = token.picture || "No Picture";
        session.apiToken = token.apiToken as string;
      }
      return session;
    },
    redirect() {
      return "/";
    },
    async signIn(params) {
      return true;
    },
  },
});
