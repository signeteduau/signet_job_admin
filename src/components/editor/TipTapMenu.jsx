import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  Image as ImageIcon,
  Youtube as YoutubeIcon,
} from "lucide-react";

export default function MenuBar({ editor }) {
  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt("Image URL");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const addYoutube = () => {
    const url = window.prompt("YouTube URL");
    if (url) {
      editor.commands.setYoutubeVideo({
        src: url,
        width: 640,
        height: 360,
      });
    }
  };

  const baseBtn =
    "p-2 rounded transition text-[rgb(var(--foreground))] hover:bg-[rgb(var(--foreground)/10%)]";

  const active =
    "bg-[rgb(var(--purple)/20%)] text-[rgb(var(--purple))]";

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-[rgb(var(--card-border))] bg-[rgb(var(--background))]">
      {/* Bold */}
      <button
        className={`${baseBtn} ${editor.isActive("bold") ? active : ""}`}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold size={16} />
      </button>

      {/* Italic */}
      <button
        className={`${baseBtn} ${editor.isActive("italic") ? active : ""}`}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic size={16} />
      </button>

      {/* Underline */}
      <button
        className={`${baseBtn} ${editor.isActive("underline") ? active : ""}`}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <Underline size={16} />
      </button>

      {/* Strike */}
      <button
        className={`${baseBtn} ${editor.isActive("strike") ? active : ""}`}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough size={16} />
      </button>

      {/* Bullet List */}
      <button
        className={`${baseBtn} ${editor.isActive("bulletList") ? active : ""}`}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List size={16} />
      </button>

      {/* Ordered List */}
      <button
        className={`${baseBtn} ${editor.isActive("orderedList") ? active : ""}`}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered size={16} />
      </button>

      {/* Align Left */}
      <button
        className={`${baseBtn} ${editor.isActive({ textAlign: "left" }) ? active : ""}`}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      >
        <AlignLeft size={16} />
      </button>

      {/* Align Center */}
      <button
        className={`${baseBtn} ${editor.isActive({ textAlign: "center" }) ? active : ""}`}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      >
        <AlignCenter size={16} />
      </button>

      {/* Align Right */}
      <button
        className={`${baseBtn} ${editor.isActive({ textAlign: "right" }) ? active : ""}`}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      >
        <AlignRight size={16} />
      </button>

      {/* Highlight */}
      <button
        className={`${baseBtn} ${editor.isActive("highlight") ? active : ""}`}
        onClick={() => editor.chain().focus().toggleHighlight().run()}
      >
        <Highlighter size={16} />
      </button>

      {/* Image */}
      <button className={baseBtn} onClick={addImage}>
        <ImageIcon size={16} />
      </button>

      {/* YouTube */}
      <button className={baseBtn} onClick={addYoutube}>
        <YoutubeIcon size={16} />
      </button>
    </div>
  );
}
