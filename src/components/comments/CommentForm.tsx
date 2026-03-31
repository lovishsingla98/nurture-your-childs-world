import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { AuthGate } from "@/components/auth/AuthGate";
import { addComment } from "@/lib/comment-mutations";
import { toast } from "sonner";
import { Send } from "lucide-react";

interface CommentFormProps {
  postId: string;
  parentId?: string | null;
  onSubmitted?: () => void;
  autoFocus?: boolean;
  placeholder?: string;
}

export function CommentForm({
  postId,
  parentId = null,
  onSubmitted,
  autoFocus = false,
  placeholder = "Write a comment…",
}: CommentFormProps) {
  const { user, profile } = useAuth();
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authGateOpen, setAuthGateOpen] = useState(false);

  if (!user) {
    return (
      <>
        <div
          className="rounded-lg border bg-muted/30 p-4 text-center cursor-pointer"
          onClick={() => setAuthGateOpen(true)}
        >
          <p className="font-medium">Join the conversation</p>
          <p className="text-sm text-muted-foreground mt-1">
            Sign in with Google to leave a comment
          </p>
          <Button size="sm" className="mt-3" onClick={() => setAuthGateOpen(true)}>
            Continue with Google
          </Button>
        </div>
        <AuthGate open={authGateOpen} onOpenChange={setAuthGateOpen} />
      </>
    );
  }

  if (profile?.isBanned) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-center">
        <p className="text-sm text-destructive">
          Your account has been restricted from commenting.
        </p>
      </div>
    );
  }

  const charCount = body.length;
  const overLimit = charCount > 2000;

  async function handleSubmit() {
    if (!body.trim() || overLimit || !user) return;

    setIsSubmitting(true);
    try {
      await addComment({
        postId,
        parentId,
        authorId: user.uid,
        authorName: user.displayName || "Anonymous",
        authorPhoto: user.photoURL || "",
        body: body.trim(),
      });
      setBody("");
      toast.success("Comment posted");
      onSubmitted?.();
    } catch {
      toast.error("Failed to post comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="space-y-2">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={3}
        autoFocus={autoFocus}
      />
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {charCount > 1800 && (
            <span className={overLimit ? "text-destructive" : ""}>
              {charCount} / 2000
            </span>
          )}
        </div>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!body.trim() || overLimit || isSubmitting}
        >
          <Send className="mr-1.5 h-3.5 w-3.5" />
          {isSubmitting ? "Posting…" : "Submit"}
        </Button>
      </div>
    </div>
  );
}
