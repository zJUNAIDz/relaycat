import { PrismaAdapter } from "@auth/prisma-adapter";
import { SignJWT } from "jose";
import NextAuth from "next-auth";
import { JWTOptions } from "next-auth/jwt";
import Google from "next-auth/providers/google";
import { db } from "@/shared/lib/db";
import { getEnv } from "@/shared/utils/env";

const clientId = getEnv("AUTH_GOOGLE_ID");
const clientSecret = getEnv("AUTH_GOOGLE_SECRET");

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
      clientId: clientId,
      clientSecret: clientSecret,
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
        //* This block runs when the user signs in for the first time.
        const apiToken = await setToken(user as User);

        token.apiToken = apiToken;
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
      return "/setup";
    },
    async signIn(params) {
      return true;
    },
  },
});
