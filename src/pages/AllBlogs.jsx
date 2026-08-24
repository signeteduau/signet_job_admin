import { useEffect, useState, useMemo } from "react";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc, orderBy, query } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Search, Pencil, Trash2, Star } from "lucide-react";
import { toDate } from "../lib/firestore";
import { articleCategoryLabel } from "../lib/articles";

export default function AllBlogs() {
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const q = query(collection(db, "articles"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        setArticles(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch {
        const snap = await getDocs(collection(db, "articles"));
        setArticles(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      if (!search) return true;
      const term = search.toLowerCase();
      return (
        (a.title || "").toLowerCase().includes(term) ||
        (a.author || "").toLowerCase().includes(term) ||
        (a.categoryName || "").toLowerCase().includes(term) ||
        (a.tags || []).join(" ").toLowerCase().includes(term)
      );
    });
  }, [articles, search]);

  const deleteArticle = async (id) => {
    if (!window.confirm("Delete this article?")) return;
    await deleteDoc(doc(db, "articles", id));
    setArticles((prev) => prev.filter((a) => a.id !== id));
    toast.success("Article deleted");
  };

  return (
    <div className="space-y-6">
      <div className="signet-page-head flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="signet-eyebrow">Content</p>
          <h1>Career Articles</h1>
          <p>Content shown on Signet candidate portal</p>
        </div>
        <button className="signet-btn" onClick={() => navigate("/admin/add-blog")}>
          + New Article
        </button>
      </div>

      <div className="signet-filter-bar flex gap-4 items-center">
        <div className="flex items-center gap-2 px-3 py-2 border border-[rgb(var(--card-border))] rounded-lg bg-[rgb(var(--background))] w-72">
          <Search size={16} />
          <input
            placeholder="Search articles..."
            className="bg-transparent outline-none w-full text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="signet-table-wrap">
        <table className="w-full text-sm">
          <thead className="bg-[rgb(var(--card))]">
            <tr>
              <th className="text-left px-4 py-3">Title</th>
              <th className="text-left px-4 py-3">Category</th>
              <th className="text-left px-4 py-3">Author</th>
              <th className="text-left px-4 py-3">Tags</th>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id} className="border-t border-[rgb(var(--card-border))] hover:bg-[rgb(var(--purple))/4%]">
                <td className="px-4 py-3 font-medium">
                  <div className="flex items-center gap-2">
                    {a.featured && <Star size={14} className="text-amber-500 fill-amber-500" />}
                    {a.title}
                  </div>
                  {a.subtitle && <p className="text-xs opacity-60 mt-0.5">{a.subtitle}</p>}
                </td>
                <td className="px-4 py-3">
                  {articleCategoryLabel(a) !== "—" ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[rgb(var(--purple))/10%] text-[rgb(var(--purple))]">
                      {articleCategoryLabel(a)}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3">{a.author || "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {(a.tags || []).slice(0, 3).map((t) => (
                      <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-[rgb(var(--purple))/10%] text-[rgb(var(--purple))]">{t}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {toDate(a.createdAt)?.toLocaleDateString() || "—"}
                </td>
                <td className="px-4 py-3 flex gap-3">
                  <button className="text-[rgb(var(--purple))] hover:opacity-80" onClick={() => navigate(`/admin/all-blogs/edit/${a.id}`)}>
                    <Pencil size={16} />
                  </button>
                  <button className="text-red-500 hover:opacity-80" onClick={() => deleteArticle(a.id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center opacity-60" colSpan={6}>No articles found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
