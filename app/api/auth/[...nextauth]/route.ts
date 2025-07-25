import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/app/lib/mongodb-client";
import dbConnect from "@/app/lib/mongodb";
import User from "@/app/models/User";

const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(",") || [];

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      if (token.email) {
        const isAdmin = ADMIN_EMAILS.includes(token.email);
        await dbConnect();
        const dbUser = await User.findOne({ email: token.email });
        if (dbUser) {
          if (isAdmin && dbUser.role !== "admin") {
            dbUser.role = "admin";
            await dbUser.save();
          }
          token.role = dbUser.role;
        } else {
          token.role = isAdmin ? "admin" : "user";
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        // @ts-expect-error
        session.user.role = token.role;
        // @ts-expect-error
        session.user.id = token.id;
      }
      return session;
    },
  },

  pages: {
    signIn: "/",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
