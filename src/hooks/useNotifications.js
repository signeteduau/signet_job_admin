import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";

export default function useNotifications(role, uid) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q;

    // ✅ Admin sees all notifications
    if (role === "admin") {
      q = query(
        collection(db, "notifications"),
        orderBy("createdAt", "desc")
      );
    } else {
      // ✅ Normal users only see their relevant notifications
      q = query(
        collection(db, "notifications"),
        where("for", "in", ["all", role]),
        orderBy("createdAt", "desc")
      );
    }

    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => unsub();
  }, [role, uid]);

  const unreadCount = items.filter(
    (n) => !n.readBy || !n.readBy.includes(uid)
  ).length;

  return { items, unreadCount, loading };
}
