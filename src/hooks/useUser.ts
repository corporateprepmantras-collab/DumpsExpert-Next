import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import instance from "axios";
import axios from "axios";

export function useUser() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (status === "loading") return; // Wait for session to resolve
      if (status === "unauthenticated") {
        setLoading(false);
        return; // No session, no user
      }

      try {
        const response = await axios.get("/api/user/me");
        setUser(response.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [status]);

  const updateUser = async (data) => {
    try {
      const response = await axios.put("/api/user/me", data);
      setUser(response.data);
      return response.data;
    } catch (err) {
      throw new Error(
        err.response?.data?.error || "Failed to update user data"
      );
    }
  };

  return { user, loading, error, updateUser, session };
}
