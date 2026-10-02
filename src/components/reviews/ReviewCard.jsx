import { Star } from "lucide-react";
import { reviewInitials } from "../../lib/reviews";

function Stars({ value = 5 }) {
  return (
    <span className="signet-review-stars" aria-hidden>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          size={15}
          fill={index < value ? "#f5a623" : "transparent"}
          color={index < value ? "#f5a623" : "#d4d8e6"}
        />
      ))}
    </span>
  );
}

export default function ReviewCard({
  review,
  actions,
  placeholder = false,
}) {
  const rating = Number(review.rating || 0);
  const kind = review.kind || "Candidate";
  const name = review.name?.trim() || (placeholder ? "Reviewer name" : "");
  const title = review.title?.trim() || (placeholder ? "Role" : "");
  const place = review.place?.trim() || (placeholder ? "Location" : "");
  const quote = review.quote?.trim() || (placeholder ? "The review text will appear here." : "");

  return (
    <article className={`signet-review-card${placeholder ? " is-preview" : ""}`}>
      <span className="signet-review-ornament" aria-hidden>
        “
      </span>

      <div className="signet-review-card-meta">
        <span className="signet-review-rating">
          <strong>{rating.toFixed(1)}</strong>
          <Stars value={rating} />
        </span>
        <div className="signet-review-card-chips">
          <span className={`signet-review-kind is-${kind.toLowerCase()}`}>{kind}</span>
          {placeholder ? null : (
            <span className={`signet-badge ${review.published === false ? "signet-badge--neutral" : "signet-badge--success"}`}>
              {review.published === false ? "Hidden" : "Live"}
            </span>
          )}
        </div>
      </div>

      <blockquote className="signet-review-quote">{quote}</blockquote>

      <footer className="signet-review-card-foot">
        <div className="signet-review-person">
          <span
            className="signet-review-avatar"
            style={{ background: review.accent || "#2550eb" }}
          >
            {reviewInitials(name || "S")}
          </span>
          <span className="min-w-0">
            <strong>{name}</strong>
            <em>
              {title}
              {title && place ? " · " : ""}
              {place}
            </em>
          </span>
        </div>
        {actions ? <div className="signet-review-card-actions">{actions}</div> : null}
      </footer>
    </article>
  );
}
