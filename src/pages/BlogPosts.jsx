import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
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
} from "lucide-react";
import RichEditor from "../components/RichEditor";
// simple slug generator
const makeSlug = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export default function BlogPosts() {
  // Blog form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);

  const [categoryId, setCategoryId] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [publishedDate, setPublishedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [saving, setSaving] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  // Categories
  const [categories, setCategories] = useState([]);
  const [catName, setCatName] = useState("");
  const [editingCatId, setEditingCatId] = useState(null);
  const [editingCatName, setEditingCatName] = useState("");
  const [loadingCats, setLoadingCats] = useState(true);

  // Load categories from Firestore
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const snap = await getDocs(collection(db, "blogCategories"));
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        setCategories(list);
      } catch (err) {
        console.error("Error loading blog categories:", err);
        toast.error("Failed to load categories");
      } finally {
        setLoadingCats(false);
      }
    };
    loadCategories();
  }, []);

  // Title + auto-slug
  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    if (!slugEdited) {
      setSlug(makeSlug(val));
    }
  };

  // Add category
  const handleAddCategory = async () => {
    const name = catName.trim();
    if (!name) return toast.error("Category name is required");

    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      return toast.error("Category already exists");
    }

    try {
      const ref = await addDoc(collection(db, "blogCategories"), {
        name,
        createdAt: serverTimestamp(),
      });
      setCategories((prev) =>
        [...prev, { id: ref.id, name }].sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );
      setCatName("");
      toast.success("Category added");
    } catch (err) {
      console.error("Add category error:", err);
      toast.error("Could not add category");
    }
  };

  // Start edit category
  const startEditCategory = (cat) => {
    setEditingCatId(cat.id);
    setEditingCatName(cat.name || "");
  };

  // Save edited category
  const saveCategoryEdit = async () => {
    const name = editingCatName.trim();
    if (!name || !editingCatId) {
      setEditingCatId(null);
      setEditingCatName("");
      return;
    }

    try {
      await updateDoc(doc(db, "blogCategories", editingCatId), { name });
      setCategories((prev) =>
        prev
          .map((c) => (c.id === editingCatId ? { ...c, name } : c))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      toast.success("Category updated");
    } catch (err) {
      console.error("Update category error:", err);
      toast.error("Could not update category");
    } finally {
      setEditingCatId(null);
      setEditingCatName("");
    }
  };

  // Delete category
  const deleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;

    try {
      await deleteDoc(doc(db, "blogCategories", id));
      setCategories((prev) => prev.filter((c) => c.id !== id));
      if (categoryId === id) setCategoryId("");
      toast.success("Category deleted");
    } catch (err) {
      console.error("Delete category error:", err);
      toast.error("Could not delete category");
    }
  };

  // Submit blog post
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Title is required");
    if (!content.trim()) return toast.error("Content is required");

    const finalSlug = (slug || makeSlug(title)).trim();
    if (!finalSlug) return toast.error("Slug cannot be empty");

    const tags = tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const selectedCat = categories.find((c) => c.id === categoryId);

    try {
      setSaving(true);
      await addDoc(collection(db, "articles"), {
        title: title.trim(),
        subtitle: "",
        image: featuredImage.trim(),
        author: author.trim() || "Signet",
        tags,
        featured: false,
        content,
        createdAt: serverTimestamp(),
      });

      toast.success("Article published");

      // Reset form
      setTitle("");
      setSlug("");
      setSlugEdited(false);
      setCategoryId("");
      setFeaturedImage("");
      setTagsText("");
      setContent("");
      setAuthor("");
      setWordCount(0);
      setPublishedDate(new Date().toISOString().slice(0, 10));
    } catch (err) {
      console.error("Create blog error:", err);
      toast.error("Could not publish blog");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[rgb(var(--foreground))]">
            Add New Blog
          </h1>
          <p className="text-sm text-[rgb(var(--foreground)/60%)]">
            Create and manage blog articles that appear on the home page.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        {/* MAIN FORM */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[rgb(var(--card-border))] bg-[rgb(var(--card))] p-6 shadow-sm space-y-5"
        >
          {/* Title + Slug */}
          <div>
            <label className="block text-sm font-medium mb-2">Blog Title</label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-lg border border-[rgb(var(--card-border))] bg-[rgb(var(--background))] focus:ring-2 focus:ring-[rgb(var(--purple))] outline-none text-[rgb(var(--foreground))]"
              placeholder="E.g. How to Ace Your First Interview"
              value={title}
              onChange={handleTitleChange}
            />

            <div className="mt-3">
              <label className="block text-xs font-medium mb-1">
                SEO Slug
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-lg border border-[rgb(var(--card-border))] bg-[rgb(var(--background))] text-xs focus:ring-2 focus:ring-[rgb(var(--purple))] outline-none"
                placeholder="auto-generated-from-title"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugEdited(true);
                }}
              />
              <p className="mt-1 text-[11px] text-[rgb(var(--foreground)/60%)]">
                URL: <span className="font-mono">/blog/{slug || "your-slug"}</span>
              </p>
            </div>
          </div>

          {/* Row: Category & Author */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Category select */}
            <div>
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <Tag size={14} /> Category
              </label>
              <select
                className="w-full px-4 py-2 rounded-lg border border-[rgb(var(--card-border))] bg-[rgb(var(--background))] text-sm focus:ring-2 focus:ring-[rgb(var(--purple))] outline-none"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Select category…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {loadingCats && (
                <p className="mt-1 text-xs text-[rgb(var(--foreground)/60%)]">
                  Loading categories…
                </p>
              )}
            </div>

            {/* Author */}
            <div>
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <User size={14} /> Author
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-lg border border-[rgb(var(--card-border))] bg-[rgb(var(--background))] focus:ring-2 focus:ring-[rgb(var(--purple))] outline-none text-[rgb(var(--foreground))]"
                placeholder="E.g. Signet"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>
          </div>

          {/* Row: Featured Image & Published Date */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Featured Image URL */}
            <div>
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <ImageIcon size={14} /> Feature Image URL
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-lg border border-[rgb(var(--card-border))] bg-[rgb(var(--background))] focus:ring-2 focus:ring-[rgb(var(--purple))] outline-none text-[rgb(var(--foreground))]"
                placeholder="https://…"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
              />
              {featuredImage && (
                <div className="mt-3 rounded-lg overflow-hidden border border-[rgb(var(--card-border))] bg-[rgb(var(--background))]">
                  <img
                    src={featuredImage}
                    alt="Preview"
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            {/* Published Date */}
            <div>
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <CalendarDays size={14} /> Published Date
              </label>
              <div className="relative">
                <CalendarDays
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 opacity-70"
                />
                <input
                  type="date"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-[rgb(var(--card-border))] bg-[rgb(var(--background))] text-sm focus:ring-2 focus:ring-[rgb(var(--purple))] outline-none"
                  value={publishedDate}
                  onChange={(e) => setPublishedDate(e.target.value)}
                />
              </div>
              <p className="mt-1 text-xs text-[rgb(var(--foreground)/60%)]">
                Defaults to today. You can backdate or schedule by changing it.
              </p>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Tags (comma separated)
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-lg border border-[rgb(var(--card-border))] bg-[rgb(var(--background))] focus:ring-2 focus:ring-[rgb(var(--purple))] outline-none text-[rgb(var(--foreground))]"
              placeholder="E.g. interview, tips, resume"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
            />
            {tagsText && (
              <div className="flex flex-wrap gap-2 mt-2 text-xs">
                {tagsText
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
                  .map((t) => (
                    <span
                      key={t}
                      className="px-3 py-1 rounded-full bg-[rgb(var(--purple))/10%] text-[rgb(var(--purple))] border border-[rgb(var(--purple))/30%]"
                    >
                      #{t}
                    </span>
                  ))}
              </div>
            )}
          </div>

          {/* Content / Rich editor */}
          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            <RichEditor
              value={content}
              onChange={setContent}
              onWordCountChange={setWordCount}
            />
            <p className="mt-1 text-xs text-[rgb(var(--foreground)/60%)]">
              {wordCount} words
            </p>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Plus size={16} />
              {saving ? "Publishing…" : "Publish Post"}
            </button>
          </div>
        </form>

        {/* CATEGORY MANAGER SIDEBAR */}
        <div className="rounded-2xl border border-[rgb(var(--card-border))] bg-[rgb(var(--card))] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Tag size={16} className="text-[rgb(var(--purple))]" />
              Blog Categories
            </h2>
          </div>

          {/* Add new category */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="New category name"
              className="flex-1 px-3 py-2 rounded-lg border border-[rgb(var(--card-border))] bg-[rgb(var(--background))] text-sm focus:ring-2 focus:ring-[rgb(var(--purple))] outline-none"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
            />
            <button
              type="button"
              onClick={handleAddCategory}
              className="btn-primary !px-3 !py-2 text-xs gap-1"
            >
              <Plus size={14} />
              Add
            </button>
          </div>

          {/* Categories list */}
          <div className="mt-3 space-y-2 max-h-72 overflow-auto pr-1">
            {categories.length === 0 && !loadingCats && (
              <p className="text-xs text-[rgb(var(--foreground)/60%)]">
                No categories yet. Add one above.
              </p>
            )}

            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-[rgb(var(--background))]/70 border border-[rgb(var(--card-border))]"
              >
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[rgb(var(--purple))]" />
                  {editingCatId === cat.id ? (
                    <input
                      autoFocus
                      className="text-xs bg-transparent border border-[rgb(var(--card-border))] rounded px-2 py-1 outline-none"
                      value={editingCatName}
                      onChange={(e) => setEditingCatName(e.target.value)}
                      onBlur={saveCategoryEdit}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          saveCategoryEdit();
                        }
                        if (e.key === "Escape") {
                          setEditingCatId(null);
                          setEditingCatName("");
                        }
                      }}
                    />
                  ) : (
                    <span className="text-sm">{cat.name}</span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => startEditCategory(cat)}
                    className="p-1 rounded-md hover:bg-[rgb(var(--foreground))/8%]"
                    title="Edit"
                  >
                    <PencilLine size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteCategory(cat.id)}
                    className="p-1 rounded-md hover:bg-red-500/10 text-red-500"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <p className="text-[11px] mt-2 text-[rgb(var(--foreground)/60%)]">
            These categories will be used when companies publish blog posts on
            the public site.
          </p>
        </div>
      </div>
    </div>
  );
}
