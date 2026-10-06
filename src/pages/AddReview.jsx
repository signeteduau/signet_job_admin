import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import ReviewForm from "../components/reviews/ReviewForm";
import { EMPTY_REVIEW, createReview, fetchReviews, validateReview } from "../lib/reviews";
import { useAuth } from "../context/AuthContext";
import { showConnectToAdmin } from "../lib/managementAccess";

export default function AddReview() {
  const navigate = useNavigate();
  const { canWrite } = useAuth();
  const [form, setForm] = useState(EMPTY_REVIEW);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchReviews()
      .then((items) => {
        const next = items.reduce((max, item) => Math.max(max, Number(item.order) || 0), 0) + 1;
        setForm((prev) => ({ ...prev, order: next }));
      })
      .catch(() => {});
  }, []);

  const save = async () => {
    if (!canWrite) {
      showConnectToAdmin();
      return;
    }
    const nextErrors = validateReview(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      toast.error("Please complete all required fields");
      return;
    }

    setSaving(true);
    try {
      await createReview(form);
      toast.success("Review published");
      navigate("/admin/reviews");
    } catch (err) {
      console.error(err);
      toast.error(
        err?.code === "permission-denied"
          ? "You don't have permission to publish reviews."
          : "Could not save review"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1100px]">
      <button type="button" onClick={() => navigate("/admin/reviews")} className="signet-back-link">
        <ArrowLeft size={16} /> Back to reviews
      </button>
      <PageHeader
        eyebrow="Reviews"
        title="Add review"
        description="Create a homepage testimonial for candidates or employers"
      />
      <ReviewForm
        form={form}
        onChange={setForm}
        errors={errors}
        saving={saving}
        onSave={save}
        onCancel={() => navigate("/admin/reviews")}
        saveLabel="Publish review"
      />
    </div>
  );
}
