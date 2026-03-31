import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Image, X, Upload } from "lucide-react";
import { useImageUpload } from "@/hooks/use-image-upload";
import { toast } from "sonner";
import type { PostStatus } from "@/types/blog";

export interface PostMetadata {
  status: PostStatus;
  category: string;
  tags: string[];
  coverImage: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  slug: string;
}

interface PostMetadataSidebarProps {
  metadata: PostMetadata;
  onChange: (metadata: PostMetadata) => void;
  postId?: string;
}

export function PostMetadataSidebar({
  metadata,
  onChange,
  postId,
}: PostMetadataSidebarProps) {
  const [tagInput, setTagInput] = useState("");
  const coverInputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading } = useImageUpload();

  function update(partial: Partial<PostMetadata>) {
    onChange({ ...metadata, ...partial });
  }

  function addTag(value: string) {
    const tag = value.trim().toLowerCase().replace(/\s+/g, "-");
    if (tag && !metadata.tags.includes(tag)) {
      update({ tags: [...metadata.tags, tag] });
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    update({ tags: metadata.tags.filter((t) => t !== tag) });
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    }
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const id = postId || "unsaved";
    const path = `blog-covers/${id}/${Date.now()}-${file.name}`;
    try {
      const url = await upload(file, path);
      update({ coverImage: url });
      toast.success("Cover image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
    e.target.value = "";
  }

  return (
    <div className="space-y-6">
      {/* Status */}
      <div className="space-y-2">
        <Label>Status</Label>
        <Select
          value={metadata.status}
          onValueChange={(v) => update({ status: v as PostStatus })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>Category</Label>
        <Input
          value={metadata.category}
          onChange={(e) => update({ category: e.target.value })}
          placeholder="e.g. Parenting, Activities"
        />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {metadata.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 pr-1">
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <Input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          placeholder="Type tag and press Enter"
        />
      </div>

      {/* Cover Image */}
      <div className="space-y-2">
        <Label>Cover Image</Label>
        {metadata.coverImage ? (
          <div className="relative">
            <img
              src={metadata.coverImage}
              alt="Cover"
              className="w-full aspect-video object-cover rounded-lg border"
            />
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => update({ coverImage: "" })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => coverInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              "Uploading…"
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" /> Upload cover image
              </>
            )}
          </Button>
        )}
        <input
          ref={coverInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleCoverUpload}
        />
      </div>

      {/* Excerpt */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Excerpt</Label>
          <span className="text-xs text-muted-foreground">
            {metadata.excerpt.length}/280
          </span>
        </div>
        <Textarea
          value={metadata.excerpt}
          onChange={(e) =>
            update({ excerpt: e.target.value.slice(0, 280) })
          }
          placeholder="Brief summary (auto-generated from body if empty)"
          rows={3}
        />
      </div>

      {/* Slug */}
      <div className="space-y-2">
        <Label>Slug</Label>
        <Input
          value={metadata.slug}
          onChange={(e) => update({ slug: e.target.value })}
          placeholder="auto-generated-from-title"
        />
      </div>

      {/* SEO Fields */}
      <Accordion type="single" collapsible>
        <AccordionItem value="seo">
          <AccordionTrigger className="text-sm">SEO settings</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Meta title</Label>
                <span className="text-xs text-muted-foreground">
                  {metadata.metaTitle.length}/60
                </span>
              </div>
              <Input
                value={metadata.metaTitle}
                onChange={(e) =>
                  update({ metaTitle: e.target.value.slice(0, 60) })
                }
                placeholder="Defaults to post title"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Meta description</Label>
                <span className="text-xs text-muted-foreground">
                  {metadata.metaDescription.length}/160
                </span>
              </div>
              <Textarea
                value={metadata.metaDescription}
                onChange={(e) =>
                  update({ metaDescription: e.target.value.slice(0, 160) })
                }
                placeholder="Defaults to excerpt"
                rows={2}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
