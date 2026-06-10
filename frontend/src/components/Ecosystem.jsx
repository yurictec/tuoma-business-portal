import React from "react";
import { Link } from "react-router-dom";

/**
 * Ecosystem diagram: central "Tuoma core" + 4 surrounding layers
 * with animated connector lines and moving data tokens.
 *
 * Layers:
 *   1. Admin Tuoma            — top
 *   2. Portal biznesu         — right
 *   3. Publiczna strona       — bottom
 *   4. Link do opinii         — left
 *
 * Pure SVG, no external libs. Lines have <animate> traveling dots.
 */

const NODES = [
  {
    key: "admin",
    title: "Admin Tuoma",
    role: "Nadzór i moderacja",
    desc: "Trzecia niezależna strona. Weryfikuje fakty, łączy źródła opinii, zasila Feed Prawdy.",
    chip: "/trust",
    color: "#f5a623",
    angle: -90,
    href: "/trust",
    testid: "node-admin",
  },
  {
    key: "portal",
    title: "Portal biznesu",
    role: "Narzędzie właściciela",
    desc: "Opinie, Wzmianki AI, Feed Prawdy, baza klientów. Wszystko w jednym pulpicie.",
    chip: "/",
    color: "#20c9b9",
    angle: 0,           // right
    href: "/",
    testid: "node-portal",
  },
  {
    key: "public",
    title: "Publiczna strona",
    role: "Cyfrowy ślad biznesu",
    desc: "To, co widzi świat i AI. Generowana z Feed Prawdy. Zawsze aktualna.",
    chip: "/p/:slug",
    color: "#5be8d8",
    angle: 90,          // bottom
    href: "/p/kawiarnia-lumiere",
    testid: "node-public",
  },
  {
    key: "review",
    title: "Link / QR do opinii",
    role: "Wejście dla klienta",
    desc: "Jeden link, wszystkie serwisy. Smart-routing: 5★ → Google, ≤3★ → przechwytujemy.",
    chip: "/r/:slug",
    color: "#c98aa6",
    angle: 180,         // left
    href: "/r/kawiarnia-lumiere",
    testid: "node-review",
  },
];

const SIZE = 520;     // viewBox base
const CX = SIZE / 2;
const CY = SIZE / 2;
const RADIUS = 168;   // distance from center to nodes

function polar(angleDeg, r = RADIUS) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CX + Math.cos(rad) * r, y: CY + Math.sin(rad) * r };
}

export default function Ecosystem() {
  return (
    <div className="eco-wrap" data-testid="ecosystem">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="eco-svg"
        aria-hidden
      >
        <defs>
          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#5be8d8" stopOpacity=".55" />
            <stop offset="60%" stopColor="#20c9b9" stopOpacity=".18" />
            <stop offset="100%" stopColor="#20c9b9" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#20c9b9" stopOpacity=".15" />
            <stop offset="50%" stopColor="#5be8d8" stopOpacity=".55" />
            <stop offset="100%" stopColor="#20c9b9" stopOpacity=".15" />
          </linearGradient>
          <filter id="softBlur"><feGaussianBlur stdDeviation="3" /></filter>
        </defs>

        {/* Outer orbits */}
        <circle cx={CX} cy={CY} r={RADIUS + 18} fill="none" stroke="rgba(91,232,216,.10)" strokeDasharray="2 6" />
        <circle cx={CX} cy={CY} r={RADIUS - 24} fill="none" stroke="rgba(91,232,216,.07)" strokeDasharray="1 6" />

        {/* Core glow */}
        <circle cx={CX} cy={CY} r={110} fill="url(#coreGlow)" filter="url(#softBlur)" />

        {/* Connecting lines + traveling tokens */}
        {NODES.map((n, i) => {
          const p = polar(n.angle);
          return (
            <g key={n.key}>
              <line
                x1={CX} y1={CY} x2={p.x} y2={p.y}
                stroke="url(#lineGrad)" strokeWidth="1.6"
              />
              {/* outbound token */}
              <circle r="3.4" fill="#5be8d8" opacity=".9">
                <animateMotion
                  dur={`${3.6 + i * 0.4}s`}
                  repeatCount="indefinite"
                  begin={`${i * 0.6}s`}
                  path={`M${CX},${CY} L${p.x},${p.y}`}
                />
                <animate attributeName="opacity" values="0;1;1;0" dur={`${3.6 + i * 0.4}s`} repeatCount="indefinite" begin={`${i * 0.6}s`} />
              </circle>
              {/* inbound token */}
              <circle r="2.4" fill={n.color} opacity=".75">
                <animateMotion
                  dur={`${3.6 + i * 0.4}s`}
                  repeatCount="indefinite"
                  begin={`${i * 0.6 + 1.4}s`}
                  path={`M${p.x},${p.y} L${CX},${CY}`}
                />
                <animate attributeName="opacity" values="0;1;1;0" dur={`${3.6 + i * 0.4}s`} repeatCount="indefinite" begin={`${i * 0.6 + 1.4}s`} />
              </circle>
            </g>
          );
        })}

        {/* Central Tuoma core */}
        <circle cx={CX} cy={CY} r="46" fill="rgba(91,232,216,.10)" stroke="rgba(91,232,216,.45)" strokeWidth="1.4" />
        <circle cx={CX} cy={CY} r="32" fill="rgba(91,232,216,.18)" stroke="rgba(91,232,216,.65)" strokeWidth="1.2" />
        <text x={CX} y={CY - 2} textAnchor="middle" fill="#eafaf6" style={{ font: "700 18px 'Fredoka'" }}>
          tu<tspan fill="#5be8d8">o</tspan>ma
        </text>
        <text x={CX} y={CY + 16} textAnchor="middle" fill="#7d9a94" style={{ font: "600 8.5px 'Hanken Grotesk'", letterSpacing: "1.4px" }}>
          NEUTRAL LAYER
        </text>
      </svg>

      {/* HTML node cards positioned absolutely over SVG */}
      {NODES.map((n) => {
        const p = polar(n.angle);
        const xPct = (p.x / SIZE) * 100;
        const yPct = (p.y / SIZE) * 100;
        // Use transform to anchor node card by its center
        const Wrapper = n.href ? Link : "div";
        const props = n.href ? { to: n.href, target: n.href.startsWith("/") ? "_blank" : undefined, rel: "noreferrer" } : {};
        return (
          <Wrapper
            key={n.key}
            data-testid={n.testid}
            className={`eco-node eco-node-${n.key} ${n.href ? "linked" : "internal"}`}
            style={{ left: `${xPct}%`, top: `${yPct}%`, "--c": n.color }}
            {...props}
          >
            <div className="eco-node-chip" style={{ borderColor: n.color, color: n.color }}>{n.chip}</div>
            <div className="eco-node-title">{n.title}</div>
            <div className="eco-node-role">{n.role}</div>
            <div className="eco-node-desc">{n.desc}</div>
            {n.href && <div className="eco-node-go">Otwórz →</div>}
          </Wrapper>
        );
      })}
    </div>
  );
}
