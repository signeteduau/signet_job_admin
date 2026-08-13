import { Eye, Pencil, Trash, MoreVertical } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function TableActions({ onView, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const items = [
    onView && { label: "View", icon: Eye, action: onView },
    onEdit && { label: "Edit", icon: Pencil, action: onEdit },
    onDelete && { label: "Delete", icon: Trash, action: onDelete, danger: true },
  ].filter(Boolean);

  if (items.length === 0) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="signet-icon-btn !w-9 !h-9 !rounded-xl"
        aria-label="Row actions"
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-36 signet-panel py-1 z-50 animate-fade shadow-xl">
          {items.map(({ label, icon: Icon, action, danger }) => (
            <button
              key={label}
              onClick={() => { setOpen(false); action(); }}
              className={`flex items-center gap-2 px-3 py-2.5 w-full text-left text-sm hover:bg-[rgb(var(--foreground))/8%] ${
                danger ? "text-red-500" : ""
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
