import { FirebaseError } from "firebase/app";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebase";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function getStorageErrorMessage(err) {
  const code = err instanceof FirebaseError ? err.code : "";
  switch (code) {
    case "storage/unauthorized":
      return "Upload not allowed. Check Firebase Storage rules for article_images/.";
    case "storage/canceled":
      return "Upload was cancelled.";
    case "storage/quota-exceeded":
      return "Storage quota exceeded.";
    case "storage/unauthenticated":
      return "You must be signed in to upload files.";
    default:
      return code ? `Upload failed (${code}).` : "Upload failed.";
  }
}

function safeFileName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function extFromFile(file) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName)) return fromName;
  if (file.type.includes("png")) return "png";
  if (file.type.includes("webp")) return "webp";
  if (file.type.includes("gif")) return "gif";
  if (file.type.includes("jpeg") || file.type.includes("jpg")) return "jpg";
  return "jpg";
}

export function validateImageFile(file) {
  if (!file) return "No file selected.";
  if (!file.type.startsWith("image/")) return "Please choose an image file (JPG, PNG, WebP, or GIF).";
  if (file.size > MAX_IMAGE_BYTES) return "Image must be 5 MB or smaller.";
  return null;
}

/** Upload featured or inline article image; returns public download URL. */
export async function uploadArticleImage(file, prefix = "featured") {
  const validationError = validateImageFile(file);
  if (validationError) throw new Error(validationError);

  const ext = extFromFile(file);
  const path = `article_images/${prefix}_${Date.now()}_${safeFileName(file.name.replace(/\.[^.]+$/, ""))}.${ext}`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, file, {
    contentType: file.type || "image/jpeg",
  });

  return getDownloadURL(storageRef);
}
