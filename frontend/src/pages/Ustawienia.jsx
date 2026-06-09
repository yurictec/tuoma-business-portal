import React from "react";

const ROWS = [
  { label: "Nazwa firmy", value: "Kawiarnia Lumière" },
  { label: "Slug w Tuoma", value: "kawiarnia-lumiere" },
  { label: "Miasto", value: "Katowice" },
  { label: "Plan", value: "Rozwój · 149 zł / mies." },
  { label: "Główny e-mail", value: "kontakt@lumiere.pl" },
  { label: "Webhook bookingu", value: "https://app.tuoma.pl/wh/lumiere/xyz123" },
];

export default function Ustawienia() {
  return (
    <div data-testid="ustawienia-page">
      <div className="page-head">
        <div>
          <div className="page-title">Ustawienia</div>
          <div className="page-sub">Podstawowe dane biznesu, integracje, plan.</div>
        </div>
      </div>
      <section className="card" style={{ padding: 6 }}>
        {ROWS.map((r) => (
          <div key={r.label} style={{
            display:"grid", gridTemplateColumns:"220px 1fr auto", gap:14, alignItems:"center",
            padding:"14px 18px", borderTop:"1px solid var(--line-2)"
          }}>
            <div className="micro">{r.label}</div>
            <div style={{ fontWeight:600, fontSize:".9rem" }}>{r.value}</div>
            <button className="act">Edytuj</button>
          </div>
        ))}
      </section>
    </div>
  );
}
