import { useState } from "react";
import { CommentForm } from "./CommentForm";
import { CommentItem } from "./CommentItem";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useComments } from "@/hooks/use-comments";
import { Separator } from "@/components/ui/separator";
import type { CommentSortOption } from "@/lib/comment-queries";

interface CommentSectionProps {
  postId: string;
  commentCount: number;
}

export function CommentSection({ postId, commentCount }: CommentSectionProps) {
  const [sort, setSort] = useState<CommentSortOption>("newest");
  const { comments, isLoading } = useComments(postId, sort);

  return (
    <section className="mt-12">
      <Separator className="mb-8" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          {commentCount} comment{commentCount !== 1 ? "s" : ""}
        </h2>
        <Select value={sort} onValueChange={(v) => setSort(v as CommentSortOption)}>
          <SelectTrigger className="w-[130px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="top">Top</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Composer */}
      <div className="mb-6">
        <CommentForm postId={postId} />
      </div>

      {/* Comments list */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          No comments yet. Be the first to share your thoughts!
        </p>
      ) : (
        <div className="divide-y">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} postId={postId} />
          ))}
        </div>
      )}
    </section>
  );
}
