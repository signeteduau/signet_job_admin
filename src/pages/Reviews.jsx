import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Pencil, Plus, Trash2 } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import ReviewCard from "../components/reviews/ReviewCard";
import {
  averageRating,
  fetchReviews,
  importWebsiteReviews,
  removeReview,
} from "../lib/reviews";

export default function Reviews() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState("");
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setReviews(await fetchReviews());
    } catch (err) {
      console.error(err);
      toast.error("Could not load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return reviews.filter((review) => {
      if (kind && review.kind !== kind) return false;
      if (!term) return true;
      return [review.name, review.title, review.place, review.quote, review.kind]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [reviews, search, kind]);

  const published = reviews.filter((review) => review.published);
  const average = averageRating(published.length ? published : reviews);

  const importFromSite = async () => {
    setImporting(true);
    try {
      const items = await importWebsiteReviews();
      setReviews(items);
      toast.success("Imported the reviews currently on the website");
    } catch (err) {
      console.error(err);
      toast.error(
        err?.code === "permission-denied"
          ? "You don't have permission to publish reviews."
          : "Could not import website reviews"
      );
    } finally {
      setImporting(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this review from the website?")) return;
    try {
      await removeReview(id);
      setReviews((prev) => prev.filter((review) => review.id !== id));
      toast.success("Review deleted");
    } catch (err) {
      console.error(err);
      toast.error("Could not delete review");
    }
  };

  return (
    <div className="space-y-6 max-w-[1100px]">
      <PageHeader
        eyebrow="Content"
        title="Reviews"
        description="Testimonials shown in the What people say section on signetemploymenthub.com"
        action={
          <button type="button" className="signet-btn" onClick={() => navigate("/admin/reviews/new")}>
            <Plus size={16} /> Add review
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="signet-stat-mini">
          <p>Total</p>
          <p>{reviews.length}</p>
        </div>
        <div className="signet-stat-mini">
          <p>Published</p>
          <p>{published.length}</p>
        </div>
        <div className="signet-stat-mini col-span-2 lg:col-span-1">
          <p>Average rating</p>
          <p>{average ? average.toFixed(1) : "—"}</p>
        </div>
      </div>

      <div className="signet-filter-bar flex flex-col sm:flex-row gap-3 sm:items-center">
        <input
          className="signet-input flex-1 min-w-0"
          placeholder="Search name, role, location, or quote…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select
          className="signet-select w-full sm:w-44"
          value={kind}
          onChange={(event) => setKind(event.target.value)}
        >
          <option value="">All audiences</option>
          <option value="Candidate">Candidate</option>
          <option value="Employer">Employer</option>
        </select>
      </div>

      {loading ? (
        <div className="signet-panel p-10 text-center text-sm opacity-60">Loading reviews…</div>
      ) : reviews.length === 0 ? (
        <div className="signet-panel p-8 sm:p-10 text-center space-y-4">
          <p className="signet-empty-title">No reviews yet</p>
          <p className="signet-empty-desc">
            Import the five testimonials already on the homepage, or write a new one.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button type="button" className="signet-btn-secondary" onClick={importFromSite} disabled={importing}>
              {importing ? "Importing…" : "Import website reviews"}
            </button>
            <button type="button" className="signet-btn" onClick={() => navigate("/admin/reviews/new")}>
              Add review
            </button>
          </div>
        </div>
      ) : (
        <div className="signet-review-list">
          {filtered.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              actions={
                <>
                  <button
                    type="button"
                    className="signet-review-icon-btn"
                    onClick={() => navigate(`/admin/reviews/${review.id}/edit`)}
                    aria-label={`Edit ${review.name}`}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    className="signet-review-icon-btn is-danger"
                    onClick={() => remove(review.id)}
                    aria-label={`Delete ${review.name}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </>
              }
            />
          ))}
          {filtered.length === 0 && (
            <div className="signet-panel p-8 text-center text-sm opacity-60">
              No reviews match this search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
