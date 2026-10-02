import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

export function companyLabel(company) {
  return company?.companyName || company?.fullName || "Company";
}

export function companyLogo(company) {
  return company?.logoUrl || company?.profileImage || "";
}

export function connectionId(headId, subId) {
  return `${headId}_${subId}`;
}

export function mapConnection(id, data = {}) {
  const headId = String(data.headId || "");
  const subId = String(data.subId || data.requesterId || "");
  return {
    id,
    requesterId: String(data.requesterId || subId),
    requesterName: String(data.requesterName || data.subName || ""),
    requesterLogo: String(data.requesterLogo || data.subLogo || ""),
    headId: headId || String(data.requesterId || ""),
    headName: String(data.headName || ""),
    headLogo: String(data.headLogo || ""),
    subId,
    subName: String(data.subName || data.requesterName || ""),
    subLogo: String(data.subLogo || data.requesterLogo || ""),
    status: data.status || "pending",
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null,
  };
}

export async function fetchCompanies() {
  const snap = await getDocs(query(collection(db, "users"), where("userType", "==", "company")));
  return snap.docs
    .map((item) => {
      const data = item.data();
      return {
        id: item.id,
        companyName: data.companyName || "",
        fullName: data.fullName || "",
        email: data.email || "",
        industry: data.industry || "",
        companyLocation: data.companyLocation || data.address || "",
        logoUrl: data.logoUrl || data.profileImage || "",
        profileImage: data.profileImage || "",
      };
    })
    .sort((a, b) => companyLabel(a).localeCompare(companyLabel(b)));
}

export async function fetchCompanyConnections() {
  const snap = await getDocs(collection(db, "companyConnections"));
  return snap.docs
    .map((item) => mapConnection(item.id, item.data()))
    .sort((a, b) => {
      const as = a.updatedAt?.seconds || a.createdAt?.seconds || 0;
      const bs = b.updatedAt?.seconds || b.createdAt?.seconds || 0;
      return bs - as;
    });
}

export function acceptedConnections(items = []) {
  return items.filter((item) => item.status === "accepted");
}

export function pendingConnections(items = []) {
  return items.filter((item) => item.status === "pending");
}

export function roleForCompany(items, companyId) {
  const accepted = acceptedConnections(items);
  const asHead = accepted.filter((item) => item.headId === companyId);
  const asSub = accepted.find((item) => item.subId === companyId);
  if (asHead.length && asSub) {
    return { role: "both", head: asSub, children: asHead };
  }
  if (asHead.length) return { role: "head", head: null, children: asHead };
  if (asSub) return { role: "sub", head: asSub, children: [] };
  return { role: "independent", head: null, children: [] };
}

export function roleHint(items, companyId) {
  const network = roleForCompany(items, companyId);
  if (network.role === "sub") return `Already a sub of ${network.head.headName}`;
  if (network.role === "both") {
    return `Head of ${network.children.length} · sub of ${network.head.headName}`;
  }
  if (network.role === "head") {
    return `Head · ${network.children.length} sub${network.children.length === 1 ? "" : "s"}`;
  }
  return "";
}

export function groupConnectionsByHead(items = []) {
  const groups = new Map();
  acceptedConnections(items).forEach((item) => {
    if (!groups.has(item.headId)) {
      groups.set(item.headId, {
        headId: item.headId,
        headName: item.headName,
        headLogo: item.headLogo,
        children: [],
      });
    }
    groups.get(item.headId).children.push(item);
  });
  return Array.from(groups.values()).sort((a, b) =>
    (a.headName || "").localeCompare(b.headName || "")
  );
}

export async function assignHeadSub(head, sub) {
  if (!head?.id || !sub?.id) throw new Error("Choose both a head and a sub company.");
  if (head.id === sub.id) throw new Error("A company cannot be its own head.");

  const existing = await fetchCompanyConnections();
  const currentParent = existing.find(
    (item) => item.subId === sub.id && item.status === "accepted"
  );
  if (currentParent && currentParent.headId !== head.id) {
    throw new Error(
      `${companyLabel(sub)} is already a sub of ${currentParent.headName}. Remove that link first.`
    );
  }
  const already = existing.find(
    (item) => item.headId === head.id && item.subId === sub.id && item.status === "accepted"
  );
  if (already) throw new Error("These companies are already linked.");

  const headName = companyLabel(head);
  const subName = companyLabel(sub);
  const headLogo = companyLogo(head);
  const subLogo = companyLogo(sub);

  await setDoc(doc(db, "companyConnections", connectionId(head.id, sub.id)), {
    requesterId: sub.id,
    requesterName: subName,
    requesterLogo: subLogo,
    headId: head.id,
    headName,
    headLogo,
    subId: sub.id,
    subName,
    subLogo,
    status: "accepted",
    createdBy: "admin",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function acceptCompanyConnection(id) {
  await updateDoc(doc(db, "companyConnections", id), {
    status: "accepted",
    updatedAt: serverTimestamp(),
  });
}

export async function removeCompanyConnection(id) {
  await deleteDoc(doc(db, "companyConnections", id));
}
