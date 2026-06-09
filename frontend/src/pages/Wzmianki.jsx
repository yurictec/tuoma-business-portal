import React, { useEffect, useState } from "react";
import axios from "axios";
import { API, SLUG } from "../App";

const AGENT_COLORS = {
  ChatGPT: "#10a37f",
  Claude: "#cc785c",
  Gemini: "#4285f4",
  Perplexity: "#22b8cf",
};

function AgentDot({ agent }) {
  return <span className="agent-dot" style={{ background: AGENT_COLORS[agent] || "var(--accent)" }}>{agent[0]}</span>;
}

export default function Wzmianki() {
  const [data, setData] = useState(null);
  const [agent, setAgent] = useState("all");

  useEffect(() => {
    axios.get(`${API}/business/${SLUG}/ai-mentions`).then((r) => setData(r.data));
  }, []);

  if (!data) return <div style={{ padding: 40, color: "var(--muted)" }}>Ładowanie…</div>;

  const filtered = agent === "all" ? data.mentions : data.mentions.filter((m) => m.agent === agent);
  const agents = [...new Set(data.mentions.map((m) => m.agent))];

  return (
    <div data-testid="wzmianki-page">
      <div className="page-head">
        <div>
          <div className="page-title">Wzmianki AI · live</div>
          <div className="page-sub">
            Każde takie zdanie to klient, który właśnie usłyszał o Tobie — bez płacenia za reklamę, bez SEO, bez „blue links”.
            <br/>To Twoja widoczność w nowej rzeczywistości.
          </div>
        </div>
      </div>

      {/* Hero counter */}
      <section className="card mentions-hero" data-testid="mentions-hero">
        <div className="mh-left">
          <div className="micro">Dziś zostałeś polecony</div>
          <div className="mh-big">{data.today_count} <small>razy</small></div>
          <div className="mh-sub">w odpowiedziach AI · {agents.length} agentów</div>
        </div>
        <div className="mh-right">
          {data.by_agent_today.map((a) => (
            <div className="mh-agent" key={a.agent} data-testid={`agent-${a.agent}`}>
              <AgentDot agent={a.agent} />
              <div>
                <div className="mh-an">{a.agent}</div>
                <div className="mh-ac">{a.count}× dziś</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="page-head" style={{ marginTop: 22 }}>
        <div className="tabs">
          <button data-testid="m-all" className={agent === "all" ? "on" : ""} onClick={() => setAgent("all")}>Wszystkie <span className="c">{data.mentions.length}</span></button>
          {agents.map((a) => (
            <button key={a} data-testid={`m-${a}`} className={agent === a ? "on" : ""} onClick={() => setAgent(a)}>
              {a} <span className="c">{data.mentions.filter((m) => m.agent === a).length}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mentions-feed" data-testid="mentions-feed">
        {filtered.map((m) => (
          <section className="card mention-card" key={m.id} data-testid={`mention-${m.id}`}>
            <div className="m-head">
              <AgentDot agent={m.agent} />
              <div className="m-meta">
                <div className="m-agent">{m.agent} <span className="m-when">· {m.when}</span></div>
                <div className="m-query">„{m.query}” — z {m.viewer_city}</div>
              </div>
            </div>
            <div className="m-snippet">{m.snippet}</div>
          </section>
        ))}
      </div>
    </div>
  );
}
