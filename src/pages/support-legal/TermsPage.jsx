import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "react-hot-toast";
import { FileText } from "lucide-react";

import PageHeader from "../../components/ui/PageHeader";
import PageShell from "../../components/ui/PageShell";
import SupportLegalNav from "../../components/support-legal/SupportLegalNav";
import LegalEditorLayout from "../../components/support-legal/LegalEditorLayout";
import { isHtmlEmpty } from "../../lib/supportLegal";

export default function TermsPage() {
  const [content, setContent] = useState("");
  const [type, setType] = useState("general");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "legal", "terms"));
      if (snap.exists()) {
        setContent(snap.data().content || "");
        setType(snap.data().type || "general");
      }
      setLoading(false);
    };
    load();
  }, []);

  const save = async () => {
    if (isHtmlEmpty(content)) {
      setError("Content is required");
      toast.error("Content cannot be empty");
      return;
    }

    setSaving(true);
    try {
      await setDoc(
        doc(db, "legal", "terms"),
        { content, type, updatedAt: serverTimestamp() },
        { merge: true }
      );
      toast.success("Terms & Conditions updated");
      setError("");
    } catch {
      toast.error("Could not save terms");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell wide>
      <PageHeader
        eyebrow="Support & Legal"
        title="Terms & Conditions"
        description="Manage the legal terms shown to Signet users"
      />

      <SupportLegalNav />

      {loading ? (
        <div className="signet-panel p-12 text-center text-sm opacity-60 animate-pulse">Loading content…</div>
      ) : (
        <LegalEditorLayout
          icon={FileText}
          title="Terms content"
          description="This document is published on Signet based on the selected audience."
          content={content}
          type={type}
          onContentChange={(value) => {
            setContent(value);
            if (error) setError("");
          }}
          onTypeChange={setType}
          onSave={save}
          saving={saving}
          error={error}
          saveLabel="Save terms"
          previewTitle="Terms & Conditions"
        />
      )}
    </PageShell>
  );
}
