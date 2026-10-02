export function skillLabel(skill) {
  if (!skill) return "";
  if (typeof skill === "string") return skill.trim();
  return String(skill.name || skill.title || skill.label || "").trim();
}

export function normalizeSearchText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9+#]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const STOP_WORDS = new Set([
  "and",
  "the",
  "of",
  "for",
  "with",
  "to",
  "in",
  "on",
  "or",
  "at",
  "by",
  "from",
  "that",
  "this",
  "job",
  "jobs",
  "work",
  "signet",
  "all",
]);

export function parseKeywords(value) {
  return normalizeSearchText(value)
    .split(" ")
    .map((part) => part.trim())
    .filter((part) => part.length >= 2 && !STOP_WORDS.has(part));
}

function stem(token) {
  return token
    .replace(/(tion|tions|ness|ment|ments)$/g, "")
    .replace(/(ing|ers|ies|ied|er|ed|ly|s)$/g, "")
    .replace(/(e)$/g, "");
}

function tokenVariants(token) {
  const forms = new Set([token, stem(token)]);
  if (token.length >= 5) forms.add(token.slice(0, -1));
  if (token.length >= 6) forms.add(token.slice(0, 5));
  return [...forms].filter((item) => item.length >= 2);
}

export function collectCandidateText(user = {}) {
  const skills = Array.isArray(user.skills) ? user.skills.map(skillLabel).filter(Boolean) : [];
  const extra = Array.isArray(user.keywords) ? user.keywords.map(skillLabel).filter(Boolean) : [];
  return {
    skills,
    text: [
      user.fullName,
      user.email,
      user.occupation,
      user.jobTitle,
      user.title,
      user.headline,
      user.preferredJob,
      user.address,
      user.city,
      user.country,
      user.state,
      user.aboutMe,
      user.about,
      user.experience,
      user.experienceYears,
      user.education,
      user.certifications,
      user.resumeFileName,
      user.resumeFile,
      ...skills,
      ...extra,
    ]
      .filter(Boolean)
      .join(" "),
  };
}

export function buildCandidateIndex(text) {
  const normalized = normalizeSearchText(text);
  const tokens = parseKeywords(normalized);
  const stems = new Set(tokens.flatMap(tokenVariants));
  return { normalized, tokens, stems };
}

export function matchesKeywords(index, queries = []) {
  const terms = queries
    .flatMap((query) => parseKeywords(query))
    .filter((term, i, list) => list.indexOf(term) === i);
  if (!terms.length) return true;
  if (!index?.normalized) return false;

  return terms.every((term) => {
    if (index.normalized.includes(term)) return true;
    const variants = tokenVariants(term);
    if (variants.some((variant) => index.stems.has(variant))) return true;
    return index.tokens.some((token) =>
      variants.some(
        (variant) =>
          variant.length >= 3 && (token.includes(variant) || variant.includes(token))
      )
    );
  });
}

export function rankCandidate(item, terms) {
  if (!terms.length) return 0;
  const occupation = normalizeSearchText(item.occupation);
  const skills = (item.skills || []).map((skill) => normalizeSearchText(skill));
  let score = 0;
  terms.forEach((term) => {
    if (occupation === term || occupation.includes(term)) score += 8;
    if (skills.some((skill) => skill === term || skill.includes(term))) score += 6;
    if (item.searchIndex.normalized.includes(term)) score += 2;
  });
  return score;
}

export function popularKeywords(candidates, limit = 10) {
  const counts = new Map();
  candidates.forEach((item) => {
    (item.skills || []).forEach((skill) => {
      parseKeywords(skill).forEach((token) => {
        if (token.length < 3) return;
        counts.set(token, (counts.get(token) || 0) + 1);
      });
    });
    parseKeywords(item.occupation).forEach((token) => {
      if (token.length < 4) return;
      counts.set(token, (counts.get(token) || 0) + 1);
    });
  });
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([value]) => value);
}
