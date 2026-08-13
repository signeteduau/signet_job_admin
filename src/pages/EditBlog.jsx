import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { toast } from "react-hot-toast";
import {
  Plus,
  Tag,
  Trash2,
  PencilLine,
  Image as ImageIcon,
  CalendarDays,
  User,
  Save,
} from "lucide-react";

import RichEditor from "../components/RichEditor";

// slug generator (same as Add Blog)
const makeSlug = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export default function EditBlog() {
  const { id } = useParams();
  const navigate = useNavigate();

  // MAIN form states
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);

  const [categoryId, setCategoryId] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [publishedDate, setPublishedDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  // Categories
  const [categories, setCategories] = useState([]);
  const [catName, setCatName] = useState("");
  const [editingCatId, setEditingCatId] = useState(null);
  const [editingCatName, setEditingCatName] = useState("");
  const [loadingCats, setLoadingCats] = useState(true);

  // Load categories
  useEffect(() => {
    const load = async () => {
      const snap = await getDocs(collection(db, "blogCategories"));
      setCategories(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
      );
      setLoadingCats(false);
    };
    load();
  }, []);

  // Load blog data
  useEffect(() => {
    const loadBlog = async () => {
      try {
        const snap = await getDoc(doc(db, "articles", id));
        if (!snap.exists()) {
          toast.error("Blog not found");
          return navigate("/admin/all-blogs");
        }

        const data = snap.data();

        setTitle(data.title || "");
        setFeaturedImage(data.image || data.featuredImage || "");
        setTagsText(data.tags?.join(", ") || "");
        setContent(data.content || "");
        setAuthor(data.author || "");

        // calculate word count from existing HTML
        const plain = data.content?.replace(/<[^>]+>/g, " ") || "";
        setWordCount(plain.trim().split(/\s+/).length);
      } catch (e) {
        toast.error("Failed to load blog");
      }
    };
    loadBlog();
  }, [id]);

  // Title logic (same as Add Blog)
  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);

    if (!slugEdited) {
      setSlug(makeSlug(val));
    }
  };

  // Update submit
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!title.trim()) return toast.error("Title required");
    if (!content.trim()) return toast.error("Content required");

    const finalSlug = (slug || makeSlug(title)).trim();
    if (!finalSlug) return toast.error("Slug cannot be empty");

    const tags = tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      setSaving(true);

      await updateDoc(doc(db, "articles", id), {
        title,
        image: featuredImage,
        tags,
        content,
        author,
      });

      toast.success("Article updated!");
      navigate("/admin/all-blogs");
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-8 py-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[rgb(var(--foreground))]">
            Edit Blog
          </h1>
          <p className="text-sm text-[rgb(var(--foreground)/60%)]">
            Update and refine your blog article.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* MAIN FORM */}
        <form
          onSubmit={handleUpdate}
          className="rounded-2xl border border-[rgb(var(--card-border))] bg-[rgb(var(--card))] p-6 shadow-sm space-y-5"
        >
          {/* Title + Slug */}
          <div>
            <label className="block text-sm font-medium mb-2">Blog Title</label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-lg border border-[rgb(var(--card-border))] bg-[rgb(var(--background))] focus:ring-2 focus:ring-[rgb(var(--purple))] outline-none"
              value={title}
              onChange={handleTitleChange}
            />

            {/* Slug */}
            <div className="mt-3">
              <label className="block text-xs font-medium mb-1">
                SEO Slug
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-lg border border-[rgb(var(--card-border))] bg-[rgb(var(--background))] text-xs"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugEdited(true);
                }}
              />
              <p className="mt-1 text-[11px] opacity-60">
                URL: /blog/{slug || "your-slug"}
              </p>
            </div>
          </div>

          {/* CATEGORY + AUTHOR */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <Tag size={14} /> Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-[rgb(var(--card-border))]"
              >
                <option value="">Select category…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <User size={14} /> Author
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-lg border border-[rgb(var(--card-border))]"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>
          </div>

          {/* IMAGE + DATE */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <ImageIcon size={14} /> Feature Image URL
              </label>
              <input
                type="text"
                className="input-box"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
              />

              {featuredImage && (
                <img
                  src={featuredImage}
                  className="w-full h-32 object-cover rounded-lg border mt-2"
                />
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <CalendarDays size={14} /> Published Date
              </label>
              <input
                type="date"
                className="w-full px-4 py-2 rounded-lg border border-[rgb(var(--card-border))]"
                value={publishedDate}
                onChange={(e) => setPublishedDate(e.target.value)}
              />
            </div>
          </div>

          {/* TAGS */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Tags (comma separated)
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-lg border border-[rgb(var(--card-border))]"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
            />

            <div className="flex flex-wrap gap-2 mt-2 text-xs">
              {tagsText
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
                .map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-500 border border-purple-300/30"
                  >
                    #{t}
                  </span>
                ))}
            </div>
          </div>

          {/* CONTENT */}
          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            <RichEditor
              value={content}
              onChange={setContent}
              onWordCountChange={setWordCount}
            />

            <p className="mt-1 text-xs opacity-60">{wordCount} words</p>
          </div>

          {/* SAVE BUTTON */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary gap-2 disabled:opacity-60"
            >
              <Save size={16} />
              {saving ? "Updating…" : "Update Blog"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
