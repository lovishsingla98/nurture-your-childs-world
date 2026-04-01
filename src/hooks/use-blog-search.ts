import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { Post } from "@/types/blog";

const DEBOUNCE_MS = 400;

/**
 * Debounced blog search with URL state sync.
 * Filters posts client-side by title + excerpt.
 */
export function useBlogSearch(posts: Post[]) {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get("q") || "";
  const [inputValue, setInputValue] = useState(queryParam);

  // Debounce: sync input to URL after 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (inputValue) {
        params.set("q", inputValue);
      } else {
        params.delete("q");
      }
      params.delete("page"); // reset to page 1 on search
      setSearchParams(params, { replace: true });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [inputValue]);

  // Filter posts by search query
  const filteredPosts = useMemo(() => {
    if (!queryParam) return posts;
    const q = queryParam.toLowerCase();
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(q) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(q))
    );
  }, [posts, queryParam]);

  function clearSearch() {
    setInputValue("");
    const params = new URLSearchParams(searchParams);
    params.delete("q");
    params.delete("page");
    setSearchParams(params, { replace: true });
  }

  return {
    query: queryParam,
    inputValue,
    setInputValue,
    clearSearch,
    filteredPosts,
    resultCount: filteredPosts.length,
  };
}
