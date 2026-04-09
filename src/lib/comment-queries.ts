import {
  collection,
  getDocs,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import type { Comment } from "@/types/blog";

const COMMENTS_PER_PAGE = 10;

function docToComment(snap: { id: string; data: () => any }): Comment {
  return { id: snap.id, ...snap.data() } as Comment;
}

export type CommentSortOption = "newest" | "oldest" | "top";

function sortComments(comments: Comment[], sort: CommentSortOption): Comment[] {
  return [...comments].sort((a, b) => {
    switch (sort) {
      case "oldest":
        return (a.createdAt?.toMillis?.() ?? 0) - (b.createdAt?.toMillis?.() ?? 0);
      case "top":
        return (b.upvotes ?? 0) - (a.upvotes ?? 0);
      case "newest":
      default:
        return (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0);
    }
  });
}

/**
 * Subscribe to real-time comments for a post.
 */
export function subscribeToComments(
  postId: string,
  sort: CommentSortOption,
  callback: (comments: Comment[]) => void
): Unsubscribe {
  let unsubscribe: Unsubscribe = () => {};

  getFirebaseDb().then((db) => {
    const commentsCol = collection(db, "posts", postId, "comments");
    unsubscribe = onSnapshot(commentsCol, (snapshot) => {
      const all = snapshot.docs.map(docToComment);
      const topLevel = all.filter((c) => !c.parentId);
      const sorted = sortComments(topLevel, sort);
      callback(sorted.slice(0, COMMENTS_PER_PAGE));
    });
  });

  return () => unsubscribe();
}

/**
 * Fetch all comments for a post.
 */
export async function getAllComments(postId: string): Promise<Comment[]> {
  const db = await getFirebaseDb();
  const commentsCol = collection(db, "posts", postId, "comments");
  const snapshot = await getDocs(commentsCol);
  return snapshot.docs.map(docToComment);
}

/**
 * Fetch replies for a given parent comment.
 */
export async function getReplies(postId: string, parentId: string): Promise<Comment[]> {
  const db = await getFirebaseDb();
  const commentsCol = collection(db, "posts", postId, "comments");
  const snapshot = await getDocs(commentsCol);
  const all = snapshot.docs.map(docToComment);
  return all
    .filter((c) => c.parentId === parentId)
    .sort((a, b) => (a.createdAt?.toMillis?.() ?? 0) - (b.createdAt?.toMillis?.() ?? 0));
}

export { COMMENTS_PER_PAGE };
