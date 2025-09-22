"use client";
import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [redirectTo, setRedirectTo] = useState("");
  const router = useRouter();

  const { data: session } = useSession(); // ✅ useSession hook

  // ✅ Handle redirect after login using useEffect
  useEffect(() => {
    if (session?.user) {
      const { role, subscription } = session.user;

      let target = "/dashboard/guest";
      if (role === "admin") target = "/dashboard/admin";
      else if (role === "student" && subscription === "yes") target = "/dashboard/student";

      const timer = setTimeout(() => router.push(target), 800);
      return () => clearTimeout(timer);
    }
  }, [session, router]);

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email, password, or unverified account.");
        return;
      }

      // ✅ Set redirect route and wait for useSession to update
      const role = result?.user?.role;
      const subscription = result?.user?.subscription;

      if (role === "admin") setRedirectTo("/dashboard/admin");
      else if (role === "student" && subscription === "yes")
        setRedirectTo("/dashboard/student");
      else setRedirectTo("/dashboard/guest");
    } catch (err) {
      setError("An error occurred during sign-in. Please try again.");
      console.error("Sign-in error:", err);
    }
  };

  const handleOAuthSignIn = async (provider) => {
    setError("");
    try {
      await signIn(provider); // redirect true (default), page will reload & session updates
    } catch (err) {
      setError("OAuth sign-in failed");
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleEmailSignIn}>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          
          {/* Forgot Password Link */}
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
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Sign In
          </button>
        </form>
        <div className="mt-4">
          <button
            onClick={() => handleOAuthSignIn("google")}
            className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 mb-2"
          >
            Sign In with Google
          </button>
          <button
            onClick={() => handleOAuthSignIn("facebook")}
            className="w-full bg-blue-800 text-white py-2 rounded hover:bg-blue-900"
          >
            Sign In with Facebook
          </button>
        </div>
        <p className="mt-4 text-center">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="text-blue-500 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}