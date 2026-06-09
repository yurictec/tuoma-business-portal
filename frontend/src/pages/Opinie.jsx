import React, { useMemo, useState } from "react";
import ReviewItem from "../components/ReviewItem";
import ReplyModal from "../components/ReplyModal";

export default function Opinie({ reviews, refreshReviews, counts }) {
  const [tab, setTab] = useState("all");
  const [modal, setModal] = useState(null);

  const filtered = useMemo(() => {
    if (tab === "negative") return reviews.filter((r) => r.rating <= 2);
    if (tab === "unreplied") return reviews.filter((r) => r.status === "new" || r.status === "in_progress");
    if (tab === "intercepted") return reviews.filter((r) => r.intercepted);
    return reviews;
  }, [reviews, tab]);

  return (
    <div data-testid="opinie-page">
      <div className="page-head">
        <div>
          <div className="page-title">Opinie</div>
          <div className="page-sub">Każda gwiazdka się liczy. Odpowiadaj publicznie, przechwytuj negatywne — zamieniaj 2★ w 5★ i odzyskuj klientów.</div>
        </div>
        <div className="tabs">
          <button data-testid="opinie-tab-all" className={tab === "all" ? "on" : ""} onClick={() => setTab("all")}>Wszystkie <span className="c">{reviews.length}</span></button>
          <button data-testid="opinie-tab-unreplied" className={tab === "unreplied" ? "on" : ""} onClick={() => setTab("unreplied")}>Bez odpowiedzi <span className="c">{counts.unreplied}</span></button>
          <button data-testid="opinie-tab-negative" className={tab === "negative" ? "on" : ""} onClick={() => setTab("negative")}>Negatywne <span className="c">{counts.negative}</span></button>
          <button data-testid="opinie-tab-intercepted" className={tab === "intercepted" ? "on" : ""} onClick={() => setTab("intercepted")}>Przechwycone</button>
        </div>
      </div>

      <section className="card" data-testid="opinie-list">
        <div className="rev-list">
          {filtered.length === 0 ? (
            <div className="empty">
              <div className="ico"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
              <h4>Pusto</h4>
              <p>Brak opinii w tej kategorii.</p>
            </div>
          ) : (
            filtered.map((r) => (
              <ReviewItem
                key={r.id}
                rev={r}
                onReply={(rev) => setModal({ rev, mode: "reply" })}
                onThank={(rev) => setModal({ rev, mode: "thank" })}
                onIntercept={(rev) => setModal({ rev, mode: "intercept" })}
              />
            ))
          )}
        </div>
      </section>

      {modal && (
        <ReplyModal
          review={modal.rev}
          mode={modal.mode}
          onClose={() => setModal(null)}
          onSaved={refreshReviews}
        />
      )}
    </div>
  );
}
