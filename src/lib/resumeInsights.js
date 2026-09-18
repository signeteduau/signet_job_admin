import { getBytes, ref as storageRef } from "firebase/storage";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db, storage } from "../firebase";

let pdfjsLibPromise;

async function getPdfjs() {
  if (!pdfjsLibPromise) {
    pdfjsLibPromise = import("pdfjs-dist/build/pdf.mjs").then((pdfjsLib) => {
      if (!pdfjsLib.GlobalWorkerOptions.workerPort) {
        pdfjsLib.GlobalWorkerOptions.workerPort = new Worker(
          new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url),
          { type: "module" }
        );
      }
      return pdfjsLib;
    });
  }
  return pdfjsLibPromise;
}

const SKILL_TERMS = [
  "javascript", "typescript", "react", "react native", "flutter", "dart",
  "firebase", "node", "python", "java", "sql", "html", "css", "figma",
  "excel", "word", "powerpoint", "salesforce", "aws", "azure", "gcp",
  "aged care", "disability support", "nursing", "hospitality", "retail",
  "customer service", "warehouse", "forklift", "white card", "first aid",
  "cpr", "rsa", "manual handling", "communication", "leadership",
  "project management", "accounting", "bookkeeping", "payroll",
  "data entry", "administration", "marketing", "sales", "recruitment",
  "android", "ios", "git", "rest api", "ui/ux", "graphic design",
];

const PARSER_VERSION = 3;

const CERT_HINTS =
  /\b(certif|licensed?|licence|diploma|accredited|ielts|cpr|first aid|white card|rsa|pmp|aws|microsoft certified|google certified|comptia|certificate iii|certificate iv|cert iii|cert iv)\b/i;

const MONTH =
  "(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)";

const EXPERIENCE_HEADERS = new Set([
  "experience",
  "experiences",
  "workexperience",
  "workingexperience",
  "workhistory",
  "employment",
  "employmenthistory",
  "professionalexperience",
  "professionalhistory",
  "careerhistory",
  "careerexperience",
  "relevantexperience",
  "relevantexperience",
  "professionalbackground",
  "employmentexperience",
  "industryexperience",
  "industrialexperience",
  "occupationalhistory",
  "jobexperience",
  "positionsheld",
  "previousemployment",
  "currentemployment",
  "workexperiencehighlights",
]);

const SKILL_HEADERS = new Set([
  "skills",
  "skill",
  "technicalskills",
  "keyskills",
  "coreskills",
  "corecompetencies",
  "competencies",
  "areasofexpertise",
  "expertise",
]);

const CERT_HEADERS = new Set([
  "certifications",
  "certification",
  "certificates",
  "certificate",
  "licenses",
  "licences",
  "license",
  "licence",
  "accreditations",
  "accreditation",
]);

const EDUCATION_HEADERS = new Set([
  "education",
  "educationandtraining",
  "educationalbackground",
  "educationalqualifications",
  "academicbackground",
  "academics",
  "academicqualifications",
  "qualifications",
  "academic",
  "schooling",
  "tertiaryeducation",
  "highereducation",
]);

const STOP_HEADERS = new Set([
  "projects",
  "personalprojects",
  "awards",
  "achievements",
  "references",
  "interests",
  "hobbies",
  "languages",
  "declaration",
  "personaldetails",
  "contact",
  "objective",
  "careerobjective",
  "summary",
  "profilesummary",
  "aboutme",
]);

function cleanLine(line) {
  return String(line || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^[-•●▪◦·]+\s*/, "")
    .trim();
}

function headerKey(line) {
  return cleanLine(line)
    .replace(/[:|]+$/, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

function isHeader(line) {
  const key = headerKey(line);
  if (!key || key.length > 40) return null;
  if (SKILL_HEADERS.has(key)) return "skills";
  if (EXPERIENCE_HEADERS.has(key)) return "experience";
  if (EDUCATION_HEADERS.has(key)) return "education";
  if (CERT_HEADERS.has(key)) return "certifications";
  if (STOP_HEADERS.has(key)) return "stop";
  if (
    key.length <= 36 &&
    /(education|academic|qualification|schooling)/.test(key)
  ) {
    return "education";
  }
  if (
    key.length <= 32 &&
    /(experience|employment)/.test(key) &&
    !/(yearsof|yearsin|totalyears)/.test(key)
  ) {
    return "experience";
  }
  return null;
}

function sectionLines(lines, type, limit = 16) {
  const start = lines.findIndex((line) => isHeader(line) === type);
  if (start < 0) return [];
  const collected = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    if (isHeader(lines[i])) break;
    const line = cleanLine(lines[i]);
    if (line) collected.push(line);
    if (collected.length >= limit) break;
  }
  return collected;
}

function unique(items, limit) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    const key = item.toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
    if (out.length >= limit) break;
  }
  return out;
}

