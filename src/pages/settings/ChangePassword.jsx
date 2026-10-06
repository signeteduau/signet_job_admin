import { useState } from "react";
import { auth } from "../../firebase";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import toast from "react-hot-toast";
import { LockKeyhole } from "lucide-react";

import PageHeader from "../../components/ui/PageHeader";
import PageShell from "../../components/ui/PageShell";
import SettingsPanel from "../../components/ui/SettingsPanel";
import FormField from "../../components/ui/FormField";
import { useAuth } from "../../context/AuthContext";
import { blockIfViewer, viewerInputProps } from "../../lib/managementAccess";

export default function ChangePassword() {
  const { canWrite } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const lock = viewerInputProps(canWrite);

  const handleChangePassword = async () => {
    if (blockIfViewer(canWrite)) return;
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
            onChange={(e) => {
              if (blockIfViewer(canWrite)) return;
              setCurrentPassword(e.target.value);
            }}
            autoComplete="current-password"
            {...lock}
          />
        </FormField>

        <FormField label="New password" hint="Minimum 6 characters.">
          <input
            type="password"
            className="signet-input"
            value={newPassword}
            onChange={(e) => {
              if (blockIfViewer(canWrite)) return;
              setNewPassword(e.target.value);
            }}
            autoComplete="new-password"
            {...lock}
          />
        </FormField>

        <FormField label="Confirm new password">
          <input
            type="password"
            className="signet-input"
            value={confirmPassword}
            onChange={(e) => {
              if (blockIfViewer(canWrite)) return;
              setConfirmPassword(e.target.value);
            }}
            autoComplete="new-password"
            {...lock}
          />
        </FormField>

        <button type="button" data-viewer-action disabled={loading} onClick={handleChangePassword} className="signet-btn">
          {loading ? "Updating…" : "Update password"}
        </button>
      </SettingsPanel>
    </PageShell>
  );
}
