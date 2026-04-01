import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TipTapEditor } from "./editor/TipTapEditor";
import {
  PostMetadataSidebar,
  type PostMetadata,
} from "./PostMetadataSidebar";
import { useAutoSave } from "@/hooks/use-auto-save";
import { useAuth } from "@/hooks/use-auth";
import {
  createPost,
  updatePost,
  publishPost,
  generateSlug,
  isSlugUnique,
} from "@/lib/blog-mutations";
import { toast } from "sonner";
import { Save, Send, Eye, Loader2 } from "lucide-react";
import type { Post } from "@/types/blog";

interface PostFormProps {
  post?: Post | null;
  mode: "create" | "edit";
}

export function PostForm({ post, mode }: PostFormProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [postId, setPostId] = useState<string | null>(post?.id || null);
  const [isSaving, setIsSaving] = useState(false);
  const [slugGenerated, setSlugGenerated] = useState(false);

  const [metadata, setMetadata] = useState<PostMetadata>({
    status: post?.status || "draft",
    category: post?.categories?.[0] || "",
    tags: post?.tags || [],
    coverImage: post?.coverImage || "",
    excerpt: post?.excerpt || "",
    metaTitle: post?.metaTitle || "",
    metaDescription: post?.metaDescription || "",
    slug: post?.slug || "",
  });

  // Auto-generate slug from title on creation (only once)
  useEffect(() => {
    if (mode === "create" && !slugGenerated && title.length > 3) {
      setMetadata((prev) => ({ ...prev, slug: generateSlug(title) }));
    }
  }, [title, mode, slugGenerated]);

  // Mark slug as manually edited if user changes it
  function handleSlugChange(newMeta: PostMetadata) {
    if (newMeta.slug !== metadata.slug) {
      setSlugGenerated(true);
    }
    setMetadata(newMeta);
  }

  const getData = useCallback(
    () => ({
      title,
      content,
      slug: metadata.slug,
      excerpt: metadata.excerpt,
      coverImage: metadata.coverImage,
      categories: metadata.category ? [metadata.category] : [],
      tags: metadata.tags,
      status: metadata.status as "draft" | "published" | "scheduled",
      metaTitle: metadata.metaTitle,
      metaDescription: metadata.metaDescription,
      authorId: user?.uid || "",
    }),
    [title, content, metadata, user]
  );

  const { lastSaved, isSaving: isAutoSaving, markDirty } = useAutoSave({
    postId,
    getData,
    enabled: mode === "edit" && !!postId,
  });

  function handleContentChange(json: string) {
    setContent(json);
    markDirty();
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTitle(e.target.value);
    markDirty();
  }

  function handleMetadataChange(newMeta: PostMetadata) {
    handleSlugChange(newMeta);
    markDirty();
  }

  async function handleSaveDraft() {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setIsSaving(true);
    try {
      const data = getData();

      // Validate slug uniqueness
      const slugOk = await isSlugUnique(data.slug, postId || undefined);
      if (!slugOk) {
        toast.error("This slug is already in use. Please choose a different one.");
        setIsSaving(false);
        return;
      }

      if (mode === "create" && !postId) {
        const id = await createPost({ ...data, status: "draft" });
        setPostId(id);
        toast.success("Draft created");
        navigate(`/admin/blog/${id}/edit`, { replace: true });
      } else if (postId) {
        await updatePost(postId, { ...data, status: "draft" });
        toast.success("Draft saved");
      }
    } catch (err) {
      toast.error("Failed to save");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePublish() {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!metadata.category) {
      toast.error("Category is required to publish");
      return;
    }

    // Check content length — handles both TipTap JSON and HTML strings
    const textContent = getPlainText(content);
    if (textContent.length < 50) {
      toast.error("Post body must be at least 50 characters");
      return;
    }

    setIsSaving(true);
    try {
      const data = getData();

      const slugOk = await isSlugUnique(data.slug, postId || undefined);
      if (!slugOk) {
        toast.error("This slug is already in use. Please choose a different one.");
        setIsSaving(false);
        return;
      }

      // Auto-generate excerpt if empty
      if (!data.excerpt) {
        data.excerpt = getPlainText(content).slice(0, 140);
      }

      if (mode === "create" && !postId) {
        const id = await createPost({ ...data, status: "published" });
        setPostId(id);
        toast.success("Post published!");
        navigate(`/admin/blog/${id}/edit`, { replace: true });
      } else if (postId) {
        await publishPost(postId, data);
        toast.success("Post published!");
      }

      setMetadata((prev) => ({ ...prev, status: "published" }));
    } catch (err) {
      toast.error("Failed to publish");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }

  function handlePreview() {
    if (metadata.slug) {
      window.open(`/blog/${metadata.slug}?preview=true`, "_blank");
    } else {
      toast.error("Save the post first to preview");
    }
  }

  const autoSaveText = isAutoSaving
    ? "Saving…"
    : lastSaved
      ? `Last saved ${lastSaved.toLocaleTimeString()}`
      : "";

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Editor area */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Action bar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-1.5 h-4 w-4" />
              )}
              Save draft
            </Button>
            <Button size="sm" onClick={handlePublish} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-1.5 h-4 w-4" />
              )}
              Publish
            </Button>
            {postId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePreview}
              >
                <Eye className="mr-1.5 h-4 w-4" />
                Preview
              </Button>
            )}
          </div>
          {autoSaveText && (
            <span className="text-xs text-muted-foreground">
              {autoSaveText}
            </span>
          )}
        </div>

        {/* Title */}
        <Input
          value={title}
          onChange={handleTitleChange}
          placeholder="Post title"
          className="text-2xl font-bold h-auto py-3 border-none shadow-none focus-visible:ring-0 px-0 placeholder:text-muted-foreground/50"
        />

        {/* Editor */}
        <TipTapEditor
          content={content}
          postId={postId || undefined}
          onChange={handleContentChange}
        />
      </div>

      {/* Metadata sidebar */}
      <aside className="w-full lg:w-80 lg:shrink-0">
        <div className="sticky top-4 rounded-lg border bg-card p-4">
          <h3 className="font-semibold mb-4">Post Settings</h3>
          <PostMetadataSidebar
            metadata={metadata}
            onChange={handleMetadataChange}
            postId={postId || undefined}
          />
        </div>
      </aside>
    </div>
  );
}

function extractText(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const n = node as Record<string, unknown>;
  if (n.type === "text" && typeof n.text === "string") return n.text;
  if (Array.isArray(n.content)) return n.content.map(extractText).join(" ");
  return "";
}

/** Extract plain text from content — handles both TipTap JSON and HTML strings */
function getPlainText(content: string): string {
  if (!content) return "";
  try {
    const parsed = JSON.parse(content);
    return extractText(parsed);
  } catch {
    // HTML string — strip tags to get plain text
    return content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }
}
