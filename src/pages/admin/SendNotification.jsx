import { useState } from "react";
import { db } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "react-hot-toast";
import { Send } from "lucide-react";

import PageHeader from "../../components/ui/PageHeader";
import PageShell from "../../components/ui/PageShell";
import SettingsPanel from "../../components/ui/SettingsPanel";
import FormField from "../../components/ui/FormField";
import { useAuth } from "../../context/AuthContext";
import { blockIfViewer, viewerInputProps } from "../../lib/managementAccess";

export default function SendNotification() {
  const { canWrite } = useAuth();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("all");
  const [sending, setSending] = useState(false);
  const lock = viewerInputProps(canWrite);

  const sendNotification = async () => {
    if (blockIfViewer(canWrite)) return;
    if (!title.trim() || !message.trim()) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      setSending(true);
      await addDoc(collection(db, "notifications"), {
        title: title.trim(),
        message: message.trim(),
        for: audience,
        createdAt: serverTimestamp(),
        readBy: [],
      });
      toast.success("Notification sent");
      setTitle("");
      setMessage("");
    } catch {
      toast.error("Failed to send. Try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow="Settings"
        title="Send Notification"
        description="Broadcast an announcement to Signet users"
      />

      <SettingsPanel
        icon={Send}
        title="Compose message"
        description="Notifications appear in the user inbox on the Signet platform."
      >
        <FormField label="Title">
          <input
            type="text"
            className="signet-input"
            placeholder="e.g. Scheduled maintenance"
            value={title}
            onChange={(e) => {
              if (blockIfViewer(canWrite)) return;
              setTitle(e.target.value);
            }}
            {...lock}
          />
        </FormField>

        <FormField label="Message">
          <textarea
            rows={5}
            className="signet-input resize-y min-h-[120px]"
            placeholder="Write the notification message…"
            value={message}
            onChange={(e) => {
              if (blockIfViewer(canWrite)) return;
              setMessage(e.target.value);
            }}
            {...lock}
          />
        </FormField>

        <FormField label="Target audience">
          <select
            className="signet-select"
            data-viewer-action
            value={audience}
            onChange={(e) => {
              if (blockIfViewer(canWrite)) return;
              setAudience(e.target.value);
            }}
          >
            <option value="all">All users</option>
            <option value="company">Companies only</option>
            <option value="candidate">Candidates only</option>
          </select>
        </FormField>

        <button type="button" data-viewer-action onClick={sendNotification} disabled={sending} className="signet-btn">
          {sending ? "Sending…" : "Send notification"}
        </button>
      </SettingsPanel>
    </PageShell>
  );
}