function parseSkills(lines, fullText) {
  const fromSection = sectionLines(lines, "skills")
    .flatMap((line) => line.split(/[,|/•●;]|(?:\s{2,})/))
    .map(cleanLine)
    .filter((item) => item.length >= 2 && item.length <= 40 && !/\d{4}/.test(item));

  const fromKeywords = SKILL_TERMS.filter((term) =>
    new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(fullText)
  ).map((term) => term.replace(/\b\w/g, (c) => c.toUpperCase()));

  return unique([...fromSection, ...fromKeywords], 16);
}

function hasDateHint(line) {
  const value = String(line || "");
  if (/\b(?:19|20)\d{2}\b/.test(value)) return true;
  if (/\b(?:present|current|ongoing|till date|to date)\b/i.test(value)) return true;
  if (new RegExp(`\\b${MONTH}[\\s.'’\\-]*['’]?\\d{2,4}\\b`, "i").test(value)) return true;
  if (/\b\d{1,2}[/-]\d{4}\b/.test(value)) return true;
  return false;
}

function isMostlyDate(line) {
  const value = cleanLine(line);
  if (!hasDateHint(value) || value.length > 48) return false;
  const withoutDates = value
    .replace(new RegExp(MONTH, "ig"), " ")
    .replace(/\b(?:19|20)\d{2}\b/g, " ")
    .replace(/\b(?:present|current|ongoing|till date|to date)\b/ig, " ")
    .replace(/[\d/'’\-–—to.,\s]+/g, "");
  return withoutDates.length < 6;
}

function looksLikeDuty(line) {
  const value = cleanLine(line);
  if (value.length > 120) return true;
  return /^(responsible|managed|developed|assisted|helped|provided|ensured|collaborated|achieved|created|implemented|supported|maintained|handled|performed|worked with|duties|key responsibilities)\b/i.test(
    value
  );
}

function looksLikeTitle(line) {
  const value = cleanLine(line);
  if (!value || value.length < 3 || value.length > 90) return false;
  if (isHeader(value)) return false;
  if (looksLikeDuty(value)) return false;
  if (isMostlyDate(value)) return false;
  return true;
}

function formatJob(parts) {
  return unique(
    parts.map(cleanLine).filter(Boolean),
    4
  ).join(" · ");
}

function extractJobs(lines) {
  const jobs = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!hasDateHint(line)) continue;

    const titles = [];
    for (const offset of [-2, -1, 0, 1]) {
      const nearby = lines[i + offset];
      if (nearby && looksLikeTitle(nearby)) titles.push(nearby);
    }

    const summary = formatJob(
      isMostlyDate(line) ? [...titles.slice(0, 2), line] : [line, ...titles.filter((item) => item !== line).slice(0, 1)]
    );
    if (summary.length >= 8) jobs.push(summary);
  }
  return unique(jobs, 8);
}

function parseExperience(lines, fullText) {
  const fromSection = sectionLines(lines, "experience", 48);
  const pool = fromSection.length ? fromSection : lines;
  const fromDates = extractJobs(pool);

  const yearsMatch = String(fullText || "").match(
    /(\d{1,2}\+?)\s+years?\s+(?:of\s+)?(?:work\s+)?experience/i
  );
  const yearsLine = yearsMatch ? `${yearsMatch[1]} years of experience` : "";

  if (fromDates.length) {
    return unique([...fromDates, yearsLine].filter(Boolean), 8);
  }

  if (fromSection.length) {
    const fromTitles = fromSection.filter((line) => looksLikeTitle(line) && !looksLikeDuty(line));
    return unique([...fromTitles, yearsLine].filter(Boolean), 8);
  }

  return unique([yearsLine].filter(Boolean), 8);
}

const EDU_HINTS =
  /\b(bachelor|b\.?\s?sc|b\.?\s?a\.?|master|m\.?\s?sc|mba|phd|doctorate|diploma|associate degree|high school|secondary school|university|college|tafe|hsc|ssc|year 12|year 10|graduate diploma|advanced diploma|honours|btech|mtech)\b/i;

