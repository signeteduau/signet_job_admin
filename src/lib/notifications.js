import { arrayUnion, doc, updateDoc, writeBatch, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export async function markNotificationRead(id, uid) {
  const ref = doc(db, "notifications", id);
  await updateDoc(ref, { readBy: arrayUnion(uid) });
}

export async function markAllNotificationsRead({ role, uid }) {
  // Fetch visible notifications then batch mark
  const col = collection(db, "notifications");
  const snap = await getDocs(col);
  const batch = writeBatch(db);
  snap.forEach((d) => {
    const n = d.data();
    if (role === "admin" || n.for === "all" || n.for === role) {
      batch.update(doc(db, "notifications", d.id), { readBy: arrayUnion(uid) });
    }
  });
  await batch.commit();
}
