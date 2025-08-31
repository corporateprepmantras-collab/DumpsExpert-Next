"use client";
import { useState } from "react";
import { signIn, getServerSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

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
        setError(result.error || "Sign-in failed");
        if (result.error.includes("not found") || result.error.includes("not verified")) {
          router.push("/auth/signup");
        }
        return;
      }

      await signIn(undefined, { redirect: false });
    router.push("/dashboard");
    } catch (err) {
      setError("An error occurred during sign-in. Please try again.");
      console.error("Sign-in error:", err);
    }
  };const handleOAuthSignIn = async (provider) => {
  setError("");
  try {
    const result = await signIn(provider, { redirect: false });

    if (result?.error) {
      setError("OAuth sign-in failed");
      return;
    }

    // Wait until session is updated
    const session = await getServerSession();

    if (!session?.user) {
      setError("Could not load user session. Please refresh and try again.");
      return;
    }

    const { role, subscription } = session.user;

    if (role === "admin") {
      router.push("/dashboard/admin");
    } else if (role === "student" && subscription === "yes") {
      router.push("/dashboard/student");
    } else {
      router.push("/dashboard/guest");
    }
  } catch (err) {
    setError("An error occurred during OAuth sign-in. Please try again.");
    console.error("OAuth sign-in error:", err);
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
          Don’t have an account?{" "}
          <Link href="/auth/signup" className="text-blue-500 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}