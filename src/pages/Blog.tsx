import { useSearchParams } from "react-router-dom";
import { BlogLayout } from "@/components/layout/BlogLayout";
import { PostGrid } from "@/components/blog/PostGrid";
import { PostPagination } from "@/components/blog/PostPagination";
import { CategoryFilter } from "@/components/blog/CategoryFilter";
import { SearchInput } from "@/components/blog/SearchInput";
import { BlogFilters } from "@/components/blog/BlogFilters";
import { BlogListSEO } from "@/components/blog/PostSEO";
import { usePosts, useCategories } from "@/hooks/use-posts";
import { useBlogSearch } from "@/hooks/use-blog-search";
import { POSTS_PER_PAGE } from "@/lib/blog-queries";

export default function Blog() {
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const category = searchParams.get("category") || undefined;

  const { data, isLoading } = usePosts(page, category);
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  // Client-side search over loaded posts
  const {
    query,
    inputValue,
    setInputValue,
    clearSearch,
    filteredPosts,
    resultCount,
  } = useBlogSearch(data?.posts ?? []);

  const displayPosts = query ? filteredPosts : (data?.posts ?? []);
  const totalPages = query
    ? Math.ceil(resultCount / POSTS_PER_PAGE)
    : (data?.totalPages ?? 0);

  return (
    <BlogLayout>
      <BlogListSEO category={category} page={page} />
      <section className="container py-10 md:py-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold md:text-4xl">Blog</h1>
          <p className="mt-2 text-muted-foreground">
            Parenting tips, child development insights, and more.
          </p>
        </div>

        {/* Search + Category filters */}
        <div className="mb-4 max-w-md">
          <SearchInput
            value={inputValue}
            onChange={setInputValue}
            onClear={clearSearch}
          />
        </div>

        <div className="mb-4">
          <CategoryFilter
            categories={categories ?? []}
            isLoading={categoriesLoading}
          />
        </div>

        <BlogFilters />

        {/* Result count when searching */}
        {query && (
          <p className="mb-4 text-sm text-muted-foreground">
            Showing {resultCount} result{resultCount !== 1 ? "s" : ""} for &quot;{query}&quot;
            {resultCount === 0 && (
              <span>
                {" "}— Try a different keyword or{" "}
                <button onClick={clearSearch} className="text-primary underline">
                  clear the search
                </button>
                .
              </span>
            )}
          </p>
        )}

        <PostGrid posts={displayPosts} isLoading={isLoading} />

        {!query && data && (
          <PostPagination
            currentPage={page}
            totalPages={totalPages}
          />
        )}
      </section>
    </BlogLayout>
  );
}
