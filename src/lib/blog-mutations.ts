import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Post } from "@/types/blog";

const postsRef = collection(db, "posts");

// --- Slug helpers ---

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function isSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
  const q = query(postsRef, where("slug", "==", slug));
  const snap = await getDocs(q);
  if (snap.empty) return true;
  if (excludeId && snap.docs.length === 1 && snap.docs[0].id === excludeId) return true;
  return false;
}

// --- CRUD ---

export interface PostInput {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  categories: string[];
  tags: string[];
  status: "draft" | "published" | "scheduled";
  publishedAt?: ReturnType<typeof serverTimestamp> | null;
  scheduledAt?: ReturnType<typeof serverTimestamp> | null;
  authorId: string;
  metaTitle: string;
  metaDescription: string;
}

export async function createPost(data: PostInput): Promise<string> {
  const now = serverTimestamp();
  const docRef = await addDoc(postsRef, {
    ...data,
    publishedAt: data.status === "published" ? now : null,
    viewCount: 0,
    commentCount: 0,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
}

export async function updatePost(id: string, data: Partial<PostInput>): Promise<void> {
  const postRef = doc(db, "posts", id);
  await updateDoc(postRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function publishPost(id: string, data: Partial<PostInput>): Promise<void> {
  const postRef = doc(db, "posts", id);
  await updateDoc(postRef, {
    ...data,
    status: "published",
    publishedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function unpublishPost(id: string): Promise<void> {
  const postRef = doc(db, "posts", id);
  await updateDoc(postRef, {
    status: "draft",
    publishedAt: null,
    updatedAt: serverTimestamp(),
  });
}

export async function deletePost(id: string): Promise<void> {
  // Delete all comments in the subcollection posts/{id}/comments
  const commentsRef = collection(db, "posts", id, "comments");
  const commentsSnap = await getDocs(commentsRef);

  if (!commentsSnap.empty) {
    const batch = writeBatch(db);
    commentsSnap.docs.forEach((commentDoc) => {
      batch.delete(commentDoc.ref);
    });
    await batch.commit();
  }

  // Delete the post
  await deleteDoc(doc(db, "posts", id));
}

export async function duplicatePost(post: Post, authorId: string): Promise<string> {
  const newSlug = generateSlug(`copy-of-${post.title}`);
  return createPost({
    title: `Copy of ${post.title}`,
    slug: newSlug,
    content: post.content,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
    categories: post.categories,
    tags: post.tags || [],
    status: "draft",
    authorId,
    metaTitle: "",
    metaDescription: "",
  });
}

// --- Fetch all posts (admin) ---

export async function getAllPosts(): Promise<Post[]> {
  const snap = await getDocs(postsRef);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as Post))
    .sort((a, b) => {
      const aTime = a.updatedAt?.toMillis?.() ?? 0;
      const bTime = b.updatedAt?.toMillis?.() ?? 0;
      return bTime - aTime;
    });
}

export async function getPostById(id: string): Promise<Post | null> {
  const { getDoc } = await import("firebase/firestore");
  const postRef = doc(db, "posts", id);
  const snap = await getDoc(postRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Post;
}
