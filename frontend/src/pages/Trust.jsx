import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API } from "../App";

const DO = [
  { t: "Trzymamy Feed Prawdy", d: "Neutralne, zweryfikowane fakty o biznesie. Aktualizuje sam właściciel; my potwierdzamy źródło." },
  { t: "Łączymy biznes z klientem", d: "Każda interakcja (opinia, rezerwacja, recovery) wraca do bazy biznesu — to jego aktywo, nie nasze." },
  { t: "Przekazujemy fakty do AI", d: "ChatGPT, Claude, Gemini, Perplexity dostają to samo. Bez priorytetów, bez ukrytych deal'ów." },
  { t: "Logujemy publicznie", d: "Każda synchronizacja, każde przechwycenie negatywu — w publicznym audit logu poniżej." },
];

const DONT = [
  { t: "Nie sprzedajemy danych klientów", d: "Ani brokerom, ani gatekeeperom. Baza klientów biznesu zostaje u biznesu — eksport CSV w 1 kliku." },
  { t: "Nie przyjmujemy płatności za ranking", d: "AI nie poleca Cię „bo zapłaciłeś”. Tylko Feed Prawdy + realne opinie + zgodność z zapytaniem." },
  { t: "Nie jesteśmy własnością gatekeepera", d: "Brak udziałów Google, Meta, Microsoft, OpenAI, Anthropic. Sprawdź sekcję inwestorów." },
  { t: "Nie blokujemy eksportu", d: "Zgodnie z Data Act 2025: właściciel klika „Export” i dostaje wszystkie swoje dane w 30 sekund." },
];

const COMPLIANCE = [
  { code: "DMA", name: "Digital Markets Act", body: "Tuoma jest niezależną trzecią stroną. Nie jesteśmy gatekeeperem. Relację biznes ↔ klient zwracamy biznesowi, zgodnie z art. 6(9)." },
  { code: "Data Act", name: "Data Act 2025", body: "Pełna przenośność danych. Właściciel biznesu może w każdej chwili wyeksportować wszystkie dane (klienci, opinie, fakty) w formacie maszynowo czytelnym." },
  { code: "GDPR", name: "RODO / GDPR", body: "Klient sam decyduje, dokąd trafia jego opinia (Tuoma · Google · Facebook · prywatnie). Wszystkie dane osobowe są przetwarzane w UE, na serwerach we Frankfurcie." },
  { code: "AI Act", name: "EU AI Act 2025", body: "Tuoma nie wykorzystuje profilowania ani decyzji automatycznej wobec klientów. Algorytmy intercept są transparentne i publicznie udokumentowane." },
];

const INVESTORS = [
  { name: "Founders", pct: 72, kind: "Założyciele · Polska" },
  { name: "Angel I", pct: 12, kind: "Anioł biznesu · UE" },
  { name: "Angel II", pct: 8, kind: "Anioł biznesu · UE" },
  { name: "ESOP pool", pct: 8, kind: "Pula opcji pracowniczych" },
];

const NOT_OWNED_BY = ["Google", "Meta", "Microsoft", "OpenAI", "Anthropic", "Booking Holdings"];

function EventIcon({ kind, icon }) {
  const colorMap = {
    fact_synced: "#5be8d8",
    ai_mention: "#f5a623",
    intercept: "#ef9461",
  };
  return (
    <span className="tr-event-ic" style={{ background: colorMap[kind] || "#5be8d8" }}>{icon}</span>
  );
}

