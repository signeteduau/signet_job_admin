import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  BookOpen,
  Copy,
  ExternalLink,
  Link2,
  Pencil,
  Star,
} from "lucide-react";
import { db } from "../firebase";
import JobContent from "../components/jobs/JobContent";
import {
  PUBLIC_ARTICLES_BASE,
  articleCategoryLabel,
  articleDisplayDate,
  articleImage,
  estimateReadMinutes,
  relatedArticles,
} from "../lib/articles";

function authorInitial(name) {
  const value = String(name || "S").trim();
  return value ? value.slice(0, 1).toUpperCase() : "S";
}

function ArticleSkeleton() {
  return (
    <div className="signet-article-page animate-pulse">
      <div className="signet-chart-skeleton h-10 w-48" />
      <div className="signet-article-layout">
        <div className="signet-article-card">
          <div className="signet-chart-skeleton signet-article-cover-skel" />
          <div className="signet-article-panel space-y-4">
            <div className="signet-chart-skeleton h-6 w-40" />
            <div className="signet-chart-skeleton h-12 w-4/5" />
            <div className="signet-chart-skeleton h-20" />
            <div className="signet-chart-skeleton h-64" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="signet-chart-skeleton h-64" />
          <div className="signet-chart-skeleton h-48" />
        </div>
      </div>
    </div>
  );
}

export default function ArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [others, setOthers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, "articles", id));
        if (!alive) return;
        setArticle(snap.exists() ? { id: snap.id, ...snap.data() } : null);

        try {
          const list = query(collection(db, "articles"), orderBy("createdAt", "desc"));
          const all = await getDocs(list);
          if (alive) setOthers(all.docs.map((d) => ({ id: d.id, ...d.data() })));
        } catch {
          const all = await getDocs(collection(db, "articles"));
          if (alive) setOthers(all.docs.map((d) => ({ id: d.id, ...d.data() })));
        }
      } catch (err) {
        console.error("Error loading article:", err);
        if (alive) setArticle(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  const cover = articleImage(article);
  const tags = article?.tags || [];
  const category = articleCategoryLabel(article);
  const dateLabel = articleDisplayDate(article);
  const readMin = useMemo(() => estimateReadMinutes(article?.content), [article?.content]);
  const related = useMemo(() => relatedArticles(article, others), [article, others]);
  const publicUrl = `${PUBLIC_ARTICLES_BASE}/${id}`;
  const author = article?.author || "Signet Editorial";

  const copyPublicLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast.success("Public link copied");
    } catch {
      toast.error("Could not copy link");
    }
  };

  if (loading) return <ArticleSkeleton />;

  if (!article) {
    return (
      <div className="signet-article-page">
        <div className="signet-panel signet-article-empty">
          <span className="signet-empty-icon">
            <BookOpen size={22} />
          </span>
          <p className="signet-empty-title">Article not found</p>
          <p className="signet-empty-desc mt-2">It may have been removed or the link is incorrect.</p>
          <button type="button" className="signet-btn mt-4" onClick={() => navigate("/admin/all-blogs")}>
            Back to articles
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="signet-article-page animate-fade">
      <div className="signet-cd-toolbar">
        <button type="button" onClick={() => navigate("/admin/all-blogs")} className="signet-back-link">
          <ArrowLeft size={16} /> All articles
        </button>
        <div className="signet-cd-toolbar-actions">
          <button type="button" className="signet-btn-secondary" onClick={copyPublicLink}>
            <Copy size={15} /> Copy link
          </button>
          <button
            type="button"
            className="signet-btn-secondary"
            onClick={() => navigate(`/admin/all-blogs/edit/${id}`)}
          >
            <Pencil size={15} /> Edit
          </button>
          <a href={publicUrl} target="_blank" rel="noreferrer" className="signet-btn">
            <ExternalLink size={15} /> View on website
          </a>
        </div>
      </div>

      <div className="signet-article-layout">
        <article className="signet-panel signet-article-card">
          <div className={`signet-article-cover${cover ? "" : " is-empty"}`}>
            {cover ? (
              <img src={cover} alt={article.title || "Article cover"} />
            ) : (
              <div className="signet-article-cover-fallback" aria-hidden>
                <BookOpen size={42} />
              </div>
            )}
            {article.featured && (
              <span className="signet-article-cover-flag">
                <Star size={12} /> Featured
              </span>
            )}
          </div>

          <div className="signet-article-panel">
            <header className="signet-article-header">
              <div className="signet-article-labels">
                {category !== "—" && (
                  <span className="signet-article-label is-category">{category}</span>
                )}
                {tags.map((tag) => (
                  <span key={tag} className="signet-article-label">{tag}</span>
                ))}
              </div>

              <h1>{article.title || "Untitled article"}</h1>
              {article.subtitle ? <p className="signet-article-lead">{article.subtitle}</p> : null}

              <div className="signet-article-author">
                <span className="signet-article-author-avatar" aria-hidden>
                  {authorInitial(author)}
                </span>
                <div>
                  <strong>{author}</strong>
                  <span>
                    {dateLabel}
                    {dateLabel !== "—" ? " · " : ""}
                    {readMin} min read
                  </span>
                </div>
              </div>
            </header>

            <JobContent text={article.content} className="signet-article-body" />
          </div>
        </article>

        <aside className="signet-article-aside">
          <div className="signet-article-aside-card">
            <dl className="signet-article-facts">
              <div>
                <dt>Status</dt>
                <dd>
                  {article.featured ? (
                    <span className="signet-badge signet-badge--warning">Featured</span>
                  ) : (
                    <span className="signet-badge signet-badge--success">Published</span>
                  )}
                </dd>
              </div>
              <div>
                <dt>Category</dt>
                <dd>{category}</dd>
              </div>
              <div>
                <dt>Author</dt>
                <dd>{author}</dd>
              </div>
              <div>
                <dt>Published</dt>
                <dd>{dateLabel}</dd>
              </div>
              {article.slug ? (
                <div>
                  <dt>Slug</dt>
                  <dd className="signet-article-slug">/{article.slug}</dd>
                </div>
              ) : null}
            </dl>
            <button type="button" className="signet-article-aside-link" onClick={copyPublicLink}>
              <Link2 size={15} /> Copy public URL
            </button>
          </div>

          {related.length > 0 && (
            <div className="signet-article-aside-card">
              <p className="signet-eyebrow">More in this library</p>
              <h3>Related articles</h3>
              <div className="signet-article-related-list">
                {related.map((item) => {
                  const thumb = articleImage(item);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className="signet-article-related"
                      onClick={() => navigate(`/admin/all-blogs/${item.id}`)}
                    >
                      {thumb ? (
                        <img src={thumb} alt="" />
                      ) : (
                        <span className="signet-article-related-fallback" aria-hidden>
                          <BookOpen size={16} />
                        </span>
                      )}
                      <span>
                        <strong>{item.title || "Untitled article"}</strong>
                        <em>{articleCategoryLabel(item)}</em>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
