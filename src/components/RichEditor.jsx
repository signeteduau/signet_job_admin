// src/components/RichEditor.jsx
import { useMemo, useRef, useState } from "react";
import ReactQuill from "react-quill-new";
import { toast } from "react-hot-toast";
import "react-quill-new/dist/quill.snow.css";
import { uploadArticleImage, getStorageErrorMessage } from "../lib/storage";

export default function RichEditor({
  value,
  onChange,
  onWordCountChange,
  placeholder = "Write your blog content here…",
}) {
  const quillRef = useRef(null);
  const [preview, setPreview] = useState(false);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ align: [] }],
          ["blockquote", "code-block"],
          ["link", "image"],
          ["clean"],
        ],
        handlers: {
          image: () => {
            const input = document.createElement("input");
            input.setAttribute("type", "file");
            input.setAttribute("accept", "image/*");
            input.click();

            input.onchange = async () => {
              const file = input.files?.[0];
              if (!file) return;

              const quill = quillRef.current?.getEditor?.();
              if (!quill) return;

              const range =
                quill.getSelection(true) || {
                  index: quill.getLength(),
                  length: 0,
                };

              try {
                const url = await uploadArticleImage(file, "inline");
                quill.insertEmbed(range.index, "image", url, "user");
                quill.setSelection(range.index + 1);
              } catch (err) {
                console.error("Inline image upload failed:", err);
                toast.error(getStorageErrorMessage(err) || err.message || "Image upload failed");
              }
            };
          },
        },
      },
      clipboard: { matchVisual: true },
    }),
    []
  );

  const handleChange = (html) => {
    onChange?.(html);

    if (onWordCountChange) {
      const text = html
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .trim();
      const count = text ? text.split(/\s+/).length : 0;
      onWordCountChange(count);
    }
  };

  return (
    <div className="rounded-xl border border-[rgb(var(--card-border))] bg-[rgb(var(--background))] overflow-hidden">
      {/* Header: editor / preview toggle */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[rgb(var(--card-border))] text-xs text-[rgb(var(--foreground))/75%]">
        <div className="inline-flex gap-1 rounded-lg bg-[rgb(var(--card))] p-1">
          <button
            type="button"
            onClick={() => setPreview(false)}
            className={`px-2 py-1 rounded-md transition text-xs ${
              !preview
                ? "bg-[rgb(var(--purple))/12%] text-[rgb(var(--purple))]"
                : "hover:bg-[rgb(var(--foreground))/6%]"
            }`}
          >
            Editor
          </button>
          <button
            type="button"
            onClick={() => setPreview(true)}
            className={`px-2 py-1 rounded-md transition text-xs ${
              preview
                ? "bg-[rgb(var(--purple))/12%] text-[rgb(var(--purple))]"
                : "hover:bg-[rgb(var(--foreground))/6%]"
            }`}
          >
            Preview
          </button>
        </div>
      </div>

      {!preview ? (
        <ReactQuill
          ref={(instance) => {
            // ✅ just store instance; DON'T call getEditor here
            quillRef.current = instance || null;
          }}
          theme="snow"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          modules={modules}
          className="min-h-[220px]"
        />
      ) : (
        <div className="p-4 text-sm leading-relaxed space-y-2 bg-[rgb(var(--background))]">
          {value ? (
            <div dangerouslySetInnerHTML={{ __html: value }} />
          ) : (
            <p className="opacity-60">Nothing to preview yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
