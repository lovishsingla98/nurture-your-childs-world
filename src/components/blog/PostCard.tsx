import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar } from "lucide-react";
import { CoverImage } from "./CoverImage";
import { calculateReadTime, formatDate } from "@/lib/blog-queries";
import type { Post } from "@/types/blog";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const readTime = calculateReadTime(post.content);
  const excerpt =
    post.excerpt && post.excerpt.length > 140
      ? post.excerpt.slice(0, 140) + "…"
      : post.excerpt;

  return (
    <Link to={`/blog/${post.slug}`} className="group block">
      <Card className="h-full overflow-hidden transition-shadow duration-200 hover:shadow-md">
        <CoverImage src={post.coverImage} alt={post.title} />
        <CardContent className="p-5">
          {post.categories?.[0] && (
            <Badge variant="secondary" className="mb-2">
              {post.categories[0]}
            </Badge>
          )}
          <h3 className="mb-2 line-clamp-2 text-lg font-semibold leading-tight group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          {excerpt && (
            <p className="mb-3 text-sm text-muted-foreground line-clamp-3">
              {excerpt}
            </p>
          )}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(post.publishedAt)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {readTime} min read
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
