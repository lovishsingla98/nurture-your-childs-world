import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  publishPost,
  unpublishPost,
  deletePost,
  duplicatePost,
  type PostInput,
} from "@/lib/blog-mutations";
import type { Post } from "@/types/blog";

export function useAdminPosts() {
  return useQuery({
    queryKey: ["admin-posts"],
    queryFn: getAllPosts,
    staleTime: 30_000,
  });
}

export function useAdminPost(id: string) {
  return useQuery({
    queryKey: ["admin-post", id],
    queryFn: () => getPostById(id),
    enabled: !!id,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PostInput) => createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PostInput> }) =>
      updatePost(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-post", id] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function usePublishPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PostInput> }) =>
      publishPost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useUnpublishPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => unpublishPost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useDuplicatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ post, authorId }: { post: Post; authorId: string }) =>
      duplicatePost(post, authorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
    },
  });
}
