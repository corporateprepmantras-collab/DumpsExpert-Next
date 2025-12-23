import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";

// 🔥 CRITICAL FIX FOR APP ROUTER + VERCEL CACHE
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const handler = NextAuth(authOptions);

export const GET = handler;
export const POST = handler;
