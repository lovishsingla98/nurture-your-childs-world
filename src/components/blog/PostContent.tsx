import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";

const lowlight = createLowlight(common);

interface PostContentProps {
  content: string;
}

export function PostContent({ content }: PostContentProps) {
  const parsedContent = (() => {
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
          class: "rounded-lg",
        },
      }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content: parsedContent,
    editable: false,
    editorProps: {
      attributes: {
        class: "outline-none",
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="prose prose-lg dark:prose-invert max-w-none prose-img:rounded-lg prose-a:text-primary prose-headings:scroll-mt-20">
      <EditorContent editor={editor} />
    </div>
  );
}
