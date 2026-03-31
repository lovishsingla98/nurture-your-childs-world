import { useState, useCallback } from "react";
import { uploadImage, type UploadProgress } from "@/lib/storage";

interface UseImageUploadReturn {
  upload: (file: File, path: string) => Promise<string>;
  progress: number;
  isUploading: boolean;
  error: string | null;
  reset: () => void;
}

export function useImageUpload(): UseImageUploadReturn {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setProgress(0);
    setIsUploading(false);
    setError(null);
  }, []);

  const upload = useCallback(async (file: File, path: string): Promise<string> => {
    setIsUploading(true);
    setError(null);
    setProgress(0);

    try {
      const { promise } = uploadImage(file, path, (p: UploadProgress) => {
        setProgress(p.progress);
        if (p.error) setError(p.error);
      });
      const url = await promise;
      setIsUploading(false);
      return url;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      setError(msg);
      setIsUploading(false);
      throw e;
    }
  }, []);

  return { upload, progress, isUploading, error, reset };
}
