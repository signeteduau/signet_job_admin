import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export const MOBILE_APP_CONFIG_DOC = "app_config/mobile";

export const DEFAULT_MOBILE_APP_CONFIG = {
  forceUpdate: false,
  minVersion: "1.0.0",
  minBuild: 0,
  message:
    "A new version of Signet Employment Hub is available. Please update to continue.",
  iosStoreUrl: "https://signetemploymenthub.com",
  androidStoreUrl:
    "https://play.google.com/store/apps/details?id=com.peppyminds.jobportal",
};

export function normalizeMobileAppConfig(data = {}) {
  return {
    forceUpdate: data.forceUpdate === true,
    minVersion: String(data.minVersion ?? data.minimumVersion ?? "1.0.0").trim(),
    minBuild: toInt(data.minBuild ?? data.minimumBuild, 0),
    message: String(
      data.message ?? DEFAULT_MOBILE_APP_CONFIG.message
    ).trim(),
    iosStoreUrl: String(
      data.iosStoreUrl ?? data.appStoreUrl ?? DEFAULT_MOBILE_APP_CONFIG.iosStoreUrl
    ).trim(),
    androidStoreUrl: String(
      data.androidStoreUrl ??
        data.playStoreUrl ??
        DEFAULT_MOBILE_APP_CONFIG.androidStoreUrl
    ).trim(),
  };
}

export function validateMobileAppConfig(config) {
  if (!/^\d+(\.\d+){0,3}$/.test(config.minVersion)) {
    return { ok: false, error: "Minimum version must look like 1.2.0" };
  }
  if (config.minBuild < 0 || !Number.isInteger(config.minBuild)) {
    return { ok: false, error: "Minimum build must be a whole number" };
  }
  if (config.forceUpdate && !config.message.trim()) {
    return { ok: false, error: "Update message is required when force update is on" };
  }
  return { ok: true };
}

export async function fetchMobileAppConfig() {
  const snap = await getDoc(doc(db, ...MOBILE_APP_CONFIG_DOC.split("/")));
  if (!snap.exists()) return { ...DEFAULT_MOBILE_APP_CONFIG };
  return normalizeMobileAppConfig(snap.data());
}

export async function saveMobileAppConfig(config, updatedBy = "") {
  const normalized = normalizeMobileAppConfig(config);
  const validation = validateMobileAppConfig(normalized);
  if (!validation.ok) throw new Error(validation.error);

  await setDoc(
    doc(db, ...MOBILE_APP_CONFIG_DOC.split("/")),
    {
      forceUpdate: normalized.forceUpdate,
      minVersion: normalized.minVersion,
      minBuild: normalized.minBuild,
      message: normalized.message,
      iosStoreUrl: normalized.iosStoreUrl,
      androidStoreUrl: normalized.androidStoreUrl,
      updatedAt: serverTimestamp(),
      ...(updatedBy ? { updatedBy } : {}),
    },
    { merge: true }
  );

  return normalized;
}

function toInt(value, fallback) {
  if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value);
  const parsed = parseInt(String(value ?? ""), 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}