function parseEducation(lines) {
  const fromSection = sectionLines(lines, "education", 36);
  if (fromSection.length) {
    const fromDates = extractJobs(fromSection);
    if (fromDates.length) return fromDates;
    return unique(
      fromSection.filter((line) => looksLikeTitle(line) && !looksLikeDuty(line) && line.length >= 6),
      6
    );
  }

  const hinted = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!EDU_HINTS.test(line) || isHeader(line) || looksLikeDuty(line)) continue;
    const nearby = [lines[i - 1], line, lines[i + 1]].filter(Boolean);
    const summary = formatJob(
      nearby.filter((item) => looksLikeTitle(item) || hasDateHint(item) || EDU_HINTS.test(item)).slice(0, 3)
    );
    if (summary.length >= 8) hinted.push(summary);
  }
  return unique(hinted, 6);
}

function parseCertifications(lines, fullText) {
  const fromSection = sectionLines(lines, "certifications");
  const fromHints = lines.filter((line) => CERT_HINTS.test(line) && line.length < 120 && !isHeader(line));
  const extra = [];
  if (/\bwhite card\b/i.test(fullText)) extra.push("White Card");
  if (/\bfirst aid\b/i.test(fullText)) extra.push("First Aid");
  if (/\bcpr\b/i.test(fullText)) extra.push("CPR");
  if (/\bielts\b/i.test(fullText)) extra.push("IELTS");
  return unique([...fromSection, ...fromHints, ...extra], 8);
}

export function parseResumeText(text) {
  const lines = String(text || "")
    .replace(/\r/g, "\n")
    .replace(/\u00a0/g, " ")
    .split(/\n+/)
    .flatMap((line) => line.split(/\s{3,}/))
    .map(cleanLine)
    .filter(Boolean);

  return {
    skills: parseSkills(lines, text),
    experience: parseExperience(lines, text),
    education: parseEducation(lines),
    certifications: parseCertifications(lines, text),
  };
}

function lineHeight(item) {
  return Math.abs(item.height || item.transform?.[3] || 0);
}

function joinLineItems(items) {
  let out = "";
  let lastRight = null;
  for (const item of items) {
    const str = String(item.str || "");
    if (!str) continue;
    const x = item.transform?.[4] ?? 0;
    if (
      lastRight !== null &&
      x - lastRight > 1.2 &&
      !out.endsWith(" ") &&
      !str.startsWith(" ")
    ) {
      out += " ";
    }
    out += str;
    lastRight = x + (item.width || 0);
  }
  return out;
}

function itemsToLines(items) {
  const usable = (items || []).filter((item) => String(item.str || "").trim());
  if (!usable.length) return [];

  const eolCount = usable.filter((item) => item.hasEOL).length;
  if (eolCount >= Math.max(3, usable.length * 0.12)) {
    const lines = [];
    let current = [];
    for (const item of usable) {
      current.push(item);
      if (item.hasEOL) {
        lines.push(joinLineItems(current));
        current = [];
      }
    }
    if (current.length) lines.push(joinLineItems(current));
    return lines.map(cleanLine).filter(Boolean);
  }

  const heights = usable.map(lineHeight).filter((height) => height > 0).sort((a, b) => a - b);
  const medianH = heights[Math.floor(heights.length / 2)] || 10;
  const yGap = Math.max(2.5, medianH * 0.4);

  const sorted = [...usable].sort((a, b) => {
    const ay = a.transform?.[5] ?? 0;
    const by = b.transform?.[5] ?? 0;
    if (Math.abs(by - ay) > yGap) return by - ay;
    return (a.transform?.[4] ?? 0) - (b.transform?.[4] ?? 0);
  });

  const lines = [];
  let currentY = null;
  let current = [];

  for (const item of sorted) {
    const y = item.transform?.[5] ?? 0;
    if (currentY !== null && Math.abs(currentY - y) > yGap) {
      lines.push(joinLineItems(current));
      current = [];
    }
    currentY = y;
    current.push(item);
  }
  if (current.length) lines.push(joinLineItems(current));
  return lines.map(cleanLine).filter(Boolean);
}

