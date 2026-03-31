import { useEffect, useRef, useState, useCallback } from "react";
import { updatePost, type PostInput } from "@/lib/blog-mutations";

const AUTO_SAVE_INTERVAL = 30_000; // 30 seconds

interface UseAutoSaveOptions {
  postId: string | null;
  getData: () => Partial<PostInput>;
  enabled?: boolean;
}

export function useAutoSave({ postId, getData, enabled = true }: UseAutoSaveOptions) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dirtyRef = useRef(false);

  const markDirty = useCallback(() => {
    dirtyRef.current = true;
  }, []);

  useEffect(() => {
    if (!postId || !enabled) return;

    const interval = setInterval(async () => {
      if (!dirtyRef.current) return;

      setIsSaving(true);
      setError(null);

      try {
        const data = getData();
        await updatePost(postId, data);
        dirtyRef.current = false;
        setLastSaved(new Date());
      } catch (e) {
        setError("Auto-save failed");
        console.error("Auto-save error:", e);
      } finally {
        setIsSaving(false);
      }
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [postId, getData, enabled]);

  const saveNow = useCallback(async () => {
    if (!postId) return;
    setIsSaving(true);
    setError(null);
    try {
      const data = getData();
      await updatePost(postId, data);
      dirtyRef.current = false;
      setLastSaved(new Date());
    } catch (e) {
      setError("Save failed");
      console.error("Save error:", e);
    } finally {
      setIsSaving(false);
    }
  }, [postId, getData]);

  return { lastSaved, isSaving, error, markDirty, saveNow };
}
