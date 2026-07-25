import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import UserOnboarding from "@/models/UserOnboarding";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await dbConnect();
        const existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          const newUser = await User.create({
            name: user.name ?? "",
            email: user.email ?? "",
            photoUrl: user.image || "",
            dailyGoal: 5,
            currentStreak: 0,
            longestStreak: 0,
          });
          await UserOnboarding.create({
            userId: newUser._id,
            isComplete: false,
            completedSteps: [],
            dailyGoal: 5,
          });
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      // On sign-in: hydrate token with DB fields
      if (user) {
        await dbConnect();
        const dbUser = await User.findOne({ email: user.email });
        if (dbUser) {
          token.userId = dbUser._id.toString();
          token.photoUrl = dbUser.photoUrl;
          token.termsAcceptedVersion = dbUser.termsAcceptedVersion ?? null;
        }
      }
      // On session update (e.g. after accept-terms API call)
      if (trigger === "update" && session?.termsAcceptedVersion) {
        token.termsAcceptedVersion = session.termsAcceptedVersion;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.userId) {
        (session.user as any).id = token.userId as string;
        (session.user as any).photoUrl = token.photoUrl as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
  pages: {
    signIn: "/",
  },
};

export default authOptions;
