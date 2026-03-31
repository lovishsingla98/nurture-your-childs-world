import { useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { EditorToolbar } from "./EditorToolbar";
import { useImageUpload } from "@/hooks/use-image-upload";
import { toast } from "sonner";

const lowlight = createLowlight(common);

interface TipTapEditorProps {
  content: string;
  postId?: string;
  onChange?: (json: string) => void;
}

export function TipTapEditor({ content, postId, onChange }: TipTapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading } = useImageUpload();

  const parsedContent = (() => {
    if (!content) return "";
    try {
      return JSON.parse(content);
    } catch {
      return content;
    }
  })();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Image.configure({
        HTMLAttributes: {
          loading: "lazy",
          class: "rounded-lg max-w-full",
        },
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Underline,
      Highlight,
      Placeholder.configure({
        placeholder: "Start writing your post…",
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content: parsedContent,
    editorProps: {
      attributes: {
        class:
          "prose prose-lg dark:prose-invert max-w-none min-h-[400px] p-4 outline-none focus:outline-none prose-img:rounded-lg prose-a:text-primary",
      },
    },
    onUpdate: ({ editor }) => {
      const json = JSON.stringify(editor.getJSON());
      onChange?.(json);
    },
  });

  async function handleImageUpload() {
    fileInputRef.current?.click();
  }

  async function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    const id = postId || "unsaved";
    const path = `blog-images/${id}/${Date.now()}-${file.name}`;

    try {
      toast.info("Uploading image…");
      const url = await upload(file, path);
      editor.chain().focus().setImage({ src: url, alt: file.name }).run();
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Image upload failed. Please try again.");
    }

    // Reset input so same file can be selected again
    e.target.value = "";
  }

  if (!editor) return null;

  return (
    <div className="rounded-lg border">
      <div className="sticky top-0 z-10">
        <EditorToolbar editor={editor} onImageUpload={handleImageUpload} />
      </div>
      <EditorContent editor={editor} />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={onFileSelected}
      />
      {isUploading && (
        <div className="border-t px-4 py-2 text-xs text-muted-foreground">
          Uploading image…
        </div>
      )}
    </div>
  );
}
