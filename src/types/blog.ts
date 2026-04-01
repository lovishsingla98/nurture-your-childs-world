import { Timestamp } from "firebase/firestore";
import { z } from "zod";

// --- Firestore document interfaces ---

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string; // TipTap JSON stored as string
  excerpt: string;
  coverImage: string;
  categories: string[];
  tags: string[];
  status: "draft" | "published" | "scheduled";
  publishedAt: Timestamp | null;
  scheduledAt: Timestamp | null;
  authorId: string;
  metaTitle: string;
  metaDescription: string;
  viewCount: number;
  commentCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Comment {
  id: string;
  postId: string;
  parentId: string | null;
  authorId: string;
  authorName: string;
  authorPhoto: string;
  body: string | null;
  status: "active" | "deleted" | "hidden" | "flagged";
  upvotes: number;
  replyCount: number;
  editedAt: Timestamp | null;
  createdAt: Timestamp;
}

export interface CommentVote {
  userId: string;
  commentId: string;
  createdAt: Timestamp;
}

export interface UserProfile {
  displayName: string;
  photoURL: string;
  email: string;
  role: "admin" | "user";
  isBanned: boolean;
  commentCount: number;
  joinedAt: Timestamp;
}

// --- Zod schemas for form validation ---

export const postFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(50, "Post body must be at least 50 characters"),
  excerpt: z.string().max(280).optional(),
  category: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).optional(),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  slug: z.string().optional(),
});

export const commentFormSchema = z.object({
  body: z.string().min(1).max(2000, "Comment must be under 2000 characters"),
});

// --- Utility types ---

export type PostStatus = Post["status"];
export type CommentStatus = Comment["status"];

export interface PostsQueryResult {
  posts: Post[];
  totalCount: number;
  lastDoc: unknown; // Firestore DocumentSnapshot for cursor pagination
}

export interface CategoryCount {
  name: string;
  count: number;
}
