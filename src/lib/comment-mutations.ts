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
import { db } from "./firebase";

/** Get a comment doc ref inside the post subcollection */
function commentRef(postId: string, commentId: string) {
  return doc(db, "posts", postId, "comments", commentId);
}

/** Get the comments subcollection for a post */
function commentsCol(postId: string) {
  return collection(db, "posts", postId, "comments");
}

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
  const docRef = await addDoc(commentsCol(input.postId), {
    ...input,
    status: "active",
    upvotes: 0,
    replyCount: 0,
    editedAt: null,
    createdAt: serverTimestamp(),
  });

  // Update post comment count
  const postRef = doc(db, "posts", input.postId);
  await updateDoc(postRef, { commentCount: increment(1) });

  // Update parent reply count if this is a reply
  if (input.parentId) {
    const parentRef = commentRef(input.postId, input.parentId);
    await updateDoc(parentRef, { replyCount: increment(1) });
  }

  return docRef.id;
}

// --- Edit comment (within 15 min) ---

export async function editComment(postId: string, commentId: string, body: string): Promise<void> {
  const ref = commentRef(postId, commentId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Comment not found");

  const data = snap.data();
  const createdAt = data.createdAt as Timestamp;
  const now = Timestamp.now();
  const diffMs = now.toMillis() - createdAt.toMillis();
  const fifteenMinMs = 15 * 60 * 1000;

  if (diffMs > fifteenMinMs) {
    throw new Error("Edit window has expired (15 minutes)");
  }

  await updateDoc(ref, {
    body,
    editedAt: serverTimestamp(),
  });
}

// --- Delete comment (soft delete by user) ---

export async function deleteComment(postId: string, commentId: string): Promise<void> {
  const ref = commentRef(postId, commentId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Comment not found");

  const data = snap.data();

  if (data.replyCount > 0) {
    await updateDoc(ref, { status: "deleted", body: null });
  } else {
    await deleteDoc(ref);
  }

  const postRef = doc(db, "posts", postId);
  await updateDoc(postRef, { commentCount: increment(-1) });
}

// --- Upvote toggle ---

export async function toggleUpvote(
  postId: string,
  commentId: string,
  userId: string
): Promise<boolean> {
  const voteId = `${userId}_${commentId}`;
  const voteRef = doc(db, "comment_votes", voteId);
  const voteSnap = await getDoc(voteRef);
  const ref = commentRef(postId, commentId);

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

export async function hasUpvoted(
  commentId: string,
  userId: string
): Promise<boolean> {
  const voteRef = doc(db, "comment_votes", `${userId}_${commentId}`);
  const snap = await getDoc(voteRef);
  return snap.exists();
}

// --- Flag comment ---

export async function flagComment(postId: string, commentId: string): Promise<void> {
  await updateDoc(commentRef(postId, commentId), { status: "flagged" });
}

// --- Admin: hide/unhide ---

export async function hideComment(postId: string, commentId: string): Promise<void> {
  await updateDoc(commentRef(postId, commentId), { status: "hidden" });
}

export async function unhideComment(postId: string, commentId: string): Promise<void> {
  await updateDoc(commentRef(postId, commentId), { status: "active" });
}

// --- Admin: hard delete ---

export async function adminDeleteComment(postId: string, commentId: string): Promise<void> {
  const ref = commentRef(postId, commentId);
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
  await updateDoc(doc(db, "parents", uid), { isBanned: true });
}

export async function unbanUser(uid: string): Promise<void> {
  await updateDoc(doc(db, "parents", uid), { isBanned: false });
}
