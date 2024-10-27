import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./lib/db";
import { JWTOptions } from "next-auth/jwt";

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

export const {
  handlers: { GET, POST },
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
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  jwt: {
    secret: process.env.JWT_SECRET! || "",
    maxAge: 60 * 60 * 24 * 30,
  } as Partial<JWTOptions>,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        //* This block runs when the user signs in for the first time.
        token.sub = user.id as string;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
      }

      //* Try getting user from db if exist
      // const existingUserInDB =
      //   ((await db.user.findUnique({
      //     where: {
      //       id: (token.sub as string) || undefined,
      //       email: token.email || undefined,
      //     },
      //   })) as User) || null;
      // if (!existingUserInDB) {
      //   return token;
      // }
      // return {
      //   id: existingUserInDB.id,
      //   name: existingUserInDB.name,
      //   email: existingUserInDB.email,
      //   image: existingUserInDB.image,
      // };

      return token;
    },
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name || "No Name";
        session.user.email = token.email || "No Email";
        session.user.image = token.picture || "No Picture";
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
