import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toggleUpvote, hasUpvoted } from "@/lib/comment-mutations";
import { cn } from "@/lib/utils";

interface UpvoteButtonProps {
  postId: string;
  commentId: string;
  initialCount: number;
  onAuthRequired: () => void;
}

export function UpvoteButton({
  postId,
  commentId,
  initialCount,
  onAuthRequired,
}: UpvoteButtonProps) {
  const { user } = useAuth();
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  useEffect(() => {
    if (!user) return;
    hasUpvoted(commentId, user.uid).then(setVoted);
  }, [commentId, user]);

  async function handleClick() {
    if (!user) {
      onAuthRequired();
      return;
    }

    setLoading(true);
    // Optimistic update
    const wasVoted = voted;
    setVoted(!wasVoted);
    setCount((c) => c + (wasVoted ? -1 : 1));

    try {
      await toggleUpvote(postId, commentId, user.uid);
    } catch {
      // Rollback
      setVoted(wasVoted);
      setCount((c) => c + (wasVoted ? 1 : -1));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("h-7 gap-1 px-2 text-xs", voted && "text-primary")}
      onClick={handleClick}
      disabled={loading}
    >
      <ThumbsUp className={cn("h-3.5 w-3.5", voted && "fill-primary")} />
      {count > 0 && count}
    </Button>
  );
}
