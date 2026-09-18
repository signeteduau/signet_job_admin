import { toDate } from "./firestore";

export const PUBLIC_ARTICLES_BASE = "https://signetemploymenthub.com/career-tips";

/** Build denormalized category fields saved on `articles` documents. */
export function articleCategoryPayload(categoryId, categories) {
  if (!categoryId) {
    return { categoryId: "", categoryName: "" };
  }
  const match = categories.find((c) => c.id === categoryId);
  return {
    categoryId,
    categoryName: match?.name || "",
  };
}

export function articleCategoryLabel(article) {
  return article?.categoryName || "—";
}

export function articleImage(article) {
  return article?.image || article?.featuredImage || "";
}

export function estimateReadMinutes(content) {
  const plain = String(content || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = plain ? plain.split(" ").length : 0;
  return Math.max(1, Math.round(words / 200) || 1);
}

export function articleDisplayDate(article) {
  if (article?.publishedDate) {
    const parsed = new Date(article.publishedDate);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  }
  const created = toDate(article?.createdAt);
  return created
    ? created.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";
}

export function relatedArticles(current, all, limit = 3) {
  if (!current) return [];
  const tags = new Set((current.tags || []).map((tag) => String(tag).toLowerCase()));
  const category = (current.categoryName || "").toLowerCase();
  const scored = all
    .filter((item) => item.id !== current.id)
    .map((item) => {
      const tagScore = (item.tags || []).filter((tag) =>
        tags.has(String(tag).toLowerCase())
      ).length;
      const categoryScore =
        category && (item.categoryName || "").toLowerCase() === category ? 1 : 0;
      return { item, score: tagScore + categoryScore };
    })
    .sort((a, b) => b.score - a.score);
  const picks = scored.filter((entry) => entry.score > 0).slice(0, limit).map((entry) => entry.item);
  if (picks.length >= limit) return picks;
  const extras = scored
    .filter((entry) => entry.score === 0)
    .slice(0, limit - picks.length)
    .map((entry) => entry.item);
  return [...picks, ...extras];
}
