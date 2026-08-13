import { useState } from "react";
import { auth } from "../../firebase";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import toast from "react-hot-toast";
import { LockKeyhole } from "lucide-react";

import PageHeader from "../../components/ui/PageHeader";
import PageShell from "../../components/ui/PageShell";
import SettingsPanel from "../../components/ui/SettingsPanel";
import FormField from "../../components/ui/FormField";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      const cred = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPassword);
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(
        err.message.includes("wrong-password") ? "Current password is incorrect" : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow="Settings"
        title="Change Password"
        description="Keep your admin account secure with a strong password"
      />

      <SettingsPanel
        icon={LockKeyhole}
        title="Update password"
        description="You will need your current password to set a new one."
      >
        <FormField label="Current password">
          <input
            type="password"
            className="signet-input"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
          />
        </FormField>

        <FormField label="New password" hint="Minimum 6 characters.">
          <input
            type="password"
            className="signet-input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
          />
        </FormField>

        <FormField label="Confirm new password">
          <input
            type="password"
            className="signet-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
        </FormField>

        <button type="button" disabled={loading} onClick={handleChangePassword} className="signet-btn">
          {loading ? "Updating…" : "Update password"}
        </button>
      </SettingsPanel>
    </PageShell>
  );
}
