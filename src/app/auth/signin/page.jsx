"use client";
import { useState, useCallback, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";

// Lazy load OAuth buttons to speed up initial page load
const OAuthButtons = dynamic(() => Promise.resolve(OAuthButtonsComponent), {
  loading: () => null, // Don't show loader, buttons load silently
});

function OAuthButtonsComponent() {
  const [loading, setLoading] = useState({ google: false, facebook: false });
  const [error, setError] = useState("");

  const handleOAuthSignIn = useCallback(async (provider) => {
    setLoading((prev) => ({ ...prev, [provider]: true }));
    setError("");
    try {
      await signIn(provider);
    } catch (err) {
      setError("OAuth sign-in failed");
      console.error(err);
      setLoading((prev) => ({ ...prev, [provider]: false }));
    }
  }, []);

  return (
    <>
      {error && (
        <p className="text-red-500 text-sm mb-3 text-center">{error}</p>
      )}
      <button
        onClick={() => handleOAuthSignIn("google")}
        disabled={loading.google}
        className="w-full bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
      >
        {loading.google ? "Signing in..." : "Sign In with Google"}
      </button>
      <button
        onClick={() => handleOAuthSignIn("facebook")}
        disabled={loading.facebook}
        className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2.5 rounded-lg font-medium transition-colors mt-2 disabled:opacity-50"
      >
        {loading.facebook ? "Signing in..." : "Sign In with Facebook"}
      </button>
    </>
  );
}

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Optimized redirect effect
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const { role, subscription } = session.user;
      let target = "/dashboard/guest";

      if (role === "admin") target = "/dashboard/admin";
      else if (role === "student" && subscription === "yes")
        target = "/dashboard/student";

      router.push(target);
    }
  }, [status, session, router]);

  const handleEmailSignIn = useCallback(
    async (e) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      try {
        const result = await signIn("credentials", {
          email: email.trim().toLowerCase(),
          password,
          redirect: false,
        });

        if (result?.error) {
          setError("Invalid email, password, or unverified account.");
          setLoading(false);
          return;
        }

        // Session will update automatically via useSession hook
      } catch (err) {
        setError("An error occurred during sign-in. Please try again.");
        console.error("Sign-in error:", err);
        setLoading(false);
      }
    },
    [email, password]
  );

  // Don't render if already authenticating
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
      </div>

      {/* Sign-in Card */}
      <div className="relative bg-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20 hover:border-white/30 transition-all duration-300">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-300 text-sm">Sign in to your account</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Sign-in Form */}
        <form onSubmit={handleEmailSignIn} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
              disabled={loading}
            />
          </div>

          {/* Password Field */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-200">
                Password
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Forgot?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
              disabled={loading}
            />
          </div>

          {/* Sign-in Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-2.5 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-white/20"></div>
          <span className="text-xs text-gray-400">OR</span>
          <div className="flex-1 h-px bg-white/20"></div>
        </div>

        {/* OAuth Buttons (Lazy loaded) */}
        <OAuthButtons />

        {/* Sign-up Link */}
        <p className="mt-6 text-center text-sm text-gray-300">
          Don't have an account?{" "}
          <Link
            href="/auth/signup"
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
