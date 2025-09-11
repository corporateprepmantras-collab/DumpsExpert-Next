"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LogOut, User, Lock, ShoppingBag, AlertCircle } from "lucide-react";
import ExamDumpsSlider from "@/landingpage/ExamDumpsSlider";

export default function GuestDashboard() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      const fetchUserData = async () => {
        try {
          setLoading(true);
          const response = await fetch("/api/user/me");
          if (!response.ok) {
            if (response.status === 404) {
              throw new Error("User profile not found. Please try signing out and signing in again.");
            } else if (response.status === 401) {
              throw new Error("Unauthorized: Please sign in again.");
            }
            throw new Error(`Failed to fetch user data: ${response.statusText}`);
          }
          const data = await response.json();
          setUserData(data);
          setError(null);
        } catch (err) {
          console.error("Error fetching user data:", err);
          if (retryCount < 2) {
            setTimeout(() => {
              setRetryCount(retryCount + 1);
            }, 1000);
          } else {
            setError(err.message);
          }
        } finally {
          setLoading(false);
        }
      };
      fetchUserData();
    } else if (status === "unauthenticated") {
      setError("Please sign in to view your dashboard");
      setLoading(false);
    }
  }, [status, session, retryCount]);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Logout failed:", error);
      setError("Failed to log out. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="p-6 min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">{error || "No user data available"}</p>
            <Link href="/auth/signin">
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                Go to Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Determine profile image: prioritize session.user.image (Google) over userData.profileImage
  const profileImage =
    session?.user?.provider === "google" && session?.user?.image
      ? session.user.image
      : userData.profileImage || "https://via.placeholder.com/60";

  return (
    <div className="p-6 pt-20 min-h-screen bg-gray-50 text-gray-900 font-sans">
    

      <Card className="hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-600" />
            User Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center text-center">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={profileImage} alt={`${userData.name}'s profile`} />
            <AvatarFallback>{userData.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <h3 className="font-bold text-xl mb-1">{userData.name || "User"}</h3>
          <p className="text-gray-500 mb-2">{userData.email}</p>
          <Badge variant={userData.provider === "credentials" ? "secondary" : "default"}>
            {userData.provider ? userData.provider.charAt(0).toUpperCase() + userData.provider.slice(1) : "Unknown"}
          </Badge>

          <div className="flex gap-4 flex-wrap justify-center mt-4">
            <Link href="/dashboard/guest/edit-profile">
              <Button variant="default" className="bg-indigo-600 hover:bg-indigo-700">
                <User className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </Link>
            {userData.provider === "credentials" && (
              <Link href="/guest/change-password">
                <Button variant="outline" className="border-yellow-400 text-yellow-600 hover:bg-yellow-50">
                  <Lock className="mr-2 h-4 w-4" />
                  Change Password
                </Button>
              </Link>
            )}
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>

            <ExamDumpsSlider />
      
    </div>
  );
}