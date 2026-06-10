import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { API } from "../App";
import { Stars } from "../components/Atoms";

const CAT_LABELS = {
  podstawowe: "Podstawowe",
  oferta: "Oferta",
  kontakt: "Kontakt",
  specjalne: "Specjalne",
};

export default function PublicProfile() {
  const { slug = "kawiarnia-lumiere" } = useParams();
  const [biz, setBiz] = useState(null);
  const [facts, setFacts] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    document.body.setAttribute("data-public", "1");
    return () => document.body.removeAttribute("data-public");
  }, []);

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/business/${slug}`),
      axios.get(`${API}/business/${slug}/truth`),
      axios.get(`${API}/business/${slug}/reviews`),
    ]).then(([b, t, r]) => {
      setBiz(b.data);
      setFacts(t.data);
      setReviews(r.data.filter((x) => x.status !== "intercepted" && !x.manager_message));
    });
  }, [slug]);

  if (!biz) return <div className="pub-loading">Ładowanie…</div>;

  const categorized = facts.reduce((acc, f) => {
    (acc[f.category] = acc[f.category] || []).push(f);
    return acc;
  }, {});

  return (
    <div className="pub" data-testid="public-profile">
      <header className="pub-nav">
        <Link to="/lp" className="pub-logo">tu<span>o</span>ma</Link>
        <div className="pub-nav-trust">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2.4"><path d="M20 6L9 17l-5-5"/></svg>
          Zweryfikowano przez Tuoma · neutralne źródło prawdy
        </div>
        <Link to={`/r/${slug}`} className="pub-cta-small" data-testid="pub-go-review">Zostaw opinię →</Link>
      </header>

      <section className="pub-hero">
        <div className="pub-mark">
          <span className="pub-avatar"><b>{biz.avatar_letter}</b></span>
        </div>
        <h1>{biz.name}</h1>
        <div className="pub-meta">{biz.city} · Kawiarnia speciality</div>
        <div className="pub-rating">
          <Stars rating={Math.round(biz.rating)} size={22} />
          <span className="pub-rating-num">{biz.rating.toString().replace(".", ",")} / 5</span>
          <span className="pub-rating-count">· {biz.reviews_total.toLocaleString("pl-PL")} opinii w 2 źródłach</span>
        </div>
        <div className="pub-actions">
          <Link to={`/r/${slug}`} className="pub-btn primary" data-testid="pub-leave-review">Zostaw opinię</Link>
          <a href="tel:+48321234567" className="pub-btn ghost">Zadzwoń</a>
          <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="pub-btn ghost">Trasa</a>
        </div>
      </section>

      <main className="pub-main">
        {/* AI-known facts */}
        <section className="pub-card pub-ai-block" data-testid="pub-ai-facts">
          <header className="pub-card-h">
            <div className="pub-card-kicker">Co AI wie o tym biznesie</div>
            <h2>{facts.length} faktów · zweryfikowanych</h2>
            <p>Te dane Tuoma przekazuje agentom AI (ChatGPT, Claude, Gemini, Perplexity). To samo, co czyta klient — czyta i maszyna.</p>
          </header>
          <div className="pub-facts-grid">
            {Object.entries(categorized).map(([cat, items]) => (
              <div className="pub-facts-col" key={cat}>
                <div className="pub-cat">{CAT_LABELS[cat] || cat}</div>
                <ul>
                  {items.map((f) => (
                    <li key={f.id}>
                      <div className="pub-fact-label">{f.label}</div>
                      <div className="pub-fact-value">{f.value}</div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Real reviews */}
        <section className="pub-card" data-testid="pub-reviews">
          <header className="pub-card-h">
            <div className="pub-card-kicker">Co mówią klienci</div>
            <h2>Opinie publiczne · {reviews.length}</h2>
          </header>
          <div className="pub-reviews">
            {reviews.slice(0, 6).map((r) => (
              <div className="pub-review" key={r.id}>
                <div className="pub-rev-h">
                  <span className="pub-rev-av">{r.initial}</span>
                  <div>
                    <div className="pub-rev-who">{r.author}</div>
                    <div className="pub-rev-when">{r.when} · {r.source}</div>
                  </div>
                  <Stars rating={r.rating} size={14} />
                </div>
                <div className="pub-rev-txt">„{r.text}”</div>
                {r.response && (
                  <div className="pub-rev-reply">
                    <span>Odpowiedź właściciela</span> {r.response}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="pub-foot">
        <div>
          <Link to="/lp" className="pub-logo small">tu<span>o</span>ma</Link>
          <span>· widoczność biznesu w epoce AI</span>
        </div>
        <div className="pub-foot-meta">
          Strona generowana automatycznie z Feed Prawdy · ostatnia aktualizacja: przed chwilą
        </div>
      </footer>
    </div>
  );
}
