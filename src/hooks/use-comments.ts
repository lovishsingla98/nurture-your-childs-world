import { useState, useEffect, useCallback } from "react";
import {
  subscribeToComments,
  getReplies,
  type CommentSortOption,
} from "@/lib/comment-queries";
import type { Comment } from "@/types/blog";

/**
 * Real-time comments subscription for page 1.
 */
export function useComments(postId: string, sort: CommentSortOption) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!postId) return;
    setIsLoading(true);

    const unsubscribe = subscribeToComments(postId, sort, (newComments) => {
      setComments(newComments);
      setIsLoading(false);
    });

    return unsubscribe;
  }, [postId, sort]);

  return { comments, isLoading };
}

/**
 * Fetch replies for a parent comment on demand.
 */
export function useReplies(postId: string, parentId: string) {
  const [replies, setReplies] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    if (loaded) {
      setLoaded(false);
      setReplies([]);
      return;
    }
    setIsLoading(true);
    const result = await getReplies(postId, parentId);
    setReplies(result);
    setIsLoading(false);
    setLoaded(true);
  }, [postId, parentId, loaded]);

  return { replies, isLoading, loaded, load };
}
