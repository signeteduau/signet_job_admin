import { useEffect, useState, useMemo } from "react";
import { db } from "../../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  User,
  Briefcase,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";

import { SITE_FAQ_GROUPS, SITE_FAQ_QUESTIONS } from "../../content/siteFaqs";
import { htmlPreview } from "../../lib/supportLegal";

const GROUP_ICONS = {
  candidates: User,
  employers: Briefcase,
  account: ShieldCheck,
};

const SUPPORT_EMAIL = "support@signetemploymenthub.com";

export default function FaqList() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadFaqs = async () => {
    const snap = await getDocs(collection(db, "faqs"));
    setFaqs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => {
    loadFaqs();
  }, []);

  const extraFaqs = useMemo(
    () =>
      faqs.filter(
        (faq) => !SITE_FAQ_QUESTIONS.has(String(faq.question || "").trim().toLowerCase())
      ),
    [faqs]
  );

  const remove = async (id) => {
    if (!window.confirm("Delete this FAQ?")) return;
    try {
      await deleteDoc(doc(db, "faqs", id));
      toast.success("FAQ deleted");
      loadFaqs();
    } catch (err) {
      console.error("Could not delete FAQ:", err);
      toast.error("Could not delete FAQ");
    }
  };

  return (
    <div className="nk-faq-page">
      <section className="nk-faq-hero">
        <div className="nk-container">
          <p className="nk-faq-kicker">Help center</p>
          <h1>Frequently asked questions</h1>
          <p className="nk-faq-lead">
            Quick answers for candidates and employers using Signet Employment Hub.
          </p>
          <nav className="nk-faq-jump" aria-label="FAQ topics">
            {SITE_FAQ_GROUPS.map((group) => {
              const Icon = GROUP_ICONS[group.id] || ShieldCheck;
              return (
                <a key={group.id} href={`#${group.id}`}>
                  <Icon size={14} />
                  {group.title}
                </a>
              );
            })}
            {extraFaqs.length > 0 && (
              <a href="#additional">
                <Plus size={14} />
                Additional FAQs
              </a>
            )}
          </nav>
          <div className="nk-faq-help-actions" style={{ marginTop: 18 }}>
            <button type="button" className="signet-btn" onClick={() => navigate("/admin/faqs/add")}>
              <Plus size={16} /> Add FAQ
            </button>
          </div>
        </div>
      </section>

      <section className="nk-faq-body">
        <div className="nk-container nk-faq-stack">
          {SITE_FAQ_GROUPS.map((group) => {
            const Icon = GROUP_ICONS[group.id] || ShieldCheck;
            return (
              <div key={group.id} id={group.id} className="nk-faq-group">
                <h2>
                  <span className="nk-faq-group-icon" aria-hidden>
                    <Icon size={15} />
                  </span>
                  {group.title}
                </h2>
                <div className="nk-faq-list">
                  {group.items.map((item) => (
                    <details key={item.q} className="nk-faq-item">
                      <summary>
                        <span>{item.q}</span>
                        <ChevronDown size={16} />
                      </summary>
                      <p>{item.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            );
          })}

          {(loading || extraFaqs.length > 0) && (
            <div id="additional" className="nk-faq-group">
              <h2>
                <span className="nk-faq-group-icon" aria-hidden>
                  <Plus size={15} />
                </span>
                Additional FAQs
              </h2>
              {loading ? (
                <p className="nk-faq-lead">Loading extra FAQs…</p>
              ) : (
                <div className="nk-faq-list">
                  {extraFaqs.map((faq) => (
                    <details key={faq.id} className="nk-faq-item">
                      <summary>
                        <span>{faq.question}</span>
                        <span className="nk-faq-extra-actions">
                          <button
                            type="button"
                            className="signet-icon-btn !w-8 !h-8"
                            title="Edit FAQ"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              navigate(`/admin/faqs/${faq.id}/edit`);
                            }}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            className="signet-icon-btn !w-8 !h-8 hover:!border-red-300 hover:!text-red-600"
                            title="Delete FAQ"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              remove(faq.id);
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                          <ChevronDown size={16} />
                        </span>
                      </summary>
                      <div
                        className="nk-faq-html"
                        dangerouslySetInnerHTML={{
                          __html: faq.answer || `<p>${htmlPreview("")}</p>`,
                        }}
                      />
                    </details>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="nk-faq-help">
            <div>
              <strong>Still need help?</strong>
              <p>Contact support and we'll assist with your account, applications, or listings.</p>
            </div>
            <div className="nk-faq-help-actions">
              <a href={`mailto:${SUPPORT_EMAIL}`} className="signet-btn">
                Email support
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
