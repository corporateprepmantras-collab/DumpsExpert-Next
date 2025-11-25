// app/auth/signin/page.jsx
"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LoadingScreen from "../LoadingScreen";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loadingState, setLoadingState] = useState(null);
  const router = useRouter();

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setLoadingState("email");

    try {
      const result = await signIn("credentials", {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        setLoadingState(null);
        return;
      }

      setLoadingState("redirecting");
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.push("/dashboard");
    } catch (err) {
      setError("An error occurred during sign-in. Please try again.");
      console.error("Sign-in error:", err);
      setLoadingState(null);
    }
  };

  const handleOAuthSignIn = async (provider) => {
    setError("");
    setLoadingState(provider);

    try {
      await signIn(provider, { callbackUrl: "/dashboard" });
    } catch (err) {
      setError(`Sign in with ${provider} failed. Please try again.`);
      console.error("OAuth error:", err);
      setLoadingState(null);
    }
  };

  if (loadingState === "redirecting") {
    return <LoadingScreen />;
  }

  const isLoading = loadingState !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-7xl">
        {/* Left side - Illustration/Branding (hidden on mobile) */}
        <div className="hidden lg:flex flex-col justify-center items-center">
          <div className="relative w-full max-w-md">
            {/* Gradient background shapes */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-3xl blur-3xl opacity-20"></div>

            {/* Main illustration container */}
            <div className="relative bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl p-12 shadow-2xl">
              <svg
                className="w-full h-auto"
                viewBox="0 0 400 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Decorative elements */}
                <circle
                  cx="200"
                  cy="120"
                  r="50"
                  fill="url(#grad1)"
                  opacity="0.8"
                />
                <rect
                  x="100"
                  y="200"
                  width="200"
                  height="120"
                  rx="20"
                  fill="url(#grad2)"
                  opacity="0.7"
                />
                <path
                  d="M150 280 Q200 250 250 280"
                  stroke="url(#grad3)"
                  strokeWidth="3"
                  fill="none"
                />

                <defs>
                  <linearGradient
                    id="grad1"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                  <linearGradient
                    id="grad2"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#60A5FA" />
                    <stop offset="100%" stopColor="#A78BFA" />
                  </linearGradient>
                  <linearGradient
                    id="grad3"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#EC4899" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Branding text */}
            <div className="mt-8 text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-600 text-lg">
                Secure access to your account
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Sign In Form */}
        <div className="flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto lg:mx-0">
            {/* Mobile header */}
            <div className="lg:hidden mb-8 text-center">
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Sign In
              </h1>
              <p className="text-gray-600">Welcome back to your account</p>
            </div>

            {/* Form card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-8">
              <h2 className="hidden lg:block text-3xl font-bold text-gray-900 mb-8">
                Sign In
              </h2>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-6 text-sm sm:text-base">
                  {error}
                </div>
              )}

              <form onSubmit={handleEmailSignIn} className="space-y-5">
                <div>
                  <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm sm:text-base"
                    placeholder="you@example.com"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm sm:text-base"
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                </div>

                <div className="text-right pt-1">
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-2.5 sm:py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition duration-200 text-sm sm:text-base"
                >
                  {loadingState === "email" ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="mt-8 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-gray-500 font-medium">
                      Or continue with
                    </span>
                  </div>
                </div>
              </div>

              {/* OAuth Button */}
              <button
                onClick={() => handleOAuthSignIn("google")}
                disabled={isLoading}
                className="w-full bg-white border-2 border-gray-200 text-gray-700 font-semibold py-2.5 sm:py-3 rounded-lg hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center gap-3 text-sm sm:text-base"
              >
                {loadingState === "google" ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in with Google...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Sign In with Google
                  </>
                )}
              </button>

              {/* Sign Up Link */}
              <p className="mt-8 text-center text-sm sm:text-base text-gray-600">
                Don't have an account?{" "}
                <Link
                  href="/auth/signup"
                  className="text-blue-600 hover:text-blue-700 font-semibold transition"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
