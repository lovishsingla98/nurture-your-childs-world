import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Pencil, Eye, Copy, Trash2 } from "lucide-react";
import { useDeletePost, useDuplicatePost } from "@/hooks/use-admin-posts";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import type { Post } from "@/types/blog";

interface PostActionsProps {
  post: Post;
}

export function PostActions({ post }: PostActionsProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const deleteMutation = useDeletePost();
  const duplicateMutation = useDuplicatePost();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");

  function handleEdit() {
    navigate(`/admin/blog/${post.id}/edit`);
  }

  function handleViewLive() {
    window.open(`/blog/${post.slug}`, "_blank");
  }

  async function handleDuplicate() {
    if (!user) return;
    try {
      const newId = await duplicateMutation.mutateAsync({
        post,
        authorId: user.uid,
      });
      toast.success("Post duplicated");
      navigate(`/admin/blog/${newId}/edit`);
    } catch {
      toast.error("Failed to duplicate post");
    }
  }

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(post.id);
      toast.success("Post deleted");
      setDeleteOpen(false);
    } catch {
      toast.error("Failed to delete post");
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          {post.status === "published" && (
            <DropdownMenuItem onClick={handleViewLive}>
              <Eye className="mr-2 h-4 w-4" />
              View live
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className="text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              This will also delete all its comments. This cannot be undone.
              <br />
              <br />
              Type <strong>{post.title}</strong> to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={confirmTitle}
            onChange={(e) => setConfirmTitle(e.target.value)}
            placeholder="Type the post title to confirm"
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmTitle("")}>
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={
                confirmTitle !== post.title || deleteMutation.isPending
              }
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
