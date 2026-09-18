import { useState } from "react";
import { db } from "../../firebase";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import PageHeader from "../../components/ui/PageHeader";
import PageShell from "../../components/ui/PageShell";
import FaqForm from "../../components/support-legal/FaqForm";
import { isHtmlEmpty } from "../../lib/supportLegal";

export default function AddFaq() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [type, setType] = useState("general");
  const [errorQuestion, setErrorQuestion] = useState("");
  const [errorAnswer, setErrorAnswer] = useState("");
  const [saving, setSaving] = useState(false);

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
      await addDoc(collection(db, "faqs"), {
        question: question.trim(),
        answer,
        type,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      toast.success("FAQ added successfully");
      navigate("/admin/faqs");
    } catch (err) {
      console.error("Could not save FAQ:", err);
      toast.error(err?.code === "permission-denied"
        ? "You don't have permission to publish FAQs."
        : "Could not save FAQ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell wide>
      <button type="button" onClick={() => navigate("/admin/faqs")} className="signet-back-link">
        <ArrowLeft size={16} /> Back to FAQs
      </button>

      <PageHeader
        eyebrow="FAQs"
        title="Add FAQ"
        description="Create a new help article for Signet users"
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
        saveLabel="Publish FAQ"
      />
    </PageShell>
  );
}
