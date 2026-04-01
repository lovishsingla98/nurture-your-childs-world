import { useState, useEffect } from "react";
import { useAuth as useAuthContext } from "@/contexts/AuthContext";
import { getUserProfile } from "@/lib/auth";
import type { UserProfile } from "@/types/blog";

/**
 * Extended auth hook for the blog system.
 * Wraps the existing AuthContext and adds profile, isAdmin, and blog-friendly aliases.
 */
export function useAuth() {
  const ctx = useAuthContext();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (ctx.user) {
      setProfileLoading(true);
      getUserProfile(ctx.user.uid)
        .then(setProfile)
        .finally(() => setProfileLoading(false));
    } else {
      setProfile(null);
    }
  }, [ctx.user]);

  return {
    user: ctx.user,
    profile,
    isLoading: ctx.loading || profileLoading,
    isAdmin: profile?.role === "admin",
    signIn: ctx.signInWithGoogle,
    signOut: ctx.logout,
  };
}
