import React from "react";

export default function ZbierajOpinie() {
  const url = "https://app.tuoma.pl/r/kawiarnia-lumiere";
  return (
    <div data-testid="zbieraj-page">
      <div className="page-head">
        <div>
          <div className="page-title">Zbieraj opinie</div>
          <div className="page-sub">Udostępnij link lub kod QR — zbieraj opinie bezpośrednio do Tuoma. Bez pośredników, bez kradzieży kontaktu klienta.</div>
        </div>
      </div>
      <section className="card qr-box">
        <div className="qr-img">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" fill="#fff"/>
            {Array.from({length:11}).map((_,r)=>
              Array.from({length:11}).map((_,c)=>{
                const filled = ((r*c + r + c) % 3 === 0) || (r<3 && c<3) || (r>7 && c<3) || (r<3 && c>7);
                return filled ? <rect key={r+"-"+c} x={c*9} y={r*9} width="8" height="8" fill="#10302d"/> : null;
              })
            )}
          </svg>
        </div>
        <div style={{flex:1, minWidth:240}}>
          <div className="micro">Link bezpośredni</div>
          <div style={{ fontFamily:"'Schibsted Grotesk'", fontWeight:700, fontSize:"1.1rem", marginTop:8 }}>{url}</div>
          <div style={{ color:"var(--muted)", fontSize:".85rem", marginTop:8 }}>Wydrukuj QR na rachunku, postaw na ladzie albo wyślij SMS-em po wizycie.</div>
          <div style={{ display:"flex", gap:8, marginTop:14, flexWrap:"wrap" }}>
            <button className="btn primary" data-testid="btn-copy-link" onClick={() => navigator.clipboard.writeText(url)}>Kopiuj link</button>
            <button className="btn" data-testid="btn-download-qr">Pobierz QR (PNG)</button>
            <button className="btn" data-testid="btn-print-card">Drukuj wizytówkę</button>
          </div>
        </div>
      </section>
    </div>
  );
}
