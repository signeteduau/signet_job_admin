import { useState, useEffect } from "react";
import { db, auth } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { UserCircle } from "lucide-react";

import PageHeader from "../../components/ui/PageHeader";
import PageShell from "../../components/ui/PageShell";
import SettingsPanel from "../../components/ui/SettingsPanel";
import FormField from "../../components/ui/FormField";

function stringToHSL(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${hash % 360}, 65%, 55%)`;
}

export default function ProfileSettings() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const user = auth.currentUser;
      if (!user) return;

      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setName(data.fullName || data.name || "");
        setEmail(data.email || user.email || "");
      } else {
        setEmail(user.email || "");
      }
    }
    loadUser();
  }, []);

  const saveChanges = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), { fullName: name.trim() });
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const initials = name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <PageShell>
      <PageHeader
        eyebrow="Settings"
        title="Profile Settings"
        description="Manage your admin profile on Signet"
      />

      <SettingsPanel
        icon={UserCircle}
        title="Personal information"
        description="Update how your name appears across the admin panel."
      >
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-[rgb(var(--background)/50%)] border border-[rgb(var(--card-border))]">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white shrink-0"
            style={{ background: stringToHSL(name || "User") }}
          >
            {initials || "A"}
          </div>
          <div className="min-w-0">
            <p className="font-semibold truncate">{name || "Admin User"}</p>
            <p className="text-sm text-[rgb(var(--foreground)/55%)] truncate">{email}</p>
          </div>
        </div>

        <FormField label="Full name" hint="This is shown in the top bar and activity logs.">
          <input
            type="text"
            className="signet-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
          />
        </FormField>

        <FormField label="Email address" hint="Email is managed through Firebase Auth and cannot be changed here.">
          <input type="email" className="signet-input" value={email} disabled />
        </FormField>

        <button type="button" onClick={saveChanges} disabled={saving} className="signet-btn">
          {saving ? "Saving…" : "Save changes"}
        </button>
      </SettingsPanel>
    </PageShell>
  );
}
