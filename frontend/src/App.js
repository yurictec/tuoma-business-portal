import { useEffect, useState, useMemo } from "react";
import { BrowserRouter, Routes, Route, NavLink, useLocation } from "react-router-dom";
import axios from "axios";
import Pulpit from "./pages/Pulpit";
import Opinie from "./pages/Opinie";
import AIFeed from "./pages/AIFeed";
import Wzmianki from "./pages/Wzmianki";
import Klienci from "./pages/Klienci";
import Statystyki from "./pages/Statystyki";
import ZbierajOpinie from "./pages/ZbierajOpinie";
import Widzet from "./pages/Widzet";
import Ustawienia from "./pages/Ustawienia";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;
export const SLUG = "kawiarnia-lumiere";

const PALETTES = [
  { key: "petrol", label: "Petrol" },
  { key: "tide", label: "Tide" },
  { key: "clay", label: "Clay" },
  { key: "midnight", label: "Midnight" },
];

function PaletteSwitcher({ pal, setPal }) {
  return (
    <div className="controls" data-testid="palette-switcher">
      <div className="grp">
        {PALETTES.map((p) => (
          <button
            key={p.key}
            data-testid={`palette-${p.key}`}
            className={pal === p.key ? "on" : ""}
            onClick={() => setPal(p.key)}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function NavItem({ to, icon, label, badge, end, testid }) {
  return (
    <NavLink
      to={to}
      end={end}
      data-testid={testid}
      className={({ isActive }) => "item" + (isActive ? " active" : "")}
    >
      <svg viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: icon }} />
      <span>{label}</span>
      {badge ? <span className="badge">{badge}</span> : null}
    </NavLink>
  );
}

const ICONS = {
  home: '<path d="M3 12l9-8 9 8M5 10v10h5v-6h4v6h5V10"/>',
  reviews: '<path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  collect: '<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h3v3h-3zM20 14v6M17 20h3"/>',
  widget: '<path d="M3 5h18v4H3zM3 13h8v6H3zM15 13h6v6h-6z"/>',
  stats: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  mentions: '<circle cx="12" cy="12" r="9"/><path d="M8 12h.01M12 12h.01M16 12h.01"/>',
  ai: '<path d="M12 2v3M12 19v3M5 12H2M22 12h-3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/><circle cx="12" cy="12" r="5"/>',
  customers: '<circle cx="9" cy="8" r="4"/><path d="M3 21v-2a6 6 0 0 1 12 0v2M16 4a4 4 0 0 1 0 8M22 21v-2a6 6 0 0 0-3-5"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.6-2-3.4-2.4 1a7 7 0 0 0-1.7-1l-.4-2.5H10l-.4 2.5a7 7 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.6a7 7 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 1.7 1l.4 2.5h4l.4-2.5a7 7 0 0 0 1.7-1l2.4 1 2-3.4-2-1.6c.1-.3.1-.7.1-1z"/>',
};

function Sidebar({ counts }) {
  return (
    <nav className="side" data-testid="sidebar">
      <div className="brand">
        <span className="logo">tu<span className="o">o</span>ma</span>
      </div>
      <NavItem testid="nav-pulpit" to="/" end icon={ICONS.home} label="Pulpit" />
      <NavItem testid="nav-opinie" to="/opinie" icon={ICONS.reviews} label="Opinie" badge={counts.unreplied || null} />
      <NavItem testid="nav-wzmianki" to="/wzmianki" icon={ICONS.mentions} label="Wzmianki AI · live" />
      <NavItem testid="nav-ai" to="/ai-feed" icon={ICONS.ai} label="Feed Prawdy · AI" />
      <NavItem testid="nav-klienci" to="/klienci" icon={ICONS.customers} label="Klienci" />
      <NavItem testid="nav-zbieraj" to="/zbieraj" icon={ICONS.collect} label="Zbieraj opinie" />
      <NavItem testid="nav-widzet" to="/widzet" icon={ICONS.widget} label="Widżet WWW" />
      <NavItem testid="nav-stats" to="/statystyki" icon={ICONS.stats} label="Statystyki" />
      <div className="foot">
        <NavItem testid="nav-settings" to="/ustawienia" icon={ICONS.settings} label="Ustawienia" />
        <div className="acct" data-testid="user-menu">
          <span className="ava">Y</span>
          <div>
            <div className="nm">Yuri</div>
            <div className="rl">Właściciel</div>
          </div>
          <span className="cv">⌄</span>
        </div>
      </div>
    </nav>
  );
}

function Topbar({ biz }) {
  if (!biz) return null;
  return (
    <header className="topbar" data-testid="topbar">
      <div className="biz">
        <span className="avatar"><span className="ring"></span><b>{biz.avatar_letter}</b></span>
        <div>
          <div className="nm">{biz.name}</div>
          <div className="meta">{biz.city} <span>·</span> <span className="plan">{biz.plan}</span></div>
        </div>
      </div>
      <div className="tb-actions">
        <span className="sync"><span className="live"></span> Google · zsynchronizowano przed chwilą</span>
        <button className="btn" data-testid="btn-export">
          <svg viewBox="0 0 24 24"><path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"/></svg> Eksport
        </button>
        <button className="btn primary" data-testid="btn-qr">
          <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg> Link / QR do opinii
        </button>
      </div>
    </header>
  );
}

function Shell() {
  const [pal, setPal] = useState(() => localStorage.getItem("tuoma-pal") || "petrol");
  const [biz, setBiz] = useState(null);
  const [reviews, setReviews] = useState([]);
  const location = useLocation();

  useEffect(() => {
    document.body.setAttribute("data-pal", pal);
    localStorage.setItem("tuoma-pal", pal);
  }, [pal]);

  useEffect(() => {
    axios.get(`${API}/business/${SLUG}`).then((r) => setBiz(r.data)).catch(() => {});
    axios.get(`${API}/business/${SLUG}/reviews`).then((r) => setReviews(r.data)).catch(() => {});
  }, []);

  const refreshReviews = async () => {
    const r = await axios.get(`${API}/business/${SLUG}/reviews`);
    setReviews(r.data);
  };

  const counts = useMemo(() => {
    const unreplied = reviews.filter((r) => r.status === "new" || r.status === "in_progress").length;
    const negative = reviews.filter((r) => r.rating <= 2).length;
    return { unreplied, negative };
  }, [reviews]);

  const urlSlug = useMemo(() => {
    const map = {
      "/": "pulpit",
      "/opinie": "opinie",
      "/wzmianki": "wzmianki-ai",
      "/ai-feed": "feed-prawdy",
      "/klienci": "klienci",
      "/zbieraj": "zbieraj-opinie",
      "/widzet": "widzet",
      "/statystyki": "statystyki",
      "/ustawienia": "ustawienia",
    };
    return map[location.pathname] || "pulpit";
  }, [location.pathname]);

  return (
    <>
      <div className="ambient"></div>
      <div className="grain"></div>
      <PaletteSwitcher pal={pal} setPal={setPal} />

      <div className="frame">
        <div className="browser">
          <div className="bbar">
            <span className="bdots"><i></i><i></i><i></i></span>
            <span className="burl">app.tuoma.pl / <b>kawiarnia-lumiere</b> / {urlSlug}</span>
          </div>

          <div className="app">
            <Sidebar counts={counts} />
            <div className="content">
              <Topbar biz={biz} />
              <div className="workspace">
                <Routes>
                  <Route path="/" element={<Pulpit biz={biz} reviews={reviews} refreshReviews={refreshReviews} />} />
                  <Route path="/opinie" element={<Opinie reviews={reviews} refreshReviews={refreshReviews} counts={counts} />} />
                  <Route path="/wzmianki" element={<Wzmianki />} />
                  <Route path="/ai-feed" element={<AIFeed />} />
                  <Route path="/klienci" element={<Klienci />} />
                  <Route path="/zbieraj" element={<ZbierajOpinie />} />
                  <Route path="/widzet" element={<Widzet />} />
                  <Route path="/statystyki" element={<Statystyki />} />
                  <Route path="/ustawienia" element={<Ustawienia />} />
                </Routes>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}