function storagePathFromUrl(resumeUrl) {
  const value = String(resumeUrl || "").trim();
  if (!value) return null;
  if (value.startsWith("resumes/")) return value.split("?")[0];
  if (value.startsWith("gs://")) {
    const withoutScheme = value.replace(/^gs:\/\//, "");
    const slash = withoutScheme.indexOf("/");
    return slash >= 0 ? decodeURIComponent(withoutScheme.slice(slash + 1)) : null;
  }
  try {
    const url = new URL(value);
    const encoded = url.pathname.match(/\/o\/(.+)$/);
    if (encoded) return decodeURIComponent(encoded[1]);
    const path = decodeURIComponent(url.pathname.replace(/^\/+/, ""));
    if (path.startsWith("resumes/")) return path;
  } catch {
    const idx = value.indexOf("resumes/");
    if (idx >= 0) return value.slice(idx).split("?")[0];
  }
  return null;
}

function looksLikePdf(bytes) {
  if (!bytes || bytes.length < 5) return false;
  return (
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46
  );
}

async function fetchViaUrl(url) {
  const response = await fetch(url, { mode: "cors", credentials: "omit" });
  if (!response.ok) {
    throw new Error(`Resume download failed (${response.status})`);
  }
  return new Uint8Array(await response.arrayBuffer());
}

function proxiedStorageUrl(resumeUrl) {
  try {
    const url = new URL(resumeUrl);
    if (url.hostname === "firebasestorage.googleapis.com") {
      return `/__firebase-storage${url.pathname}${url.search}`;
    }
  } catch {
    return null;
  }
  return null;
}

async function fetchResumeBytes(resumeUrl) {
  const path = storagePathFromUrl(resumeUrl);
  if (path) {
    try {
      return new Uint8Array(await getBytes(storageRef(storage, path)));
    } catch (err) {
      console.warn("Resume storage download failed, trying URL:", err);
    }
  }

  try {
    return await fetchViaUrl(resumeUrl);
  } catch (err) {
    const proxied = import.meta.env.DEV ? proxiedStorageUrl(resumeUrl) : null;
    if (proxied) return fetchViaUrl(proxied);
    throw err;
  }
}

export async function extractResumeText(resumeUrl) {
  const bytes = await fetchResumeBytes(resumeUrl);
  if (!looksLikePdf(bytes)) {
    return "";
  }

  const pdfjsLib = await getPdfjs();
  const pdf = await pdfjsLib.getDocument({
    data: bytes,
    disableStream: true,
    disableAutoFetch: true,
    disableRange: true,
    isEvalSupported: false,
  }).promise;

  const pages = [];
  const maxPages = Math.min(pdf.numPages, 6);
  for (let pageNo = 1; pageNo <= maxPages; pageNo += 1) {
    const page = await pdf.getPage(pageNo);
    const content = await page.getTextContent();
    pages.push(itemsToLines(content.items).join("\n"));
  }
  return pages.join("\n");
}

export function hasResumeHighlights(insights) {
  return Boolean(
    insights?.skills?.length ||
      insights?.experience?.length ||
      insights?.education?.length ||
      insights?.certifications?.length
  );
}

export async function loadCachedResumeInsights(userId, resumeUrl) {
  try {
    const snap = await getDoc(doc(db, "resume_insights", userId));
    if (!snap.exists()) return null;
    const data = snap.data();
    if (data.resumeUrl !== resumeUrl) return null;
    if (data.parserVersion !== PARSER_VERSION) return null;
    return data;
  } catch {
    return null;
  }
}

export async function saveResumeInsights(userId, resumeUrl, insights) {
  try {
    await setDoc(
      doc(db, "resume_insights", userId),
      {
        resumeUrl,
        skills: insights.skills,
        experience: insights.experience,
        education: insights.education || [],
        certifications: insights.certifications,
        parserVersion: PARSER_VERSION,
        extractedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn("Could not cache resume insights:", err);
  }
}

export async function getResumeInsights(userId, resumeUrl) {
  if (!resumeUrl) return { insights: null, error: null };

  const cached = userId ? await loadCachedResumeInsights(userId, resumeUrl) : null;
  if (cached && hasResumeHighlights(cached)) {
    return { insights: cached, error: null };
  }

  try {
    const text = await extractResumeText(resumeUrl);
    const insights = parseResumeText(text);
    if (userId && hasResumeHighlights(insights)) {
      await saveResumeInsights(userId, resumeUrl, insights);
    }
    return { insights, error: hasResumeHighlights(insights) ? null : "empty" };
  } catch (err) {
    console.warn("Resume parse failed:", err);
    return { insights: null, error: "failed" };
  }
}
