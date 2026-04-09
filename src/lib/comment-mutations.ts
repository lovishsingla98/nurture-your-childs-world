import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  setDoc,
  increment,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";

// --- Add comment ---

interface AddCommentInput {
  postId: string;
  parentId: string | null;
  authorId: string;
  authorName: string;
  authorPhoto: string;
  body: string;
}

export async function addComment(input: AddCommentInput): Promise<string> {
  const db = await getFirebaseDb();
  const docRef = await addDoc(collection(db, "posts", input.postId, "comments"), {
    ...input,
    status: "active",
    upvotes: 0,
    replyCount: 0,
    editedAt: null,
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "posts", input.postId), { commentCount: increment(1) });

  if (input.parentId) {
    await updateDoc(doc(db, "posts", input.postId, "comments", input.parentId), { replyCount: increment(1) });
  }

  return docRef.id;
}

// --- Edit comment (within 15 min) ---

export async function editComment(postId: string, commentId: string, body: string): Promise<void> {
  const db = await getFirebaseDb();
  const ref = doc(db, "posts", postId, "comments", commentId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Comment not found");

  const data = snap.data();
  const createdAt = data.createdAt as Timestamp;
  const now = Timestamp.now();
  const diffMs = now.toMillis() - createdAt.toMillis();

  if (diffMs > 15 * 60 * 1000) {
    throw new Error("Edit window has expired (15 minutes)");
  }

  await updateDoc(ref, { body, editedAt: serverTimestamp() });
}

// --- Delete comment (soft delete by user) ---

export async function deleteComment(postId: string, commentId: string): Promise<void> {
  const db = await getFirebaseDb();
  const ref = doc(db, "posts", postId, "comments", commentId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Comment not found");

  const data = snap.data();
  if (data.replyCount > 0) {
    await updateDoc(ref, { status: "deleted", body: null });
  } else {
    await deleteDoc(ref);
  }

  await updateDoc(doc(db, "posts", postId), { commentCount: increment(-1) });
}

// --- Upvote toggle ---

export async function toggleUpvote(
  postId: string,
  commentId: string,
  userId: string
): Promise<boolean> {
  const db = await getFirebaseDb();
  const voteId = `${userId}_${commentId}`;
  const voteRef = doc(db, "comment_votes", voteId);
  const voteSnap = await getDoc(voteRef);
  const ref = doc(db, "posts", postId, "comments", commentId);

  if (voteSnap.exists()) {
    await deleteDoc(voteRef);
    await updateDoc(ref, { upvotes: increment(-1) });
    return false;
  } else {
    await setDoc(voteRef, { userId, commentId, createdAt: serverTimestamp() });
    await updateDoc(ref, { upvotes: increment(1) });
    return true;
  }
}

// --- Check if user has upvoted ---

export async function hasUpvoted(commentId: string, userId: string): Promise<boolean> {
  const db = await getFirebaseDb();
  const voteRef = doc(db, "comment_votes", `${userId}_${commentId}`);
  const snap = await getDoc(voteRef);
  return snap.exists();
}

// --- Flag comment ---

export async function flagComment(postId: string, commentId: string): Promise<void> {
  const db = await getFirebaseDb();
  await updateDoc(doc(db, "posts", postId, "comments", commentId), { status: "flagged" });
}

// --- Admin: hide/unhide ---

export async function hideComment(postId: string, commentId: string): Promise<void> {
  const db = await getFirebaseDb();
  await updateDoc(doc(db, "posts", postId, "comments", commentId), { status: "hidden" });
}

export async function unhideComment(postId: string, commentId: string): Promise<void> {
  const db = await getFirebaseDb();
  await updateDoc(doc(db, "posts", postId, "comments", commentId), { status: "active" });
}

// --- Admin: hard delete ---

export async function adminDeleteComment(postId: string, commentId: string): Promise<void> {
  const db = await getFirebaseDb();
  const ref = doc(db, "posts", postId, "comments", commentId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const data = snap.data();
  if (data.replyCount > 0) {
    await updateDoc(ref, { status: "deleted", body: null });
  } else {
    await deleteDoc(ref);
  }

  await updateDoc(doc(db, "posts", postId), { commentCount: increment(-1) });
}

// --- Admin: ban user ---

export async function banUser(uid: string): Promise<void> {
  const db = await getFirebaseDb();
  await updateDoc(doc(db, "parents", uid), { isBanned: true });
}

export async function unbanUser(uid: string): Promise<void> {
  const db = await getFirebaseDb();
  await updateDoc(doc(db, "parents", uid), { isBanned: false });
}
