import { useParams, Link } from "react-router-dom";
import { BlogLayout } from "@/components/layout/BlogLayout";
import { PostContent } from "@/components/blog/PostContent";
import { PostSEO } from "@/components/blog/PostSEO";
import { ShareBar } from "@/components/blog/ShareBar";
import { CoverImage } from "@/components/blog/CoverImage";
import { CommentSection } from "@/components/comments/CommentSection";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { usePost } from "@/hooks/use-posts";
import { calculateReadTime, formatDate } from "@/lib/blog-queries";

function PostDetailSkeleton() {
  return (
    <BlogLayout>
      <article className="container max-w-4xl py-10 md:py-16">
        <Skeleton className="mb-6 h-8 w-32" />
        <Skeleton className="mb-4 aspect-video w-full rounded-lg" />
        <Skeleton className="mb-2 h-5 w-24" />
        <Skeleton className="mb-3 h-10 w-3/4" />
        <div className="flex gap-3 mb-8">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-full" />
        </div>
      </article>
    </BlogLayout>
  );
}

function PostNotFound() {
  return (
    <BlogLayout>
      <div className="container flex flex-col items-center justify-center py-24 text-center">
        <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The post you're looking for doesn't exist or has been removed.
        </p>
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>
      </div>
    </BlogLayout>
  );
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = usePost(slug ?? "");

  if (isLoading) return <PostDetailSkeleton />;
  if (!post || error) return <PostNotFound />;

  const readTime = calculateReadTime(post.content);

  return (
    <BlogLayout>
      <PostSEO post={post} />
      <article className="container max-w-4xl py-10 md:py-16">
        {/* Back link */}
        <Link
          to="/blog"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>

        {/* Cover image */}
        {post.coverImage && (
          <div className="mb-8">
            <CoverImage
              src={post.coverImage}
              alt={post.title}
              className="rounded-lg"
            />
          </div>
        )}

        {/* Post header */}
        <header className="mb-8">
          {post.categories?.[0] && (
            <Badge variant="secondary" className="mb-3">
              {post.categories[0]}
            </Badge>
          )}
          <h1 className="text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
            {post.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(post.publishedAt)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {readTime} min read
            </span>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="text-sm text-primary hover:underline"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </header>

        {/* Post content */}
        <PostContent content={post.content} />

        {/* Share bar */}
        <ShareBar url={`/blog/${post.slug}`} title={post.title} />

        {/* Comments */}
        <CommentSection postId={post.id} commentCount={post.commentCount || 0} />
      </article>
    </BlogLayout>
  );
}
