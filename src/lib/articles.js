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
