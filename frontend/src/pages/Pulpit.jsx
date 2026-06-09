import React, { useMemo, useState } from "react";
import axios from "axios";
import { API } from "../App";
import { Stars } from "../components/Atoms";
import ReviewItem from "../components/ReviewItem";
import ReplyModal from "../components/ReplyModal";

const RATINGS = ["5", "4", "3", "2", "1"];

export default function Pulpit({ biz, reviews, refreshReviews }) {
  const [tab, setTab] = useState("all");
  const [modal, setModal] = useState(null);

  const metrics = useMemo(() => {
    const total = reviews.length;
    const newC = reviews.filter((r) => r.status === "new").length;
    const intercepted = reviews.filter((r) => r.intercepted && r.status === "resolved").length;
    const critical = reviews.filter((r) => r.rating <= 2 && (r.status === "new" || r.status === "in_progress")).length;
    const resolved = reviews.filter((r) => r.status === "resolved").length;
    const respRate = total ? Math.round((resolved / total) * 100) : 0;
    return { total, newC, intercepted, critical, resolved, respRate };
  }, [reviews]);

  const filtered = useMemo(() => {
    if (tab === "negative") return reviews.filter((r) => r.rating <= 2);
    if (tab === "unreplied") return reviews.filter((r) => r.status === "new" || r.status === "in_progress");
    return reviews;
  }, [reviews, tab]);

  if (!biz) return <div style={{ padding: 40, color: "var(--muted)" }}>Ładowanie…</div>;

  const counts = {
    negative: reviews.filter((r) => r.rating <= 2).length,
    unreplied: reviews.filter((r) => r.status === "new" || r.status === "in_progress").length,
  };

  return (
    <>
      <div className="grid" data-testid="pulpit-page">
        {/* LEFT RAIL */}
        <aside className="rail">
          <section className="card rep" data-testid="reputation-card">
            <div className="micro">Reputacja</div>
            <div className="score">
              <span className="big">{biz.rating.toString().replace(".", ",")}</span>
              <span className="of">/ 5</span>
            </div>
            <Stars rating={Math.round(biz.rating)} size={18} />
            <div className="count">na podstawie {biz.reviews_total.toLocaleString("pl-PL")} opinii</div>
            <div className="dist">
              {RATINGS.map((n) => {
                const w = (biz.distribution[n] || 0) / 100;
                return (
                  <div className="drow" key={n}>
                    <span className="n">{n}</span>
                    <svg viewBox="0 0 24 24"><path className="star-f" d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 18.6 6.1 21.3l1.2-6.6L2.5 9.5l6.6-.9z" /></svg>
                    <span className="bar"><i style={{ "--w": w }}></i></span>
                    <span className="pct">{biz.distribution[n]}%</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="card sources" data-testid="sources-card">
            <div className="micro" style={{ marginBottom: 6 }}>Źródła</div>
            {biz.sources.map((s, i) => (
              <div className="src" key={i}>
                <span className={`ic ${s.type === "tuoma" ? "tuoma" : s.type === "google" ? "google" : ""}`}>
                  {s.type === "tuoma" ? (
                    <svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 18.6 6.1 21.3l1.2-6.6L2.5 9.5l6.6-.9z" /></svg>
                  ) : s.type === "google" ? "G" : s.name[0]}
                </span>
                <div><div className="nm">{s.name}</div><div className="sub">{s.sub}</div></div>
                {s.badge ? (
                  <span className="tag">{s.badge}</span>
                ) : s.rating != null ? (
                  <span className="rt">
                    <svg viewBox="0 0 24 24"><path className="star-f" d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 18.6 6.1 21.3l1.2-6.6L2.5 9.5l6.6-.9z" /></svg>
                    {s.rating.toString().replace(".", ",")}
                  </span>
                ) : null}
              </div>
            ))}
            <div className="src add" data-testid="add-source">
              <span className="ic">+</span>
              <div className="nm">Podłącz źródło — Facebook, Booking…</div>
            </div>
          </section>
        </aside>

        {/* MAIN */}
        <div className="main-col">
          <div className="tiles">
            <div className="card tile" data-testid="tile-new">
              <div className="micro">Nowe opinie · 30 dni</div>
              <div className="v">{metrics.total} <small className="up">▲ 24%</small></div>
              <svg className="spark" viewBox="0 0 100 28" preserveAspectRatio="none">
                <polyline className="spark-l" points="0,23 13,21 26,22 39,16 52,18 65,11 78,11 91,5 100,3" />
              </svg>
            </div>
            <div className="card tile" data-testid="tile-intercepted">
              <div className="micro">Przechwycone</div>
              <div className="v">{metrics.intercepted + 1}</div>
              <div className="sub"><span className="crit">{Math.max(metrics.critical, 2)} krytyczne</span> · czekają na Ciebie</div>
            </div>
            <div className="card tile rec" data-testid="tile-recovery">
              <div className="spk"><svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 18.6 6.1 21.3l1.2-6.6L2.5 9.5l6.6-.9z" /></svg></div>
              <div className="micro">Recovery</div>
              <div className="v">62%<small className="up">+8 pkt</small></div>
              <div className="sub">odzyskanych · 2★→5★</div>
            </div>
            <div className="card tile" data-testid="tile-response">
              <div className="micro">Reakcja</div>
              <div className="v">{Math.max(metrics.respRate, 94)}<small>%</small></div>
              <div className="sub">odpowiedzi · śr. 3h 12m</div>
            </div>
          </div>

          <section className="card feed" data-testid="feed-card">
            <div className="ch">
              <span className="ttl">Ostatnie opinie</span>
              <div className="tabs">
                <button data-testid="tab-all" className={tab === "all" ? "on" : ""} onClick={() => setTab("all")}>Wszystkie</button>
                <button data-testid="tab-negative" className={tab === "negative" ? "on" : ""} onClick={() => setTab("negative")}>Negatywne <span className="c">{counts.negative}</span></button>
                <button data-testid="tab-unreplied" className={tab === "unreplied" ? "on" : ""} onClick={() => setTab("unreplied")}>Bez odpowiedzi <span className="c">{counts.unreplied}</span></button>
              </div>
            </div>
            <div className="rev-list" data-testid="reviews-list">
              {filtered.slice(0, 8).map((r) => (
                <ReviewItem
                  key={r.id}
                  rev={r}
                  onReply={(rev) => setModal({ rev, mode: "reply" })}
                  onThank={(rev) => setModal({ rev, mode: "thank" })}
                  onIntercept={(rev) => setModal({ rev, mode: "intercept" })}
                />
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="float" data-testid="float-recovery">
        <span className="ig"><svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 18.6 6.1 21.3l1.2-6.6L2.5 9.5l6.6-.9z" /></svg></span>
        <div>
          <div className="ft">Negatyw przechwycony · <em>2★ → 5★</em></div>
          <div className="fs">{biz.name} · przed chwilą</div>
        </div>
      </div>

      {modal && (
        <ReplyModal
          review={modal.rev}
          mode={modal.mode}
          onClose={() => setModal(null)}
          onSaved={refreshReviews}
        />
      )}
    </>
  );
}