export default function Trust() {
  const [data, setData] = useState(null);

  useEffect(() => {
    document.body.setAttribute("data-trust", "1");
    return () => document.body.removeAttribute("data-trust");
  }, []);

  useEffect(() => {
    axios.get(`${API}/trust/audit-log`).then((r) => setData(r.data)).catch(() => {});
  }, []);

  return (
    <div className="trust" data-testid="trust-page">
      <header className="trust-nav">
        <Link to="/lp" className="pub-logo">tu<span>o</span>ma</Link>
        <div className="trust-badge"><span className="tr-pulse"></span> NEUTRAL LAYER · live</div>
        <Link to="/lp" className="trust-back" data-testid="trust-back">← Z powrotem</Link>
      </header>

      {/* HERO */}
      <section className="trust-hero">
        <div className="trust-kicker">Strona zaufania · audytowalna publicznie</div>
        <h1>
          Tuoma to nie kolejna platforma.<br/>
          <span className="trust-hl">To niezależna warstwa prawdy.</span>
        </h1>
        <p className="trust-sub">
          Między biznesem, jego klientem i agentem AI musi stać ktoś, kto nie jest stroną. Po to napisano Digital Markets Act i Data Act. Tą stroną jesteśmy my.
          Wszystko, co dzieje się w tej warstwie — sprawdzisz na tej stronie. Bez logowania, bez NDA.
        </p>
        <div className="trust-meta-row">
          <div className="trust-stat">
            <div className="trust-stat-n">{data?.facts_total ?? "—"}</div>
            <div className="trust-stat-l">faktów w Feed Prawdy</div>
          </div>
          <div className="trust-stat">
            <div className="trust-stat-n">{data?.mentions_total ?? "—"}</div>
            <div className="trust-stat-l">wzmianek AI · zalogowanych</div>
          </div>
          <div className="trust-stat">
            <div className="trust-stat-n">{data?.reviews_total ?? "—"}</div>
            <div className="trust-stat-l">opinii · w 4 źródłach</div>
          </div>
        </div>
      </section>

      {/* DO / DON'T */}
      <section className="trust-section">
        <h2>Co robimy · czego nie robimy</h2>
        <div className="trust-grid-2">
          <div className="trust-col do" data-testid="trust-do">
            <div className="trust-col-head"><span className="tag-do">DO</span> 4 rzeczy, za które bierzemy odpowiedzialność</div>
            <ul>
              {DO.map((r) => (
                <li key={r.t}>
                  <span className="ic-check">✓</span>
                  <div><b>{r.t}</b><p>{r.d}</p></div>
                </li>
              ))}
            </ul>
          </div>
          <div className="trust-col dont" data-testid="trust-dont">
            <div className="trust-col-head"><span className="tag-dont">DON&apos;T</span> 4 rzeczy, których nigdy nie zrobimy</div>
            <ul>
              {DONT.map((r) => (
                <li key={r.t}>
                  <span className="ic-x">×</span>
                  <div><b>{r.t}</b><p>{r.d}</p></div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* COMPLIANCE */}
      <section className="trust-section">
        <h2>Zgodność z prawem UE — nie hasło, ale architektura</h2>
        <div className="trust-laws" data-testid="trust-compliance">
          {COMPLIANCE.map((c) => (
            <div className="trust-law" key={c.code}>
              <div className="trust-law-code">{c.code}</div>
              <div className="trust-law-name">{c.name}</div>
              <p>{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* INVESTORS */}
      <section className="trust-section">
        <h2>Kto za to płaci</h2>
        <p className="trust-sub-small">Pełna struktura kapitałowa. Jeśli kiedykolwiek pojawi się tu gatekeeper — Tuoma przestanie być Tuoma.</p>
        <div className="trust-grid-2">
          <div className="trust-cap" data-testid="trust-cap">
            <div className="trust-cap-h">Struktura kapitałowa · stan na Q1 2026</div>
            <div className="trust-cap-bar">
              {INVESTORS.map((iv, i) => (
                <span key={iv.name} className="trust-cap-seg" style={{ width: `${iv.pct}%`, background: ["#20c9b9", "#5be8d8", "#7be0d4", "#9aebde"][i] }}>{iv.pct}%</span>
              ))}
            </div>
            <ul className="trust-cap-list">
              {INVESTORS.map((iv, i) => (
                <li key={iv.name}>
                  <span className="trust-cap-dot" style={{ background: ["#20c9b9", "#5be8d8", "#7be0d4", "#9aebde"][i] }}></span>
                  <b>{iv.name}</b>
                  <span className="trust-cap-kind">{iv.kind}</span>
                  <span className="trust-cap-pct">{iv.pct}%</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="trust-notowned" data-testid="trust-notowned">
            <div className="trust-notowned-h">Nie należymy do</div>
            <div className="trust-notowned-grid">
              {NOT_OWNED_BY.map((g) => (
                <div className="trust-notowned-pill" key={g}>
                  <span className="ic-x small">×</span>
                  {g}
                </div>
              ))}
            </div>
            <p className="trust-notowned-foot">Każda zmiana w cap-table powyżej 5% publikowana jest tu w ciągu 30 dni.</p>
          </div>
        </div>
      </section>

      {/* AUDIT LOG */}
      <section className="trust-section">
        <h2>Public audit log · ostatnie zdarzenia w warstwie</h2>
        <p className="trust-sub-small">Pełna historia tego, co Tuoma robi — w czasie rzeczywistym. Dane zanonimizowane na poziomie biznesu (slug → hash).</p>
        <div className="trust-log" data-testid="trust-log">
          {(data?.events || []).map((e, i) => (
            <div className="trust-log-row" key={i}>
              <EventIcon kind={e.kind} icon={e.icon} />
              <div className="trust-log-body">
                <div className="trust-log-title">{e.title}</div>
                <div className="trust-log-sub">{e.subtitle}</div>
              </div>
              <div className="trust-log-time">{e.rel}</div>
            </div>
          ))}
          {!data && <div className="trust-log-loading">Ładowanie zdarzeń…</div>}
        </div>
      </section>

      <footer className="trust-foot">
        <div>
          <Link to="/lp" className="pub-logo small">tu<span>o</span>ma</Link>
          <span>· neutralna warstwa prawdy o biznesie</span>
        </div>
        <div className="trust-foot-meta">
          Audytowalne publicznie · pytania: <a href="mailto:trust@tuoma.pl">trust@tuoma.pl</a>
        </div>
      </footer>
    </div>
  );
}
