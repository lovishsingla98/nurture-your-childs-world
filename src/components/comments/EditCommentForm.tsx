import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { editComment } from "@/lib/comment-mutations";
import { toast } from "sonner";

interface EditCommentFormProps {
  postId: string;
  commentId: string;
  initialBody: string;
  onCancel: () => void;
  onSaved: () => void;
}

export function EditCommentForm({
  postId,
  commentId,
  initialBody,
  onCancel,
  onSaved,
}: EditCommentFormProps) {
  const [body, setBody] = useState(initialBody);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    if (!body.trim()) return;
    setIsSaving(true);
    try {
      await editComment(postId, commentId, body.trim());
      toast.success("Comment updated");
      onSaved();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update comment"
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-2">
      <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} />
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSave} disabled={!body.trim() || isSaving}>
          {isSaving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}
