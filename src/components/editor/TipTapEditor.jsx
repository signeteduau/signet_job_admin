import React from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";

import MenuBar from "./TipTapMenu";

export default function TipTapEditor({ content, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight,
      Link.configure({ openOnClick: false }),
      Image,
      Youtube.configure({
        controls: true,
        nocookie: true,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  return (
    <div className="rounded-lg overflow-hidden border border-[rgb(var(--card-border))] bg-[rgb(var(--card))]">
      <MenuBar editor={editor} />

      <EditorContent
        editor={editor}
        className="tiptap px-4 py-3 bg-[rgb(var(--card))] text-[rgb(var(--foreground))]"
      />
    </div>
  );
}
