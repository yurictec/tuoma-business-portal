import React from "react";

/**
 * Stylised local-business "logos" — each is a unique typographic mark.
 * No external SVG / images, fully CSS — keeps the page light and crisp.
 */
const ITEMS = [
  { name: "Lumière",      kind: "Kawiarnia",     city: "Katowice",  font: "Fredoka",          weight: 600, accent: "#c25e34", shape: "circle" },
  { name: "Bunkier",      kind: "Steak bar",     city: "Kraków",    font: "Schibsted Grotesk",weight: 800, accent: "#0a1816", shape: "square" },
  { name: "Kosmiczna 8",  kind: "Pizzeria",      city: "Warszawa",  font: "Hanken Grotesk",   weight: 800, accent: "#e8b94c", shape: "dot" },
  { name: "Salon Klara",  kind: "Fryzjer",       city: "Wrocław",   font: "Fredoka",          weight: 500, accent: "#c98aa6", shape: "wave" },
  { name: "Pan Łukasz",   kind: "Stomatolog",    city: "Gdańsk",    font: "Schibsted Grotesk",weight: 700, accent: "#1296c4", shape: "cross" },
  { name: "Górski Młyn",  kind: "Piekarnia",     city: "Zakopane",  font: "Hanken Grotesk",   weight: 700, accent: "#8b6f3e", shape: "triangle" },
  { name: "Studio Aria",  kind: "Joga",          city: "Poznań",    font: "Fredoka",          weight: 500, accent: "#7e9d6a", shape: "ring" },
  { name: "Kuźnia 47",    kind: "Tatuaż",        city: "Łódź",      font: "Schibsted Grotesk",weight: 800, accent: "#e6e6e6", shape: "square" },
];

function Shape({ shape, accent }) {
  if (shape === "circle") return <span className="sp-shape" style={{ background: accent, borderRadius: "50%" }} />;
  if (shape === "square") return <span className="sp-shape" style={{ background: accent, borderRadius: 4 }} />;
  if (shape === "dot") return <span className="sp-shape sp-dot" style={{ background: accent }} />;
  if (shape === "ring") return <span className="sp-shape" style={{ border: `2px solid ${accent}`, borderRadius: "50%" }} />;
  if (shape === "cross") return (
    <span className="sp-shape sp-cross">
      <span style={{ background: accent }} />
      <span style={{ background: accent }} />
    </span>
  );
  if (shape === "wave") return (
    <svg className="sp-shape" viewBox="0 0 16 16">
      <path d="M0 8 Q 4 2 8 8 T 16 8" stroke={accent} strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </svg>
  );
  if (shape === "triangle") return (
    <svg className="sp-shape" viewBox="0 0 16 16">
      <polygon points="8,1.5 15,14 1,14" fill={accent} />
    </svg>
  );
  return null;
}

export default function SocialProof() {
  return (
    <section className="lp-social" data-testid="social-proof">
      <div className="sp-head">
        <span className="sp-pulse"></span>
        <span>Już z nami · pierwsza fala SMB w Polsce</span>
      </div>
      <div className="sp-marquee">
        <div className="sp-track">
          {[...ITEMS, ...ITEMS].map((it, i) => (
            <div className="sp-logo" key={i} data-testid={`logo-${i % ITEMS.length}`}>
              <Shape shape={it.shape} accent={it.accent} />
              <div className="sp-text">
                <div className="sp-name" style={{ fontFamily: it.font, fontWeight: it.weight }}>{it.name}</div>
                <div className="sp-meta">{it.kind} · {it.city}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
