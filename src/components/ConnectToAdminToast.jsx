import { ShieldCheck, X } from "lucide-react";
import toast from "react-hot-toast";

export function showConnectToAdminToast() {
  toast.custom(
    (t) => (
      <div
        className={`signet-connect-toast${t.visible ? " is-open" : ""}`}
        data-viewer-ok
        role="status"
        aria-live="polite"
      >
        <span className="signet-connect-toast-icon" aria-hidden>
          <ShieldCheck size={20} strokeWidth={2.25} />
        </span>
        <div className="signet-connect-toast-copy">
          <strong>Connect to admin</strong>
          <p>This account is view only. Ask an admin to add or remove anything.</p>
        </div>
        <button
          type="button"
          className="signet-connect-toast-close"
          aria-label="Dismiss"
          data-viewer-ok
          onClick={() => toast.dismiss(t.id)}
        >
          <X size={16} />
        </button>
      </div>
    ),
    {
      id: "connect-to-admin",
      duration: 4200,
      position: "top-center",
    }
  );
}
