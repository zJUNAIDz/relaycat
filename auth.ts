
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "./lib/db"


function getCredentials() {
  const clientId = process.env.AUTH_GOOGLE_ID!;
  const clientSecret = process.env.AUTH_GOOGLE_SECRET!;
  if (!clientId || !clientId.length) {
    throw new Error(`Google Client Id missing: ${clientId}`)
  }
  if (!clientSecret || !clientSecret.length) {
    throw new Error(`Google Client Secret missing: ${clientSecret}`)
  }
  return { clientId, clientSecret };
}



export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [Google({
    clientId: getCredentials().clientId,
    clientSecret: getCredentials().clientSecret,
  })],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      //* Try getting user from db if exist
      const existingUserInDB = await db.user.findUnique({
        where: {
          id: user.id
        }
      }) as User || null;
      if (!existingUserInDB) {
        token.id = user.id;
        console.log("TOKEN Value: ", token)
        return token;
      }
      return {
        id: existingUserInDB.id,
        name: existingUserInDB.name,
        email: existingUserInDB.email,
        image: existingUserInDB.image,
      }
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
      return "/"
    }
  }
})