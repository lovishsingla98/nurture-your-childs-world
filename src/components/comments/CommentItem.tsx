import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UpvoteButton } from "./UpvoteButton";
import { EditCommentForm } from "./EditCommentForm";
import { CommentForm } from "./CommentForm";
import { AuthGate } from "@/components/auth/AuthGate";
import { useAuth } from "@/hooks/use-auth";
import { useReplies } from "@/hooks/use-comments";
import { deleteComment, flagComment, hideComment, unhideComment, adminDeleteComment, banUser } from "@/lib/comment-mutations";
import { toast } from "sonner";
import { MessageSquare, Pencil, Trash2, Flag, EyeOff, Eye, Ban } from "lucide-react";
import { Timestamp } from "firebase/firestore";
import type { Comment } from "@/types/blog";

interface CommentItemProps {
  comment: Comment;
  postId: string;
  isReply?: boolean;
}

function formatRelativeTime(timestamp: Timestamp): string {
  const now = Date.now();
  const time = timestamp.toMillis();
  const diffMs = now - time;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  return timestamp.toDate().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function CommentItem({ comment, postId, isReply = false }: CommentItemProps) {
  const { user, isAdmin } = useAuth();
  const [editing, setEditing] = useState(false);
  const [replying, setReplying] = useState(false);
  const [authGateOpen, setAuthGateOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { replies, loaded, load, isLoading: repliesLoading } = useReplies(postId, comment.id);

  const isAuthor = user?.uid === comment.authorId;
  const createdAt = comment.createdAt as Timestamp;
  const canEdit =
    isAuthor && createdAt && Date.now() - createdAt.toMillis() < 15 * 60 * 1000;

  // Deleted comment placeholder
  if (comment.status === "deleted") {
    return (
      <div className={isReply ? "ml-10 pl-4 border-l-2" : ""}>
        <p className="text-sm italic text-muted-foreground py-2">
          This comment was deleted.
        </p>
      </div>
    );
  }

  // Hidden comment (admin only sees it)
  if (comment.status === "hidden" && !isAdmin) return null;

  const initials = (comment.authorName || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleDelete() {
    try {
      await deleteComment(postId, comment.id);
      toast.success("Comment deleted");
    } catch {
      toast.error("Failed to delete comment");
    }
    setConfirmDelete(false);
  }

  async function handleFlag() {
    try {
      await flagComment(postId, comment.id);
      toast.success("Comment reported");
    } catch {
      toast.error("Failed to report comment");
    }
  }

  async function handleAdminHide() {
    try {
      if (comment.status === "hidden") {
        await unhideComment(postId, comment.id);
        toast.success("Comment unhidden");
      } else {
        await hideComment(postId, comment.id);
        toast.success("Comment hidden");
      }
    } catch {
      toast.error("Action failed");
    }
  }

  async function handleAdminDelete() {
    try {
      await adminDeleteComment(postId, comment.id);
      toast.success("Comment deleted by admin");
    } catch {
      toast.error("Failed to delete");
    }
  }

  async function handleBan() {
    if (!window.confirm(`Ban ${comment.authorName} from commenting? They will not be notified.`)) return;
    try {
      await banUser(comment.authorId);
      toast.success(`${comment.authorName} has been banned`);
    } catch {
      toast.error("Failed to ban user");
    }
  }

  return (
    <div className={isReply ? "ml-10 pl-4 border-l-2 border-muted" : ""}>
      <div className="flex gap-3 py-3">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={comment.authorPhoto} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{comment.authorName}</span>
            {isAdmin && comment.authorId === user?.uid && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                Admin
              </Badge>
            )}
            {comment.status === "hidden" && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                Hidden
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {createdAt && formatRelativeTime(createdAt)}
            </span>
            {comment.editedAt && (
              <span className="text-xs text-muted-foreground italic">edited</span>
            )}
          </div>

          {/* Body */}
          {editing ? (
            <EditCommentForm
              postId={postId}
              commentId={comment.id}
              initialBody={comment.body || ""}
              onCancel={() => setEditing(false)}
              onSaved={() => setEditing(false)}
            />
          ) : (
            <p className="mt-1 text-sm whitespace-pre-wrap">{comment.body}</p>
          )}

          {/* Action bar */}
          {!editing && (
            <div className="mt-1.5 flex items-center gap-1 flex-wrap">
              <UpvoteButton
                postId={postId}
                commentId={comment.id}
                initialCount={comment.upvotes}
                onAuthRequired={() => setAuthGateOpen(true)}
              />

              {!isReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 px-2 text-xs"
                  onClick={() => setReplying(!replying)}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Reply
                </Button>
              )}

              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 px-2 text-xs"
                  onClick={() => setEditing(true)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
              )}

              {isAuthor && !confirmDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 px-2 text-xs text-destructive"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              )}

              {confirmDelete && (
                <span className="flex items-center gap-1 text-xs">
                  Delete this comment?
                  <Button variant="destructive" size="sm" className="h-6 px-2 text-xs" onClick={handleDelete}>
                    Confirm
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setConfirmDelete(false)}>
                    Cancel
                  </Button>
                </span>
              )}

              {user && !isAuthor && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 px-2 text-xs"
                  onClick={handleFlag}
                >
                  <Flag className="h-3.5 w-3.5" />
                </Button>
              )}

              {/* Admin actions */}
              {isAdmin && !isAuthor && (
                <>
                  <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={handleAdminHide}>
                    {comment.status === "hidden" ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    {comment.status === "hidden" ? "Unhide" : "Hide"}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs text-destructive" onClick={handleAdminDelete}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs text-destructive" onClick={handleBan}>
                    <Ban className="h-3.5 w-3.5" />
                    Ban
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Reply form */}
          {replying && (
            <div className="mt-3">
              <CommentForm
                postId={comment.postId}
                parentId={comment.id}
                autoFocus
                placeholder="Write a reply…"
                onSubmitted={() => {
                  setReplying(false);
                  if (!loaded) load();
                }}
              />
            </div>
          )}

          {/* Replies */}
          {!isReply && comment.replyCount > 0 && (
            <div className="mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-primary"
                onClick={load}
              >
                {repliesLoading
                  ? "Loading…"
                  : loaded
                    ? "Hide replies"
                    : `View ${comment.replyCount} repl${comment.replyCount === 1 ? "y" : "ies"}`}
              </Button>
              {loaded &&
                replies.map((reply) => (
                  <CommentItem key={reply.id} comment={reply} postId={postId} isReply />
                ))}
            </div>
          )}
        </div>
      </div>

      <AuthGate open={authGateOpen} onOpenChange={setAuthGateOpen} />
    </div>
  );
}
