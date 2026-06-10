import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API } from "../App";
import Counter from "../components/Counter";
import SocialProof from "../components/SocialProof";

/* ============================== AUDIT DEMO ============================== */
const AGENTS = [
  { name: "ChatGPT", color: "#10a37f" },
  { name: "Claude", color: "#cc785c" },
  { name: "Gemini", color: "#4285f4" },
  { name: "Perplexity", color: "#22b8cf" },
];

const FAKE_QUERIES = [
  (b, c) => `polecam dobrą ${b ? b.toLowerCase() : "kawiarnię"} w ${c || "Katowicach"}`,
  (b, c) => `najlepsze miejsce w ${c || "Katowicach"}`,
  (b, c) => `gdzie warto pójść w ${c || "Katowicach"}`,
];

function AuditDemo() {
  const [biz, setBiz] = useState("");
  const [city, setCity] = useState("");
  const [phase, setPhase] = useState("idle"); // idle | running | done
  const [step, setStep] = useState(0);
  const timersRef = useRef([]);

  const reset = () => {
    timersRef.current.forEach(clearTimeout);
    setPhase("idle");
    setStep(0);
  };

  const run = () => {
    if (!biz.trim()) return;
    reset();
    setPhase("running");
    AGENTS.forEach((_, i) => {
      const t = setTimeout(() => setStep(i + 1), 800 * (i + 1));
      timersRef.current.push(t);
    });
    const t2 = setTimeout(() => setPhase("done"), 800 * AGENTS.length + 600);
    timersRef.current.push(t2);
  };

  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  return (
    <div className="audit-card" data-testid="audit-demo">
      <div className="audit-head">
        <span className="audit-tag">DEMO · 30 sekund</span>
        <h3>Sprawdź, czy AI Cię poleca</h3>
        <p>Wpisz nazwę swojego biznesu i miasto. Tuoma symuluje rozmowę z 4 agentami.</p>
      </div>

      <div className="audit-form">
        <input
          data-testid="audit-biz"
          placeholder="Nazwa biznesu (np. Kawiarnia Lumière)"
          value={biz}
          onChange={(e) => setBiz(e.target.value)}
        />
        <input
          data-testid="audit-city"
          placeholder="Miasto"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button
          data-testid="audit-run"
          className="btn-cta"
          onClick={phase === "done" ? reset : run}
          disabled={!biz.trim() || phase === "running"}
        >
          {phase === "idle" && "Uruchom audyt"}
          {phase === "running" && "Pytamy AI…"}
          {phase === "done" && "Sprawdź ponownie"}
        </button>
      </div>

      {phase !== "idle" && (
        <div className="audit-stream" data-testid="audit-stream">
          {AGENTS.map((a, i) => {
            const active = step > i;
            return (
              <div className={`stream-row ${active ? "active" : ""}`} key={a.name}>
                <span className="stream-dot" style={{ background: a.color }}>{a.name[0]}</span>
                <div className="stream-body">
                  <div className="stream-agent">{a.name} <span>· {FAKE_QUERIES[i % FAKE_QUERIES.length](biz, city)}</span></div>
                  {active ? (
                    <div className="stream-result bad">
                      <span className="ic-x">×</span>
                      <span>nie wymienia <b>{biz}</b> · poleca 3 konkurentów</span>
                    </div>
                  ) : (
                    <div className="stream-result loading"><span className="dots"><i></i><i></i><i></i></span> pytamy {a.name}…</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {phase === "done" && (
        <div className="audit-verdict" data-testid="audit-verdict">
          <div className="verdict-num">0 / 4</div>
          <div>
            <div className="verdict-title">AI nie zna {biz || "Twojego biznesu"}.</div>
            <div className="verdict-sub">W żadnym z 4 agentów <b>{biz || "Twoja firma"}</b> nie pojawia się w odpowiedzi. Klient pyta — agent poleca kogoś innego. Codziennie.</div>
          </div>
          <a href="#waitlist" className="btn-cta verdict-cta">Naprawmy to →</a>
        </div>
      )}
    </div>
  );
}

/* ============================== WAITLIST ============================== */
function WaitlistForm() {
  const [form, setForm] = useState({ name: "", email: "", business_name: "", city: "", role: "owner", message: "" });
  const [state, setState] = useState("idle"); // idle | sending | done | err
  const [count, setCount] = useState(null);

  useEffect(() => {
    axios.get(`${API}/waitlist/count`).then((r) => setCount(r.data.count)).catch(() => {});
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setState("sending");
    try {
      await axios.post(`${API}/waitlist`, form);
      setState("done");
      setCount((c) => (c == null ? c : c + 1));
    } catch {
      setState("err");
    }
  };

  if (state === "done") {
    return (
      <div className="wait-done" data-testid="waitlist-success">
        <div className="wait-done-icon">✓</div>
        <h3>Jesteś na liście.</h3>
        <p>Skontaktujemy się w ciągu 24 godzin, żeby umówić 15-minutowe demo i pokazać Ci, jak Tuoma sprawi, że AI zacznie wymieniać <b>{form.business_name || "Twój biznes"}</b> po imieniu.</p>
        <div className="wait-meta">Numer w kolejce: <b>#{count || "—"}</b></div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="wait-form" data-testid="waitlist-form">
      <div className="wait-row">
        <label>
          <span>Imię i nazwisko</span>
          <input data-testid="wf-name" required value={form.name} onChange={set("name")} placeholder="Anna Kowalska" />
        </label>
        <label>
          <span>E-mail</span>
          <input data-testid="wf-email" required type="email" value={form.email} onChange={set("email")} placeholder="ty@firma.pl" />
        </label>
      </div>
      <div className="wait-row">
        <label>
          <span>Biznes</span>
          <input data-testid="wf-biz" value={form.business_name} onChange={set("business_name")} placeholder="Kawiarnia Lumière" />
        </label>
        <label>
          <span>Miasto</span>
          <input data-testid="wf-city" value={form.city} onChange={set("city")} placeholder="Katowice" />
        </label>
      </div>
      <label>
        <span>Jestem…</span>
        <div className="wait-roles">
          {[
            { k: "owner", l: "właścicielem biznesu" },
            { k: "investor", l: "inwestorem" },
            { k: "other", l: "kim innym" },
          ].map((r) => (
            <button
              type="button"
              key={r.k}
              data-testid={`wf-role-${r.k}`}
              className={`role-chip ${form.role === r.k ? "on" : ""}`}
              onClick={() => setForm({ ...form, role: r.k })}
            >
              {r.l}
            </button>
          ))}
        </div>
      </label>
      <label>
        <span>Krótka wiadomość (opcjonalnie)</span>
        <textarea data-testid="wf-message" rows={3} value={form.message} onChange={set("message")} placeholder="Czego oczekujesz od Tuoma?" />
      </label>
      <button type="submit" className="btn-cta wait-submit" disabled={state === "sending"} data-testid="wf-submit">
        {state === "sending" ? "Zapisujemy…" : "Dołącz do listy oczekujących"}
      </button>
      {count != null && <div className="wait-counter">Dołączyło już <b><Counter to={count} duration={1500} testid="wait-count" /></b> osób · zapraszamy w kolejności zgłoszeń</div>}
    </form>
  );
}

/* ============================== PAGE ============================== */
export default function Landing() {
  useEffect(() => {
    document.body.setAttribute("data-lp", "1");
    return () => document.body.removeAttribute("data-lp");
  }, []);

  return (
    <div className="lp" data-testid="landing-page">
      <header className="lp-nav">
        <Link to="/lp" className="lp-logo">tu<span>o</span>ma</Link>
        <nav className="lp-links">
          <a href="#pain" data-testid="nav-pain">Problem</a>
          <a href="#how" data-testid="nav-how">Jak działa</a>
          <a href="#product" data-testid="nav-product">Produkt</a>
          <a href="#investors" data-testid="nav-investors">Dla inwestorów</a>
          <Link to="/" className="lp-portal" data-testid="nav-portal">Zaloguj się →</Link>
        </nav>
      </header>

      {/* HERO */}
      <section className="lp-hero">
        <div className="hero-left">
          <span className="kicker">Tuoma · widoczność biznesu w epoce AI</span>
          <h1>
            Klient już nie googluje.<br/>
            <span className="hl">Pyta AI — i dostaje jedno imię.</span><br/>
            Twoje albo cudze.
          </h1>
          <p className="hero-sub">
            ChatGPT, Claude, Gemini i Perplexity codziennie polecają lokalne biznesy w odpowiedziach.
            6 na 6 małych firm sprawdziliśmy — żadna nie istnieje dla AI. Tuoma to zmienia.
          </p>
          <div className="hero-cta">
            <a href="#waitlist" className="btn-cta" data-testid="hero-cta">Umów 15-min demo</a>
            <a href="#audit" className="btn-ghost" data-testid="hero-audit">Zobacz darmowy audyt →</a>
          </div>
          <div className="hero-trust">
            <span className="dot-pulse"></span>
            Każda gwiazdka się liczy · <b>Made for EU SMB</b>
          </div>
        </div>

        <div className="hero-right" aria-hidden>
          <div className="phone-stack">
            {AGENTS.map((a, i) => (
              <div className="phone-card" key={a.name} style={{ "--c": a.color, "--i": i }}>
                <div className="phone-bar"><span className="phone-dot" style={{ background: a.color }}>{a.name[0]}</span>{a.name}</div>
                <div className="phone-msg me">poleć kawiarnię w Katowicach</div>
                <div className="phone-msg ai">
                  Polecam: <b>Cafe Bristol</b>, <b>Speciality Lab</b>, <b>Caffè Vergnano</b>.
                  <span className="not-mentioned">Kawiarnia Lumière — nie wymieniona</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <SocialProof />

      {/* PAIN */}
      <section id="pain" className="lp-section pain">
        <div className="sec-head">
          <span className="kicker red">Ślepy punkt #1 w 2026</span>
          <h2>20 lat walki o miejsce w Google.<br/>Dziś nikt nie patrzy na drugą stronę — bo nie ma żadnej strony.</h2>
        </div>
        <div className="pain-stats">
          <div className="pain-stat" data-testid="stat-6of6">
            <div className="ps-num"><Counter to={6} duration={1100} testid="counter-6" /> / 6</div>
            <div className="ps-lbl">małych biznesów testowanych przez nas — niewidocznych dla AI</div>
          </div>
          <div className="pain-stat">
            <div className="ps-num"><Counter to={1} duration={900} /></div>
            <div className="ps-lbl">odpowiedź AI · jeden polecony · zwycięzca bierze wszystko</div>
          </div>
          <div className="pain-stat">
            <div className="ps-num"><Counter to={95} duration={1300} suffix="%" /></div>
            <div className="ps-lbl">polskiego ruchu zaczyna w wyszukiwaniu — które właśnie pęka</div>
          </div>
        </div>
      </section>

      {/* AUDIT DEMO */}
      <section id="audit" className="lp-section audit-section">
        <div className="sec-head center">
          <span className="kicker">Zobacz to na własne oczy</span>
          <h2>Twój biznes oczami maszyny</h2>
          <p className="sec-sub">To nie jest „strona druga w Google”. To brak imienia w odpowiedzi, którą agent daje klientowi w 0,4 sekundy.</p>
        </div>
        <AuditDemo />
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="lp-section how">
        <div className="sec-head">
          <span className="kicker">Tuoma w 3 ruchach</span>
          <h2>Sprawiamy, że AI wymienia Twój biznes — i oddajemy Ci klienta, którego agent próbował zabrać.</h2>
        </div>
        <div className="how-grid">
          <div className="how-card" data-testid="how-1">
            <div className="how-num">01</div>
            <h3>Feed Prawdy dla AI</h3>
            <p>Neutralny kanał faktów o Twoim biznesie — godziny, oferta, atmosfera, dieta, pet-friendly. Tuoma przekazuje to bezpośrednio ChatGPT, Claude, Gemini i Perplexity.</p>
            <span className="how-tag">żaden agent nie staje między Tobą a klientem</span>
          </div>
          <div className="how-card" data-testid="how-2">
            <div className="how-num">02</div>
            <h3>Opinie, które robią różnicę</h3>
            <p>Zbieraj opinie bezpośrednio. Negatyw 2★ przechwytujemy zanim trafi publicznie — prywatna wiadomość do menedżera, szansa na recovery 2★→5★.</p>
            <span className="how-tag">62% recovery rate na boarded biznesach</span>
          </div>
          <div className="how-card" data-testid="how-3">
            <div className="how-num">03</div>
            <h3>Klient wraca do Ciebie</h3>
            <p>Każda interakcja — opinia, rezerwacja, skarga — buduje Twoją własną bazę kontaktów. Aktywo, którego nie odbierze Ci żaden Google ani agent AI.</p>
            <span className="how-tag">Twój moat · DMA + Data Act ready</span>
          </div>
        </div>
      </section>

      {/* PRODUCT PEEK */}
      <section id="product" className="lp-section product">
        <div className="sec-head">
          <span className="kicker">Portal w akcji</span>
          <h2>Codziennie widzisz, kto Cię polecił, kogo odzyskałeś, ile gwiazdek przybyło.</h2>
        </div>
        <div className="product-grid">
          <div className="prod-card big" data-testid="prod-mentions">
            <div className="prod-banner">
              <span className="pb-dot"></span>
              <div className="pb-num">8 <small>dziś polecili Cię</small></div>
              <div className="pb-pills">
                {AGENTS.map((a) => (
                  <span key={a.name} className="pb-pill" style={{ background: a.color }}>{a.name[0]}</span>
                ))}
              </div>
            </div>
            <div className="prod-quote">
              <span className="pq-tag">ChatGPT</span>
              <span>„Świetnym wyborem będzie Kawiarnia Lumière na Mariackiej — speciality coffee, śniadania do 14:00, dla rodzin i z psami.”</span>
            </div>
            <div className="prod-title">Wzmianki AI · live</div>
            <div className="prod-desc">Banner pulsuje, gdy AI wymienia Twój biznes. Otwierasz portal jak notowania giełdowe — emocjonalny lek na rozwój.</div>
          </div>

          <div className="prod-card" data-testid="prod-recovery">
            <div className="prod-mini">
              <div className="prod-lbl">Recovery</div>
              <div className="prod-big">62%</div>
              <div className="prod-sub">2★ → 5★ · +8 pkt m/m</div>
            </div>
            <div className="prod-title">Negatyw przechwycony</div>
            <div className="prod-desc">Skarga „rachunek pomylony” zostaje prywatna. Rachunek skorygowany. Klient wraca po 3 dniach. Publicznie — tylko 5 gwiazdek.</div>
          </div>

          <div className="prod-card" data-testid="prod-customers">
            <div className="prod-mini">
              <div className="prod-lbl">Twoja baza</div>
              <div className="prod-big">1 207</div>
              <div className="prod-sub">klientów · odzyskanych · stałych</div>
            </div>
            <div className="prod-title">Klient jest Twoim aktywem</div>
            <div className="prod-desc">Nie subskrypcją, którą się anuluje. Aktywem, które rośnie z każdym booking, każdą opinią, każdym przechwyceniem.</div>
          </div>
        </div>
        <div className="prod-cta">
          <Link to="/" className="btn-cta" data-testid="prod-portal">Wejdź do live demo portalu →</Link>
        </div>
      </section>

      {/* FOR INVESTORS */}
      <section id="investors" className="lp-section investors">
        <div className="sec-head">
          <span className="kicker gold">For investors · single slide</span>
          <h2>Wyszukiwanie umiera. Kto teraz zbuduje warstwę prawdy o lokalnym biznesie — zbuduje ją na zawsze.</h2>
        </div>
        <div className="inv-grid">
          <div className="inv-card" data-testid="inv-now">
            <h3>Dlaczego teraz</h3>
            <p>Przesunięcie z wyszukiwania na odpowiedź AI dzieje się w tej dekadzie — raz. Okno jest wąskie. Pierwszy gracz zabiera kategorię.</p>
          </div>
          <div className="inv-card eu" data-testid="inv-eu">
            <h3>Dlaczego Europa</h3>
            <p><b>Digital Markets Act</b> i <b>Data Act</b> mówią wprost: relacja biznes ↔ klient należy do niezależnej trzeciej strony, nie do gatekeepera. Regulacja, która zwykle przeszkadza — tu jest naszą ścianą nośną.</p>
            <span className="inv-badge">DMA · Data Act · GDPR-ready</span>
          </div>
          <div className="inv-card" data-testid="inv-pl">
            <h3>Dlaczego Polska</h3>
            <p>95% udziału Google, setki tysięcy SMB, rynek nikt jeszcze nie zajął pod tym kątem. Przyczółek, z którego mówimy „EU”.</p>
          </div>
          <div className="inv-card" data-testid="inv-moat">
            <h3>Dlaczego nie odejdą</h3>
            <p>Baza klientów rośnie z każdą interakcją. Nikt nie oddaje swoich klientów dobrowolnie. To nie subskrypcja — to aktywo.</p>
          </div>
        </div>
        <a href="#waitlist" className="btn-ghost inv-cta" data-testid="inv-cta">Umów rozmowę z założycielem →</a>
      </section>

      {/* WAITLIST */}
      <section id="waitlist" className="lp-section waitlist">
        <div className="wait-wrap">
          <div className="wait-left">
            <span className="kicker">Lista oczekujących · Q2 2026</span>
            <h2>Dołącz, zanim AI zacznie polecać Twoich konkurentów.</h2>
            <p>Otwieramy Tuoma stopniowo — po 100 biznesów na każdy region. Pierwsi dostają darmowy audyt, onboarding od założyciela i lock-in cenowy na rok.</p>
            <ul className="wait-bullets">
              <li>✓ Darmowy pełny audyt widoczności w 4 agentach AI</li>
              <li>✓ Setup Feed Prawdy w 24h od onboardingu</li>
              <li>✓ Bez zobowiązań · bez karty · bez SEO bullshit</li>
            </ul>
          </div>
          <div className="wait-right">
            <WaitlistForm />
          </div>
        </div>
      </section>

      <footer className="lp-foot">
        <div className="foot-l">
          <Link to="/lp" className="lp-logo small">tu<span>o</span>ma</Link>
          <span>· widoczność biznesu w epoce AI</span>
        </div>
        <div className="foot-r">
          <span>Made in Katowice · for EU</span>
          <span>·</span>
          <a href="#waitlist">Kontakt</a>
        </div>
      </footer>
    </div>
  );
}
