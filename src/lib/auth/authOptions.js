// lib/auth/authOptions.js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import { connectMongoDB, clientPromise } from "@/lib/mongo";
import UserInfo from "@/models/userInfoSchema";
import bcrypt from "bcryptjs";

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectMongoDB();

        const user = await UserInfo.findOne({ email: credentials.email }).select("+password");
        if (!user) throw new Error("Invalid email or password");
        if (!user.isVerified) throw new Error("User not verified");

        const validPassword = await bcrypt.compare(credentials.password, user.password);
        if (!validPassword) throw new Error("Invalid email or password");

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name || user.email.split("@")[0],
          role: user.role || "guest",
          subscription: user.subscription || "no",
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: { params: { prompt: "consent", access_type: "offline", response_type: "code" } },
    }),
  ],
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.subscription = user.subscription;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.subscription = token.subscription;
      return session;
    },
    async signIn({ user, account }) {
      // Optional: Create UserInfo record on Google login
      if (account?.provider === "google") {
        await connectMongoDB();
        const exists = await UserInfo.findOne({ email: user.email });
        if (!exists) {
          await UserInfo.create({
            email: user.email,
            name: user.name,
            provider: "google",
            isVerified: true,
            role: "guest",
            subscription: "no",
          });
        }
      }
      return true;
    },
  },
  pages: { signIn: "/auth/signin", error: "/auth/error" },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV !== "production",
};

export default NextAuth(authOptions);
