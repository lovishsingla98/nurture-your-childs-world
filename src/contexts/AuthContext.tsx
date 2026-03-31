import {
  createContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  signInWithGoogle,
  signOut as authSignOut,
  getUserProfile,
} from "@/lib/auth";
import type { UserProfile } from "@/types/blog";

export interface AuthState {
  /** Firebase Auth user (null if signed out) */
  user: User | null;
  /** Firestore user profile with role info */
  profile: UserProfile | null;
  /** True while checking initial auth state */
  isLoading: boolean;
  /** Shortcut: profile.role === "admin" */
  isAdmin: boolean;
  /** Sign in with Google popup */
  signIn: () => Promise<void>;
  /** Sign out */
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  isLoading: true,
  isAdmin: false,
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const userProfile = await getUserProfile(firebaseUser.uid);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }

      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = useCallback(async () => {
    await signInWithGoogle();
    // onAuthStateChanged will update state automatically
  }, []);

  const signOut = useCallback(async () => {
    await authSignOut();
    // onAuthStateChanged will clear state automatically
  }, []);

  const isAdmin = profile?.role === "admin";

  return (
    <AuthContext.Provider
      value={{ user, profile, isLoading, isAdmin, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}
