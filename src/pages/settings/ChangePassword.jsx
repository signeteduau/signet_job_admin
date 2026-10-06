import { useEffect, useState } from "react";
import { auth } from "../../firebase";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import toast from "react-hot-toast";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";

import PageHeader from "../../components/ui/PageHeader";
import PageShell from "../../components/ui/PageShell";
import SettingsPanel from "../../components/ui/SettingsPanel";
import FormField from "../../components/ui/FormField";
import { useAuth } from "../../context/AuthContext";
import { MANAGEMENT_DEFAULT_PASSWORD, normalizeEmail } from "../../lib/managementAccess";

function passwordChangedKey(email) {
  return `signet.passwordChanged.${normalizeEmail(email)}`;
}

function PasswordField({ id, value, onChange, autoComplete, placeholder }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="signet-password-field">
      <input
        id={id}
        type={visible ? "text" : "password"}
        className="signet-input"
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder={placeholder}
      />
      <button
        type="button"
        className="signet-password-toggle"
        onClick={() => setVisible((open) => !open)}
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

export default function ChangePassword() {
  const { isViewer, user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formKey, setFormKey] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isViewer || !user?.email) return;
    if (localStorage.getItem(passwordChangedKey(user.email))) return;
    setCurrentPassword(MANAGEMENT_DEFAULT_PASSWORD);
  }, [isViewer, user?.email]);

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
      if (user?.email) localStorage.setItem(passwordChangedKey(user.email), "1");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setFormKey((key) => key + 1);
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
        description="Keep your account secure with a strong password"
      />

      <div data-viewer-ok key={formKey}>
        <SettingsPanel
          icon={LockKeyhole}
          title="Update password"
          description="You will need your current password to set a new one."
        >
          <FormField label="Current password">
            <PasswordField
              id="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
          </FormField>

          <FormField label="New password" hint="Minimum 6 characters.">
            <PasswordField
              id="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
          </FormField>

          <FormField label="Confirm new password">
            <PasswordField
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </FormField>

          <button type="button" disabled={loading} onClick={handleChangePassword} className="signet-btn">
            {loading ? "Updating…" : "Update password"}
          </button>
        </SettingsPanel>
      </div>
    </PageShell>
  );
}
