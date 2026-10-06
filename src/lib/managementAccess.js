import { showConnectToAdminToast } from "../components/ConnectToAdminToast";

export const CONNECT_TO_ADMIN = "Connect to admin";
export const MANAGEMENT_DEFAULT_PASSWORD = "SignetHub@2026";

export const MANAGEMENT_EMAILS = [
  "pushpinder@signet.edu.au",
  "mac@signet.edu.au",
  "justin.f@signet.edu.au",
  "salesmanager@signet.edu.au",
  "christine.w@signet.edu.au",
  "navdeep.k@signet.edu.au",
  "mai.n@signet.edu.au",
];

const MANAGEMENT_SET = new Set(MANAGEMENT_EMAILS);

export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function isManagementEmail(email) {
  return MANAGEMENT_SET.has(normalizeEmail(email));
}

export function canAccessAdmin(email, userType) {
  return userType === "admin" || isManagementEmail(email);
}

export function showConnectToAdmin() {
  showConnectToAdminToast();
}

export function blockIfViewer(canWrite) {
  if (canWrite) return false;
  showConnectToAdmin();
  return true;
}

export function viewerInputProps(canWrite) {
  if (canWrite) return {};
  return {
    readOnly: true,
    "data-viewer-action": true,
    onFocus: () => showConnectToAdmin(),
    onKeyDown: (e) => {
      e.preventDefault();
      showConnectToAdmin();
    },
  };
}
