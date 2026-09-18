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
    <div className="relative" ref={ref} data-no-row-click>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="signet-icon-btn !w-9 !h-9 !rounded-xl"
        aria-label="Row actions"
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-36 signet-dropdown-menu py-1 z-50 animate-fade">
          {items.map(({ label, icon: Icon, action, danger }) => (
            <button
              key={label}
              onClick={() => { setOpen(false); action(); }}
              className={`signet-dropdown-item ${danger ? "signet-dropdown-item-danger" : ""}`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
