import React, { useEffect, useState } from "react";
import axios from "axios";
import { API, SLUG } from "../App";

export default function Statystyki() {
  const [m, setM] = useState(null);
  useEffect(() => { axios.get(`${API}/business/${SLUG}/metrics`).then((r) => setM(r.data)); }, []);
  if (!m) return <div style={{ padding: 40, color: "var(--muted)" }}>Ładowanie…</div>;
  return (
    <div data-testid="stats-page">
      <div className="page-head">
        <div>
          <div className="page-title">Statystyki</div>
          <div className="page-sub">Reputacja, tempo reakcji, odzyskane negatywy — w jednym miejscu.</div>
        </div>
      </div>
      <div className="stats-grid">
        <div className="card stat-big"><div className="micro">Nowe opinie · 30 dni</div><div className="v">{m.new_30d} <small className="up" style={{fontSize:".6em", color:"var(--ok)"}}>▲ {m.new_30d_change}%</small></div></div>
        <div className="card stat-big"><div className="micro">Recovery rate</div><div className="v">{m.recovery_rate}% <small style={{fontSize:".55em", color:"var(--ok)"}}>+{m.recovery_change} pkt</small></div></div>
        <div className="card stat-big"><div className="micro">Reakcja</div><div className="v">{m.response_rate}%</div><div style={{color:"var(--muted)", fontSize:".82rem", marginTop:6}}>śr. czas: {m.response_avg}</div></div>
        <div className="card stat-big"><div className="micro">Przechwycone</div><div className="v">{m.intercepted_total}</div><div style={{color:"var(--alert)", fontSize:".82rem", marginTop:6}}>{m.intercepted_critical} krytyczne</div></div>
      </div>
    </div>
  );
}
