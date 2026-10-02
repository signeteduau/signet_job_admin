import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

const ADMIN_COOLDOWN_MS = 60 * 60 * 1000;

export function reminderDate(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value.toDate === "function") {
    const date = value.toDate();
    return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null;
  }
  return null;
}

export function canSendProfileReminder(user) {
  if (!user?.id || user.profileCompleted) return false;
  if (!String(user.email || "").trim()) return false;
  const last = reminderDate(user.lastProfileReminderAt);
  if (last && Date.now() - last.getTime() < ADMIN_COOLDOWN_MS) return false;
  return true;
}

export function reminderStatusLabel(user) {
  const last = reminderDate(user.lastProfileReminderAt);
  if (!last) return "";
  return `Reminded ${last.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  })}`;
}

export async function requestProfileReminder(user) {
  if (!user?.id) throw new Error("Missing user");
  if (user.profileCompleted) throw new Error("This profile is already complete.");
  const email = String(user.email || "").trim();
  if (!email) throw new Error("This account has no email address.");
  if (!canSendProfileReminder(user)) {
    throw new Error("A reminder was already sent recently. Try again in an hour.");
  }

  await addDoc(collection(db, "profileReminders"), {
    userId: user.id,
    email,
    name: user.fullName || user.companyName || "",
    userType: user.userType || "candidate",
    source: "admin",
    requestedBy: auth.currentUser?.uid || "",
    requestedAt: serverTimestamp(),
    status: "pending",
  });
}

export async function requestProfileReminders(users) {
  const sentIds = [];
  let skipped = 0;
  let failed = 0;

  for (const user of users) {
    if (!canSendProfileReminder(user)) {
      skipped += 1;
      continue;
    }
    try {
      await requestProfileReminder(user);
      sentIds.push(user.id);
    } catch {
      failed += 1;
    }
  }

  return { sent: sentIds.length, skipped, failed, sentIds };
}
