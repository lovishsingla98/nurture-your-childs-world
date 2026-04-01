import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";
import type { UserProfile } from "@/types/blog";

const googleProvider = new GoogleAuthProvider();

/**
 * Sign in with Google popup.
 * If the user already exists in the `parents` collection, update their last sign-in.
 * If not, create a new profile matching the existing parents schema.
 */
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  const parentRef = doc(db, "parents", user.uid);
  const parentSnap = await getDoc(parentRef);

  if (!parentSnap.exists()) {
    // New user — create profile matching existing parents schema
    const now = serverTimestamp();
    await setDoc(parentRef, {
      uid: user.uid,
      id: user.uid,
      displayName: user.displayName || "",
      auth: {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
        emailVerified: user.emailVerified,
        provider: "firebase",
        providerId: user.providerData?.[0]?.providerId || null,
        phoneNumber: user.phoneNumber || null,
        phoneVerified: null,
        isActive: true,
        lastSignIn: now,
        otpSecret: null,
        otpExpiry: null,
        lastOtpSent: null,
      },
      role: "user",
      isBanned: false,
      commentCount: 0,
      children: [],
      subscription: null,
      meta: {
        createdAt: now,
        updatedAt: now,
      },
      createdAt: now,
      updatedAt: now,
    });
  } else {
    // Existing user — update last sign-in
    await updateDoc(parentRef, {
      "auth.lastSignIn": serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  return user;
}

/**
 * Sign out the current user.
 */
export async function signOut() {
  await firebaseSignOut(auth);
}

/**
 * Fetch the user profile from the `parents` collection.
 * Maps the parents schema to the UserProfile interface.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const parentRef = doc(db, "parents", uid);
  const parentSnap = await getDoc(parentRef);
  if (!parentSnap.exists()) return null;

  const data = parentSnap.data();
  return {
    displayName: data.displayName || data.auth?.displayName || "",
    photoURL: data.auth?.photoURL || "",
    email: data.auth?.email || "",
    role: data.role || "user",
    isBanned: data.isBanned || false,
    commentCount: data.commentCount || 0,
    joinedAt: data.createdAt,
  } as UserProfile;
}
