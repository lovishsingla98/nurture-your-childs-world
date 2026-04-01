import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  type UploadTask,
} from "firebase/storage";
import { storage } from "./firebase";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export interface UploadProgress {
  progress: number; // 0–100
  url?: string;
  error?: string;
}

/**
 * Upload an image to Firebase Storage.
 * @param file - The file to upload
 * @param path - Storage path (e.g. "blog-covers/{postId}/{filename}")
 * @param onProgress - Callback for upload progress
 * @returns Download URL
 */
export function uploadImage(
  file: File,
  path: string,
  onProgress?: (progress: UploadProgress) => void
): { promise: Promise<string>; task: UploadTask } {
  if (!ALLOWED_TYPES.includes(file.type)) {
    const err = `Invalid file type. Allowed: JPG, PNG, WebP, GIF.`;
    onProgress?.({ progress: 0, error: err });
    return {
      promise: Promise.reject(new Error(err)),
      task: null as unknown as UploadTask,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    const err = `File too large. Maximum size is 5 MB.`;
    onProgress?.({ progress: 0, error: err });
    return {
      promise: Promise.reject(new Error(err)),
      task: null as unknown as UploadTask,
    };
  }

  const storageRef = ref(storage, path);
  const task = uploadBytesResumable(storageRef, file);

  const promise = new Promise<string>((resolve, reject) => {
    task.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        onProgress?.({ progress });
      },
      (error) => {
        onProgress?.({ progress: 0, error: error.message });
        reject(error);
      },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        onProgress?.({ progress: 100, url });
        resolve(url);
      }
    );
  });

  return { promise, task };
}
