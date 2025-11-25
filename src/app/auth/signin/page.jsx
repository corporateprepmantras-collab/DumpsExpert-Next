"use client";
import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  // ✅ Get callback URL from query params
  useEffect(() => {
    if (searchParams.get("callbackUrl")) {
      // Optional: pre-fill or show info about redirect
      console.log(
        "[SignIn] Callback URL detected:",
        searchParams.get("callbackUrl")
      );
    }
  }, [searchParams]);

  // ✅ Handle redirect AFTER session updates
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const { role, subscription } = session.user;
      const callbackUrl = searchParams.get("callbackUrl");

      // Use callback URL if provided, otherwise determine target
      let target = callbackUrl || "/dashboard/guest";

      if (!callbackUrl) {
        // Determine dashboard based on role/subscription
        if (role === "admin") {
          target = "/dashboard/admin";
        } else if (role === "student" && subscription === "yes") {
          target = "/dashboard/student";
        }
      }

      console.log("[SignIn] Redirecting authenticated user to:", target);

      // Small delay to ensure session is fully established
      const timer = setTimeout(() => {
        router.push(target);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [status, session, router, searchParams]);

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // ✅ Call signIn with redirect: false to handle response manually
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result) {
        setError("An unexpected error occurred. Please try again.");
        setIsLoading(false);
        return;
      }

      if (result.error) {
        setError("Invalid email, password, or unverified account.");
        setIsLoading(false);
        console.error("[SignIn] Error:", result.error);
        return;
      }

      if (result.ok) {
        console.log(
          "[SignIn] Credentials sign-in successful, waiting for session update..."
        );
        // ✅ Session will update automatically, useEffect will handle redirect
        // Don't manually redirect - let useSession and useEffect handle it
      }
    } catch (err) {
      setError("An error occurred during sign-in. Please try again.");
      setIsLoading(false);
      console.error("[SignIn] Catch error:", err);
    }
  };

  const handleOAuthSignIn = async (provider) => {
    setError("");
    setIsLoading(true);
    try {
      // ✅ For OAuth, use redirect: true (default) to let NextAuth handle redirect
      // This allows middleware to properly validate the token
      await signIn(provider, {
        redirect: true,
        callbackUrl: searchParams.get("callbackUrl") || "/dashboard/guest",
      });
    } catch (err) {
      setError(`${provider} sign-in failed. Please try again.`);
      setIsLoading(false);
      console.error("[SignIn] OAuth error:", err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>

        {error && (
          <p className="text-red-500 mb-4 p-3 bg-red-50 rounded text-sm">
            {error}
          </p>
        )}

        {isLoading && (
          <p className="text-blue-500 mb-4 p-3 bg-blue-50 rounded text-sm">
            Processing your sign-in...
          </p>
        )}

        <form onSubmit={handleEmailSignIn}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              placeholder="you@example.com"
              required
              disabled={isLoading}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              placeholder="Enter your password"
              required
              disabled={isLoading}
            />
          </div>

          <div className="mb-4 text-right">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-blue-500 hover:text-blue-600 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 space-y-2">
          <button
            onClick={() => handleOAuthSignIn("google")}
            disabled={isLoading}
            className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {isLoading ? "Processing..." : "Sign In with Google"}
          </button>
          <button
            onClick={() => handleOAuthSignIn("facebook")}
            disabled={isLoading}
            className="w-full bg-blue-800 text-white py-2 rounded hover:bg-blue-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {isLoading ? "Processing..." : "Sign In with Facebook"}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            href="/auth/signup"
            className="text-blue-500 hover:underline font-medium"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
