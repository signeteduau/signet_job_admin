import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

import PageHeader from "../../components/ui/PageHeader";
import PageShell from "../../components/ui/PageShell";
import EmptyState from "../../components/ui/EmptyState";
import FaqForm from "../../components/support-legal/FaqForm";
import { isHtmlEmpty } from "../../lib/supportLegal";

export default function EditFaq() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [type, setType] = useState("general");
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorQuestion, setErrorQuestion] = useState("");
  const [errorAnswer, setErrorAnswer] = useState("");

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const snap = await getDoc(doc(db, "faqs", id));
      if (snap.exists()) {
        const d = snap.data();
        setQuestion(d.question || "");
        setAnswer(d.answer || "");
        setType(d.type || "general");
      } else {
        setMissing(true);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const save = async () => {
    let hasError = false;
    if (!question.trim()) {
      setErrorQuestion("Question is required");
      hasError = true;
    } else {
      setErrorQuestion("");
    }
    if (isHtmlEmpty(answer)) {
      setErrorAnswer("Answer is required");
      hasError = true;
    } else {
      setErrorAnswer("");
    }
    if (hasError) {
      toast.error("Please complete all required fields");
      return;
    }

    setSaving(true);
    try {
      await setDoc(doc(db, "faqs", id), {
        question: question.trim(),
        answer,
        type,
        updatedAt: Timestamp.now(),
      }, { merge: true });
      toast.success("FAQ updated");
      navigate("/admin/faqs");
    } catch (err) {
      console.error("Could not update FAQ:", err);
      toast.error(err?.code === "permission-denied"
        ? "You don't have permission to update FAQs."
        : "Could not update FAQ");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageShell wide>
        <div className="signet-panel p-12 text-center text-sm opacity-60 animate-pulse">Loading FAQ…</div>
      </PageShell>
    );
  }

  if (missing) {
    return (
      <PageShell wide>
        <div className="signet-table-wrap">
          <EmptyState title="FAQ not found" description="This FAQ may have been deleted." />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell wide>
      <button type="button" onClick={() => navigate("/admin/faqs")} className="signet-back-link">
        <ArrowLeft size={16} /> Back to FAQs
      </button>

      <PageHeader
        eyebrow="FAQs"
        title="Edit FAQ"
        description="Update question, audience, or answer content"
      />

      <FaqForm
        question={question}
        answer={answer}
        type={type}
        onQuestionChange={setQuestion}
        onAnswerChange={setAnswer}
        onTypeChange={setType}
        onSave={save}
        onCancel={() => navigate("/admin/faqs")}
        saving={saving}
        errorQuestion={errorQuestion}
        errorAnswer={errorAnswer}
        saveLabel="Save changes"
      />
    </PageShell>
  );
}
