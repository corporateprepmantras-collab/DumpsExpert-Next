"use client";
import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUp() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  // ✅ Handle redirect for OAuth users after session is established
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const { role, subscription } = session.user;

      // Determine dashboard based on role/subscription
      let target = "/dashboard/guest";
      if (role === "admin") {
        target = "/dashboard/admin";
      } else if (role === "student" && subscription === "yes") {
        target = "/dashboard/student";
      }

      console.log("[SignUp] OAuth user authenticated, redirecting to:", target);

      // Small delay to ensure session is fully established
      const timer = setTimeout(() => {
        router.push(target);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [status, session, router]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
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
        setLoading(false);
        return;
      }

      console.log("[SignUp] OTP sent successfully");
      setStep(2);
    } catch (err) {
      setError("An error occurred while sending OTP. Please try again.");
      console.error("[SignUp] Send OTP error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      // Step 1: Verify OTP and create user
      const response = await fetch("/api/signup/otp-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || data.error || "OTP verification failed");
        setLoading(false);
        return;
      }

      console.log("[SignUp] OTP verified, user created successfully");

      // Step 2: Sign in with credentials to establish session
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error || "Sign-in failed");
        setLoading(false);
        return;
      }

      console.log("[SignUp] Sign-in successful, waiting for session update...");

      // Step 3: Wait for session to be established, then let useEffect handle redirect
      // Don't manually redirect here - the useEffect will handle it once session is ready
    } catch (err) {
      setError("An error occurred during OTP verification. Please try again.");
      console.error("[SignUp] Verify OTP error:", err);
      setLoading(false);
    }
  };

  const handleOAuthSignUp = async (provider) => {
    setError("");
    setLoading(true);

    try {
      console.log(`[SignUp] Starting ${provider} OAuth sign-up`);

      // ✅ Use redirect: true to let NextAuth handle the full OAuth flow
      // After OAuth completes, user will be redirected back and useEffect will handle final routing
      await signIn(provider, {
        redirect: true,
        callbackUrl: "/dashboard", // Middleware will redirect to appropriate dashboard
      });
    } catch (err) {
      setError("An error occurred during OAuth sign-up. Please try again.");
      console.error(`[SignUp] ${provider} OAuth error:`, err);
      setLoading(false);
    }
  };

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded shadow-md w-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // If already authenticated, show redirecting message
  if (status === "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded shadow-md w-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Redirecting to your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign Up</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
            Processing...
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOTP}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                disabled={loading}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 mb-4 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                disabled={loading}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                disabled={loading}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                disabled={loading}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 mb-4 disabled:bg-green-300 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify OTP & Sign Up"}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={loading}
              className="w-full bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 disabled:cursor-not-allowed"
            >
              Back
            </button>
          </form>
        )}

        <div className="border-t pt-4 mt-4">
          <p className="text-center text-sm text-gray-600 mb-3">
            Or sign up with
          </p>
          <button
            onClick={() => handleOAuthSignUp("google")}
            disabled={loading}
            className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 mb-2 disabled:bg-red-300 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Sign Up with Google"}
          </button>
          <button
            onClick={() => handleOAuthSignUp("facebook")}
            disabled={loading}
            className="w-full bg-blue-800 text-white py-2 rounded hover:bg-blue-900 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Sign Up with Facebook"}
          </button>
        </div>

        <p className="text-center mt-4 text-sm">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-blue-500 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
