import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  getPosts,
  getPostBySlug,
  getCategories,
  POSTS_PER_PAGE,
} from "@/lib/blog-queries";

/**
 * Fetch a paginated list of published posts, optionally filtered by category.
 */
export function usePosts(page: number, category?: string) {
  return useQuery({
    queryKey: ["posts", page, category],
    queryFn: async () => {
      const result = await getPosts(page, category);
      return {
        posts: result.posts,
        totalCount: result.totalCount,
        totalPages: Math.ceil(result.totalCount / POSTS_PER_PAGE),
      };
    },
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

/**
 * Fetch a single post by slug.
 */
export function usePost(slug: string) {
  return useQuery({
    queryKey: ["post", slug],
    queryFn: () => getPostBySlug(slug),
    enabled: !!slug,
    staleTime: 60_000,
  });
}

/**
 * Fetch all categories with post counts.
 */
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 5 * 60_000,
  });
}
