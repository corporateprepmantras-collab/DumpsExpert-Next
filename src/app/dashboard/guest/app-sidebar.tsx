"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, ShoppingBag, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GuestDashboard() {
  const { data: session } = useSession();
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch("/api/user/me");
        if (!res.ok) throw new Error("Failed to fetch user data");
        setUserData(await res.json());
      } catch (err) {
        setError(err.message);
      }
    };
    loadUser();
  }, []);

  if (error) {
    return (
      <Card className="max-w-md mx-auto mt-10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" /> Error
          </CardTitle>
        </CardHeader>
        <CardContent>{error}</CardContent>
      </Card>
    );
  }

  if (!userData) return <div className="p-6">Loading...</div>;

  const profileImage =
    session?.user?.image || userData.profileImage || "https://via.placeholder.com/60";

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-600" /> User Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <Avatar className="h-24 w-24 mb-3">
            <AvatarImage src={profileImage} />
            <AvatarFallback>{userData.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <h3 className="font-bold">{userData.name}</h3>
          <p className="text-gray-500">{userData.email}</p>
          <Badge>{userData.provider}</Badge>
        </CardContent>
      </Card>

      {/* Subscription Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-indigo-600" /> Subscription
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {userData.subscription === "no" ? (
            <>
              <p className="text-red-600">No Subscription Found</p>
              <Link href="/dumps">
                <Button className="mt-3">Buy Subscription</Button>
              </Link>
            </>
          ) : (
            <p className="text-green-600">Active: {userData.subscription}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
