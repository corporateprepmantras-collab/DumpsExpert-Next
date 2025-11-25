// app/auth/signup/page.jsx
"use client";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LoadingScreen from "../LoadingScreen";

export default function SignUp() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loadingState, setLoadingState] = useState(null);
  const [resendCountdown, setResendCountdown] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(
        () => setResendCountdown(resendCountdown - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setLoadingState("sending-otp");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      setLoadingState(null);
      return;
    }

    try {
      const response = await fetch("/api/signup/otp-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || data.error || "Failed to send OTP");
        if (
          data.message?.includes("already exists") ||
          data.error?.includes("already exists")
        ) {
          router.push("/auth/signin");
        }
        setLoadingState(null);
        return;
      }

      setStep(2);
      setResendCountdown(60);
      setLoadingState(null);
    } catch (err) {
      setError("An error occurred while sending OTP. Please try again.");
      console.error("Send OTP error:", err);
      setLoadingState(null);
    }
  };

  const handleResendOTP = async (e) => {
    e.preventDefault();
    if (resendCountdown > 0) return;

    setError("");
    setLoadingState("sending-otp");

    try {
      const response = await fetch("/api/signup/otp-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to resend OTP");
        setLoadingState(null);
        return;
      }

      setResendCountdown(60);
      setOtp("");
      setError("");
      setLoadingState(null);
    } catch (err) {
      setError("An error occurred while resending OTP. Please try again.");
      console.error("Resend OTP error:", err);
      setLoadingState(null);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setLoadingState("verifying");

    if (!name.trim()) {
      setError("Name is required");
      setLoadingState(null);
      return;
    }

    if (!password) {
      setError("Password is required");
      setLoadingState(null);
      return;
    }

    try {
      const response = await fetch("/api/signup/otp-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || data.error || "OTP verification failed");
        setLoadingState(null);
        return;
      }

      setLoadingState("redirecting");

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setLoadingState(null);
        setError(result.error || "Sign-in failed");
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.push(data.redirect || "/dashboard");
    } catch (err) {
      setLoadingState(null);
      setError("An error occurred during OTP verification. Please try again.");
      console.error("Verify OTP error:", err);
    }
  };

  const handleOAuthSignUp = async (provider) => {
    setLoadingState(provider);
    try {
      const result = await signIn(provider, { callbackUrl: "/dashboard" });
      if (result?.error) {
        setLoadingState(null);
        setError(`Sign up with ${provider} failed. Please try again.`);
      }
    } catch (err) {
      setLoadingState(null);
      setError("An error occurred during OAuth sign-up. Please try again.");
      console.error("OAuth signup error:", err);
    }
  };

  if (loadingState === "redirecting") {
    return <LoadingScreen />;
  }

  const isLoading = loadingState !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-7xl">
        {/* Left side - Illustration (hidden on mobile) */}
        <div className="hidden lg:flex flex-col justify-center items-center">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-3xl blur-3xl opacity-20"></div>

            <div className="relative bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-12 shadow-2xl">
              <svg
                className="w-full h-auto"
                viewBox="0 0 400 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="200"
                  cy="100"
                  r="45"
                  fill="url(#grad4)"
                  opacity="0.8"
                />
                <path
                  d="M80 180 L320 180 M80 220 L320 220 M80 260 L320 260"
                  stroke="url(#grad5)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <rect
                  x="100"
                  y="300"
                  width="200"
                  height="60"
                  rx="15"
                  fill="url(#grad6)"
                  opacity="0.7"
                />

                <defs>
                  <linearGradient
                    id="grad4"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#A855F7" />
                    <stop offset="100%" stopColor="#EC4899" />
                  </linearGradient>
                  <linearGradient
                    id="grad5"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#D946EF" />
                    <stop offset="100%" stopColor="#F43F5E" />
                  </linearGradient>
                  <linearGradient
                    id="grad6"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#A855F7" />
                    <stop offset="100%" stopColor="#EC4899" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="mt-8 text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Join Us Today
              </h1>
              <p className="text-gray-600 text-lg">
                Create your account in minutes
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Sign Up Form */}
        <div className="flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto lg:mx-0">
            {/* Mobile header */}
            <div className="lg:hidden mb-8 text-center">
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Sign Up
              </h1>
              <p className="text-gray-600">Create your account</p>
            </div>

            {/* Form card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
              <h2 className="hidden lg:block text-3xl font-bold text-gray-900 mb-1">
                Create Account
              </h2>
              <p className="hidden lg:block text-gray-600 text-sm mb-8">
                Join our community today
              </p>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-6 text-sm sm:text-base">
                  {error}
                </div>
              )}

              {/* Progress indicator */}
              <div className="mb-8 flex items-center gap-2">
                <div
                  className={`h-2 flex-1 rounded-full transition ${
                    step === 1 ? "bg-purple-600" : "bg-green-600"
                  }`}
                ></div>
                <div
                  className={`h-2 flex-1 rounded-full transition ${
                    step === 2 ? "bg-purple-600" : "bg-gray-200"
                  }`}
                ></div>
              </div>

              {step === 1 ? (
                <form onSubmit={handleSendOTP} className="space-y-5">
                  <div>
                    <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-sm sm:text-base"
                      placeholder="you@example.com"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-2.5 sm:py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition duration-200 text-sm sm:text-base"
                  >
                    {loadingState === "sending-otp" ? (
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
                        Sending OTP...
                      </span>
                    ) : (
                      "Send OTP"
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div>
                    <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-sm sm:text-base"
                      placeholder="John Doe"
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
                      className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-sm sm:text-base"
                      placeholder="••••••••"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                      maxLength="6"
                      className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-sm sm:text-base text-center tracking-widest font-mono"
                      placeholder="000000"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-2.5 sm:py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition duration-200 text-sm sm:text-base"
                  >
                    {loadingState === "verifying" ? (
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
                        Verifying...
                      </span>
                    ) : (
                      "Create Account"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className={`w-full py-2.5 sm:py-3 rounded-lg border-2 font-semibold transition text-sm sm:text-base ${
                      resendCountdown > 0
                        ? "bg-gray-50 text-gray-500 border-gray-300 cursor-not-allowed"
                        : "bg-white text-purple-600 border-purple-300 hover:bg-purple-50 hover:border-purple-400"
                    }`}
                    disabled={resendCountdown > 0 || isLoading}
                  >
                    {resendCountdown > 0
                      ? `Resend Code in ${resendCountdown}s`
                      : loadingState === "sending-otp"
                      ? "Sending..."
                      : "Resend Code"}
                  </button>
                </form>
              )}

              {/* Divider */}
              {step === 1 && (
                <>
                  <div className="mt-8 mb-6">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-3 bg-white text-gray-500 font-medium">
                          Or sign up with
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOAuthSignUp("google")}
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
                        Signing up...
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
                        Sign Up with Google
                      </>
                    )}
                  </button>
                </>
              )}

              {/* Sign In Link */}
              <p className="mt-8 text-center text-sm sm:text-base text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/auth/signin"
                  className="text-purple-600 hover:text-purple-700 font-semibold transition"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
