import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import ReviewForm from "../components/reviews/ReviewForm";
import { EMPTY_REVIEW, fetchReview, updateReview, validateReview } from "../lib/reviews";

export default function EditReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_REVIEW);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    (async () => {
      try {
        const review = await fetchReview(id);
        if (!alive) return;
        if (!review) {
          setMissing(true);
        } else {
          setForm(review);
        }
      } catch (err) {
        console.error(err);
        if (alive) setMissing(true);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  const save = async () => {
    const nextErrors = validateReview(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      toast.error("Please complete all required fields");
      return;
    }

    setSaving(true);
    try {
      await updateReview(id, form);
      toast.success("Review updated");
      navigate("/admin/reviews");
    } catch (err) {
      console.error(err);
      toast.error(
        err?.code === "permission-denied"
          ? "You don't have permission to update reviews."
          : "Could not update review"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="signet-panel p-10 text-center text-sm opacity-60">Loading review…</div>;
  }

  if (missing) {
    return (
      <div className="signet-table-wrap">
        <EmptyState title="Review not found" description="This review may have been deleted." />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1100px]">
      <button type="button" onClick={() => navigate("/admin/reviews")} className="signet-back-link">
        <ArrowLeft size={16} /> Back to reviews
      </button>
      <PageHeader
        eyebrow="Reviews"
        title="Edit review"
        description="Update the homepage testimonial"
      />
      <ReviewForm
        form={form}
        onChange={setForm}
        errors={errors}
        saving={saving}
        onSave={save}
        onCancel={() => navigate("/admin/reviews")}
        saveLabel="Save changes"
      />
    </div>
  );
}
