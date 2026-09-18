import { Fragment, useMemo } from "react";
import { SIGNET_LOGO_ALT, SIGNET_LOGO_SRC } from "../../lib/brand";

function linkifyText(text) {
  const parts = String(text || "").split(
    /((?:https?:\/\/[^\s]+)|(?:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}))/g
  );
  return parts.map((part, index) => {
    if (/^https?:\/\//.test(part)) {
      return (
        <a key={index} href={part} target="_blank" rel="noreferrer">
          {part}
        </a>
      );
    }
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(part)) {
      return (
        <a key={index} href={`mailto:${part}`}>
          {part}
        </a>
      );
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}

function LegalBlocks({ blocks = [] }) {
  return (
    <>
      {blocks.map((block, index) => {
        if (block.type === "p") {
          return (
            <p key={index} className="signet-legal-p">
              {linkifyText(block.text)}
            </p>
          );
        }
        if (block.type === "ul") {
          return (
            <ul key={index} className="signet-legal-ul">
              {block.items.map((item) => (
                <li key={item}>{linkifyText(item)}</li>
              ))}
            </ul>
          );
        }
        if (block.type === "table") {
          return (
            <div key={index} className="signet-legal-table-wrap">
              <table className="signet-legal-table">
                <thead>
                  <tr>
                    {block.headers.map((header) => (
                      <th key={header}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex}>{linkifyText(cell)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        if (block.type === "dl") {
          return (
            <dl key={index} className="signet-legal-dl">
              {block.items.map(([label, value]) => (
                <div key={label} className="signet-legal-dl-row">
                  <dt>{label}</dt>
                  <dd>{linkifyText(value)}</dd>
                </div>
              ))}
            </dl>
          );
        }
        return null;
      })}
    </>
  );
}

export default function LegalDocumentView({ document }) {
  const toc = useMemo(
    () =>
      (document?.sections || []).map((section) => ({
        id: section.id,
        label: `${section.number}. ${section.title}`,
      })),
    [document]
  );

  if (!document) return null;

  return (
    <div className="signet-legal-shell">
      <article className="signet-legal-doc">
        <header className="signet-legal-header">
          <div className="signet-legal-brand">
            <img src={SIGNET_LOGO_SRC} alt={SIGNET_LOGO_ALT} width={40} height={40} />
            <div>
              <p className="signet-legal-brand-name">Signet Employment Hub</p>
              <p className="signet-legal-brand-entity">{document.meta.entity.legalName}</p>
            </div>
          </div>
          <p className="signet-legal-kicker">{document.meta.product}</p>
          <h1>{document.meta.title}</h1>
          <div className="signet-legal-meta">
            <span>Effective date: {document.meta.effectiveDate}</span>
            <span>Version {document.meta.version}</span>
          </div>
          {document.meta.notice ? (
            <p className="signet-legal-notice">{document.meta.notice}</p>
          ) : null}
        </header>

        <nav className="signet-legal-toc" aria-label="Table of contents">
          <strong>Contents</strong>
          <ol>
            {toc.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`}>{item.label}</a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="signet-legal-body-wrap">
          {document.sections.map((section) => (
            <section key={section.id} id={section.id} className="signet-legal-section">
              <h2>
                <span className="signet-legal-section-num">{section.number}.</span>
                {section.title}
              </h2>
              <LegalBlocks blocks={section.blocks} />
              {(section.subsections || []).map((subsection) => (
                <div key={subsection.id} className="signet-legal-subsection">
                  <h3>{subsection.title}</h3>
                  <LegalBlocks blocks={subsection.blocks} />
                </div>
              ))}
            </section>
          ))}
        </div>
      </article>
    </div>
  );
}
