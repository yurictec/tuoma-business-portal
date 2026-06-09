import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { API, SLUG } from "../App";

const AGENT_COLORS = {
  ChatGPT: "#10a37f",
  Claude: "#cc785c",
  Gemini: "#4285f4",
  Perplexity: "#22b8cf",
};

export default function LiveMentionsBanner() {
  const [data, setData] = useState(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    axios.get(`${API}/business/${SLUG}/ai-mentions`).then((r) => setData(r.data));
  }, []);

  useEffect(() => {
    if (!data || data.mentions.length === 0) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % Math.min(data.mentions.length, 6)), 4200);
    return () => clearInterval(t);
  }, [data]);

  if (!data || data.today_count === 0) return null;

  const current = data.mentions[idx];
  return (
    <Link to="/wzmianki" className="live-banner" data-testid="live-banner">
      <div className="lb-left">
        <span className="lb-dot"></span>
        <div className="lb-counter">
          <div className="lb-num">{data.today_count}</div>
          <div className="lb-lbl">dziś polecili Cię</div>
        </div>
        <div className="lb-agents">
          {data.by_agent_today.slice(0, 4).map((a) => (
            <span key={a.agent} className="lb-pill" style={{ background: AGENT_COLORS[a.agent] || "var(--accent)" }}>
              {a.agent[0]}<small>{a.count}</small>
            </span>
          ))}
        </div>
      </div>
      <div className="lb-ticker" key={current?.id}>
        <span className="lb-tag">{current?.agent}</span>
        <span className="lb-text">„{current?.snippet}”</span>
      </div>
      <span className="lb-cta">Zobacz wszystkie →</span>
    </Link>
  );
}
