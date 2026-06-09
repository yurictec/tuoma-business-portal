import React, { useEffect, useState } from "react";
import axios from "axios";
import { API, SLUG } from "../App";

const CATS = [
  { key: "podstawowe", label: "Podstawowe" },
  { key: "oferta", label: "Oferta" },
  { key: "kontakt", label: "Kontakt" },
  { key: "specjalne", label: "Specjalne" },
];

const AGENTS_LABEL = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
  perplexity: "Perplexity",
};

function FactModal({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(initial || { key: "", label: "", value: "", category: "podstawowe" });
  const [saving, setSaving] = useState(false);
  const save = async () => {
    if (!form.label.trim() || !form.value.trim()) return;
    setSaving(true);
    try {
      if (initial?.id) {
        await axios.patch(`${API}/truth/${initial.id}`, form);
      } else {
        await axios.post(`${API}/business/${SLUG}/truth`, {
          ...form,
          key: form.key || form.label.toLowerCase().replace(/\s+/g, "_"),
        });
      }
      await onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-back" onClick={onClose} data-testid="fact-modal">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{initial?.id ? "Edytuj fakt" : "Dodaj fakt do Feed Prawdy"}</h3>
        <div className="desc">Te dane Tuoma przekazuje agentom AI (ChatGPT, Claude, Gemini, Perplexity) jako neutralne źródło prawdy o Twoim biznesie.</div>

        <label>Kategoria</label>
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} data-testid="fact-category">
          {CATS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
        </select>

        <label>Etykieta (np. „Godziny otwarcia”)</label>
        <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} data-testid="fact-label" />

        <label>Wartość</label>
        <textarea rows={3} value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} data-testid="fact-value" />

        <div className="actions-row">
          <button className="btn" onClick={onClose} data-testid="fact-cancel">Anuluj</button>
          <button className="btn primary" onClick={save} disabled={saving} data-testid="fact-save">
            {saving ? "Zapisywanie…" : initial?.id ? "Zapisz" : "Dodaj"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AIFeed() {
  const [facts, setFacts] = useState([]);
  const [visibility, setVisibility] = useState([]);
  const [cat, setCat] = useState("all");
  const [modal, setModal] = useState(null);

  const load = async () => {
    const [f, v] = await Promise.all([
      axios.get(`${API}/business/${SLUG}/truth`),
      axios.get(`${API}/business/${SLUG}/ai-visibility`),
    ]);
    setFacts(f.data);
    setVisibility(v.data);
  };
  useEffect(() => { load(); }, []);

  const filtered = cat === "all" ? facts : facts.filter((f) => f.category === cat);

  const del = async (id) => {
    if (!window.confirm("Usunąć ten fakt?")) return;
    await axios.delete(`${API}/truth/${id}`);
    await load();
  };

  return (
    <div data-testid="ai-feed-page">
      <div className="page-head">
        <div>
          <div className="page-title">Feed Prawdy · AI</div>
          <div className="page-sub">
            Neutralny kanał prawdy o Twoim biznesie. To dane, które ChatGPT, Claude, Gemini i Perplexity zobaczą, gdy ktoś zapyta o Ciebie.
            <br/>Tuoma jest trzecią niezależną stroną — agent AI nie staje między Tobą a klientem.
          </div>
        </div>
        <button className="btn primary" onClick={() => setModal({})} data-testid="btn-add-fact">
          <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
          Dodaj fakt
        </button>
      </div>

      {/* AI visibility cards */}
      <div className="ai-visibility" data-testid="ai-visibility">
        {visibility.map((v) => {
          const good = v.rate >= 50;
          return (
            <div className="card viz-card" key={v.agent} data-testid={`viz-${v.agent}`}>
              <div className="agent">{v.agent}</div>
              <div className={`rate ${good ? "good" : "bad"}`}>{v.rate}%</div>
              <div className="sub">{v.mentioned}/{v.total} zapytań · poleca Cię</div>
            </div>
          );
        })}
      </div>

      <div className="page-head" style={{ marginTop: 22 }}>
        <div className="tabs">
          <button data-testid="cat-all" className={cat === "all" ? "on" : ""} onClick={() => setCat("all")}>Wszystkie <span className="c">{facts.length}</span></button>
          {CATS.map((c) => (
            <button
              key={c.key}
              data-testid={`cat-${c.key}`}
              className={cat === c.key ? "on" : ""}
              onClick={() => setCat(c.key)}
            >
              {c.label} <span className="c">{facts.filter((f) => f.category === c.key).length}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="ai-grid" data-testid="facts-grid">
        {filtered.map((f) => (
          <section className="card fact-card" key={f.id} data-testid={`fact-${f.id}`}>
            <span className="verified-chip">
              <svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
              ZWERYFIKOWANO
            </span>
            <span className="cat-tag">{CATS.find((c) => c.key === f.category)?.label || f.category}</span>
            <div className="lab">{f.label}</div>
            <div className="val">{f.value}</div>
            <div className="agents">
              {f.visible_to.map((a) => (
                <span className="tag ok" key={a}>· {AGENTS_LABEL[a] || a}</span>
              ))}
            </div>
            <div className="row">
              <button className="act" onClick={() => setModal(f)} data-testid={`edit-fact-${f.id}`}>Edytuj</button>
              <button className="act" onClick={() => del(f.id)} data-testid={`del-fact-${f.id}`}>Usuń</button>
            </div>
          </section>
        ))}
      </div>

      {modal !== null && (
        <FactModal initial={modal} onClose={() => setModal(null)} onSaved={load} />
      )}
    </div>
  );
}
