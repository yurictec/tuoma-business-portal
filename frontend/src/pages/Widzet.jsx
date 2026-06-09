import React, { useState } from "react";

export default function Widzet() {
  const [variant, setVariant] = useState("badge");
  const code = `<script src="https://cdn.tuoma.pl/w.js" data-biz="kawiarnia-lumiere" data-variant="${variant}"></script>`;
  return (
    <div data-testid="widzet-page">
      <div className="page-head">
        <div>
          <div className="page-title">Widżet WWW</div>
          <div className="page-sub">Pokaż swoją reputację na własnej stronie. Wklej jedną linijkę i gotowe.</div>
        </div>
        <div className="tabs">
          <button data-testid="var-badge" className={variant==="badge"?"on":""} onClick={()=>setVariant("badge")}>Odznaka</button>
          <button data-testid="var-carousel" className={variant==="carousel"?"on":""} onClick={()=>setVariant("carousel")}>Karuzela opinii</button>
          <button data-testid="var-popup" className={variant==="popup"?"on":""} onClick={()=>setVariant("popup")}>Popup zachęcający</button>
        </div>
      </div>
      <section className="card" style={{ padding:22 }}>
        <div className="micro">Kod do wklejenia</div>
        <pre style={{
          marginTop:12, padding:"14px 16px", borderRadius:12,
          background:"var(--surface-2)", border:"1px solid var(--line)",
          fontFamily:"'JetBrains Mono', Menlo, monospace", fontSize:".82rem",
          overflowX:"auto", color:"var(--ink)"
        }} data-testid="widget-code">{code}</pre>
        <div style={{display:"flex", gap:8, marginTop:14}}>
          <button className="btn primary" data-testid="copy-widget" onClick={()=>navigator.clipboard.writeText(code)}>Kopiuj kod</button>
          <button className="btn" data-testid="preview-widget">Podgląd na żywo</button>
        </div>
      </section>
    </div>
  );
}
