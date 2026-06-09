import React from "react";

export function Star({ filled = true }) {
  return (
    <svg viewBox="0 0 24 24">
      <path className={filled ? "star-f" : "star-e"} d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 18.6 6.1 21.3l1.2-6.6L2.5 9.5l6.6-.9z" />
    </svg>
  );
}

export function Stars({ rating, max = 5, size }) {
  const style = size ? { "--sw": `${size}px` } : undefined;
  return (
    <span className="stars" style={style} aria-label={`${rating} z ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <Star key={i} filled={i < rating} />
      ))}
    </span>
  );
}

export function SourceBadge({ source, intercepted }) {
  if (source === "tuoma") {
    return (
      <span className="srcbadge tuoma">
        <svg className="mk" viewBox="0 0 24 24">
          <path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 18.6 6.1 21.3l1.2-6.6L2.5 9.5l6.6-.9z" />
        </svg>
        Tuoma{intercepted ? " · przechwycono" : ""}
      </span>
    );
  }
  if (source === "google") return <span className="srcbadge">G Google</span>;
  if (source === "facebook") return <span className="srcbadge">f Facebook</span>;
  if (source === "booking") return <span className="srcbadge">B Booking</span>;
  return <span className="srcbadge">{source}</span>;
}

export function StatusPill({ status }) {
  const map = {
    new: { cls: "new", label: "Nowa" },
    in_progress: { cls: "prog", label: "W toku" },
    resolved: { cls: "done", label: "Rozwiązano" },
    intercepted: { cls: "done", label: "Przechwycono" },
  };
  const s = map[status] || { cls: "", label: status };
  return (
    <span className={`pill ${s.cls}`}>
      <i className="d"></i>
      {s.label}
    </span>
  );
}
