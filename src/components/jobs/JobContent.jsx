function isHtml(text) {
  return /<[a-z][\s\S]*>/i.test(text || "");
}

function plainToBlocks(text) {
  return (text || "")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
}

export default function JobContent({ text, className = "signet-job-content" }) {
  const raw = (text || "").trim();
  if (!raw) return null;

  if (isHtml(raw)) {
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: raw }}
      />
    );
  }

  const blocks = plainToBlocks(raw);
  if (blocks.length <= 1) {
    return <div className={`${className} whitespace-pre-wrap`}>{raw}</div>;
  }

  return (
    <div className={className}>
      {blocks.map((block, i) => {
        const lines = block.split(/\n/).map((l) => l.trim()).filter(Boolean);
        const isList = lines.length > 1 && lines.every((l) => /^[•\-–*]/.test(l));

        if (isList) {
          return (
            <ul key={i} className="signet-job-content-list">
              {lines.map((line, j) => (
                <li key={j}>{line.replace(/^[\s•·▪◦\-–—*]+/, "")}</li>
              ))}
            </ul>
          );
        }

        if (lines.length > 1 && lines.slice(1).every((l) => /^[•\-–*]/.test(l))) {
          return (
            <div key={i} className="signet-job-content-block">
              <p className="signet-job-content-heading">{lines[0]}</p>
              <ul className="signet-job-content-list">
                {lines.slice(1).map((line, j) => (
                  <li key={j}>{line.replace(/^[\s•·▪◦\-–—*]+/, "")}</li>
                ))}
              </ul>
            </div>
          );
        }

        return (
          <p key={i} className={i === 0 ? "signet-job-content-heading" : ""}>
            {block}
          </p>
        );
      })}
    </div>
  );
}
