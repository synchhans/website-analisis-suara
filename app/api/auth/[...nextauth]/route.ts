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
      return token;
    },

    async session({ session, token }) {
      if (session.user?.email) {
        const isAdmin = ADMIN_EMAILS.includes(session.user.email);

        await dbConnect();
        const dbUser = await User.findOne({ email: session.user.email });

        if (dbUser) {
          if (isAdmin && dbUser.role !== "admin") {
            console.log(`Mempromosikan ${dbUser.email} menjadi admin...`);
            dbUser.role = "admin";
            await dbUser.save();
          }

          // @ts-ignore
          session.user.role = dbUser.role;
          // @ts-ignore
          session.user.id = dbUser._id.toString();
        }
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
