import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { API } from "../App";

const SERVICES = [
  { key: "tuoma",    name: "Tuoma",    sub: "kanał właściciela · przechwytuje negatywy",  icon: "★", color: "#20c9b9", primary: true },
  { key: "google",   name: "Google",   sub: "publiczne · wzmacnia ranking lokalny",       icon: "G", color: "#4285f4" },
  { key: "facebook", name: "Facebook", sub: "publiczne · zasięg społecznościowy",          icon: "f", color: "#1877f2" },
  { key: "booking",  name: "Booking",  sub: "publiczne · dla rezerwujących online",        icon: "B", color: "#003580" },
];

export default function ReviewLink() {
  const { slug = "kawiarnia-lumiere" } = useParams();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [step, setStep] = useState("rate"); // rate | route | done
  const [picked, setPicked] = useState(null);
  const [text, setText] = useState("");

  React.useEffect(() => {
    document.body.setAttribute("data-rev", "1");
    return () => document.body.removeAttribute("data-rev");
  }, []);

  const goNext = () => {
    if (rating === 0) return;
    setStep("route");
  };

  const pickService = async (svc) => {
    setPicked(svc);
    if (rating <= 3 || svc.key === "tuoma") {
      // intercept flow stays in Tuoma
      try {
        await axios.post(`${API}/waitlist`, {
          name: "Anonim",
          email: "review-public@tuoma.local",
          business_name: slug,
          role: "other",
          message: `Opinia ${rating}★ via ${svc.name}: ${text || "(bez treści)"}`,
        });
      } catch {}
      setStep("done");
    } else {
      // Public service — would redirect; for demo show done with link out
      setStep("done");
    }
  };

  const ratingLabel = ["", "źle", "słabo", "ok", "dobrze", "świetnie"][rating] || "";
  const isPositive = rating >= 4;

  return (
    <div className="rev" data-testid="review-page">
      <header className="rev-nav">
        <Link to="/lp" className="pub-logo">tu<span>o</span>ma</Link>
        <Link to={`/p/${slug}`} className="rev-link" data-testid="rev-back-public">← Wróć do {slug}</Link>
      </header>

      <main className="rev-wrap">
        {step === "rate" && (
          <div className="rev-card" data-testid="rev-step-rate">
            <div className="rev-kicker">Krok 1 / 2</div>
            <h1>Jak Ci było w Kawiarni Lumière?</h1>
            <p className="rev-sub">Twoja opinia trafi tam, gdzie chcesz — Google, Facebook, prywatnie do właściciela. Wybierasz Ty, nie algorytm.</p>

            <div className="rev-stars" data-testid="rev-stars">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  data-testid={`rev-star-${n}`}
                  className={`rev-star ${(hover || rating) >= n ? "on" : ""}`}
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(n)}
                  aria-label={`${n} z 5`}
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 18.6 6.1 21.3l1.2-6.6L2.5 9.5l6.6-.9z"/>
                  </svg>
                </button>
              ))}
            </div>
            <div className={`rev-rating-label ${rating ? "on" : ""}`}>
              {rating ? `${rating}/5 · ${ratingLabel}` : "kliknij gwiazdkę"}
            </div>

            <textarea
              data-testid="rev-text"
              rows={4}
              placeholder="Co Ci się spodobało? Co możemy poprawić? (opcjonalnie)"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <button
              data-testid="rev-next"
              className="rev-cta"
              disabled={rating === 0}
              onClick={goNext}
            >
              Dalej →
            </button>
          </div>
        )}

        {step === "route" && (
          <div className="rev-card" data-testid="rev-step-route">
            <div className="rev-kicker">Krok 2 / 2</div>
            <h1>{isPositive ? "Świetnie! Gdzie chcesz to opublikować?" : "Dziękujemy. Damy znać właścicielowi?"}</h1>
            <p className="rev-sub">
              {isPositive
                ? "Twoja 5★ opinia robi największą różnicę publicznie — wybierz, gdzie pomoże najbardziej."
                : "Negatywne opinie chcemy najpierw dać szansę naprawienia. Wybierz Tuoma — właściciel napisze do Ciebie prywatnie i postara się naprawić sytuację."}
            </p>

            <div className="rev-services">
              {SERVICES.filter((s) => !isPositive ? s.key === "tuoma" || s.key === "google" : true).map((s) => (
                <button
                  key={s.key}
                  className={`rev-svc ${s.primary ? "primary" : ""} ${!isPositive && s.key !== "tuoma" ? "muted" : ""}`}
                  data-testid={`rev-svc-${s.key}`}
                  onClick={() => pickService(s)}
                  style={{ "--svc-color": s.color }}
                >
                  <span className="rev-svc-ic">{s.icon}</span>
                  <div className="rev-svc-body">
                    <div className="rev-svc-name">{s.name} {!isPositive && s.key === "tuoma" && <span className="rec">zalecane</span>}</div>
                    <div className="rev-svc-sub">{s.sub}</div>
                  </div>
                  <span className="rev-svc-arrow">→</span>
                </button>
              ))}
            </div>

            <button className="rev-back" onClick={() => setStep("rate")} data-testid="rev-back-rate">← Wróć do oceny</button>
          </div>
        )}

        {step === "done" && (
          <div className="rev-card done" data-testid="rev-step-done">
            <div className="rev-done-icon" style={{ background: picked?.color || "#20c9b9" }}>✓</div>
            <h1>Dziękujemy za {rating}★ opinię!</h1>
            <p className="rev-sub">
              {picked?.key === "tuoma" && rating <= 3 ? (
                <>Twoja wiadomość trafiła prywatnie do właściciela <b>Kawiarni Lumière</b>. Skontaktuje się z Tobą w ciągu 24 godzin, żeby naprawić sytuację.</>
              ) : picked?.key === "tuoma" ? (
                <>Twoja opinia jest już widoczna na publicznej stronie biznesu w Tuoma. Dziękujemy, że pomagasz innym wybierać świadomie.</>
              ) : (
                <>Otwórz {picked?.name} i wklej swoją opinię tam — zrobi to największą różnicę dla Kawiarni Lumière.</>
              )}
            </p>
            <div className="rev-after-cta">
              <Link to={`/p/${slug}`} className="rev-cta">Zobacz profil biznesu</Link>
              <Link to="/lp" className="rev-back-link">A co to jest Tuoma? →</Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
