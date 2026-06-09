import React, { useEffect, useState } from "react";
import axios from "axios";
import { API, SLUG } from "../App";

const STATUS_LABELS = {
  odzyskany: "Odzyskany",
  w_kontakcie: "W kontakcie",
  nowy: "Nowy",
};

const ChannelIcon = ({ ch }) => {
  if (ch === "whatsapp")
    return <><svg viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-7.6-4.7L3 21l1.7-2.9A8.5 8.5 0 1 1 21 11.5z"/></svg>WhatsApp</>;
  if (ch === "email")
    return <><svg viewBox="0 0 24 24"><path d="M3 7l9 6 9-6M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7M3 7l9-4 9 4"/></svg>E-mail</>;
  return <><svg viewBox="0 0 24 24"><path d="M22 16.92V21a1 1 0 0 1-1.1 1A19 19 0 0 1 2 4.1 1 1 0 0 1 3 3h4a1 1 0 0 1 1 .75c.13.97.36 1.92.69 2.81a1 1 0 0 1-.23 1.05L7 9a16 16 0 0 0 8 8l1.4-1.4a1 1 0 0 1 1.05-.23c.89.33 1.84.56 2.81.69A1 1 0 0 1 22 17z"/></svg>SMS</>;
};

export default function Klienci() {
  const [customers, setCustomers] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    axios.get(`${API}/business/${SLUG}/customers`).then((r) => setCustomers(r.data));
  }, []);

  const filtered = filter === "all" ? customers : customers.filter((c) => c.status === filter);

  const counts = {
    odzyskany: customers.filter((c) => c.status === "odzyskany").length,
    w_kontakcie: customers.filter((c) => c.status === "w_kontakcie").length,
    nowy: customers.filter((c) => c.status === "nowy").length,
  };

  return (
    <div data-testid="klienci-page">
      <div className="page-head">
        <div>
          <div className="page-title">Klienci</div>
          <div className="page-sub">
            Twoja własna baza klientów — odzyskanych z opinii, ze skarg, z bookingu Tuoma.
            <br/>To Twoje aktywo. Agent AI nie może go zabrać.
          </div>
        </div>
        <div className="tabs">
          <button data-testid="kl-all" className={filter === "all" ? "on" : ""} onClick={() => setFilter("all")}>Wszyscy <span className="c">{customers.length}</span></button>
          <button data-testid="kl-odzyskany" className={filter === "odzyskany" ? "on" : ""} onClick={() => setFilter("odzyskany")}>Odzyskani <span className="c">{counts.odzyskany}</span></button>
          <button data-testid="kl-w_kontakcie" className={filter === "w_kontakcie" ? "on" : ""} onClick={() => setFilter("w_kontakcie")}>W kontakcie <span className="c">{counts.w_kontakcie}</span></button>
          <button data-testid="kl-nowy" className={filter === "nowy" ? "on" : ""} onClick={() => setFilter("nowy")}>Nowi <span className="c">{counts.nowy}</span></button>
        </div>
      </div>

      <section className="card cust-table" data-testid="customers-table">
        <div className="cust-row head">
          <div>Klient</div>
          <div>Notatka</div>
          <div>Kanał</div>
          <div>Ostatni kontakt</div>
          <div>Status</div>
        </div>
        {filtered.map((c) => (
          <div className="cust-row" key={c.id} data-testid={`customer-${c.id}`}>
            <div className="who">
              <span className="av">{c.initial}</span>
              <div>
                <div className="nm">{c.name}</div>
                <div className="note" style={{maxWidth:160}}>{c.contact}</div>
              </div>
            </div>
            <div className="note" title={c.notes}>{c.notes} · {c.visits} wizyt</div>
            <div className="channel"><ChannelIcon ch={c.channel} /></div>
            <div style={{color:"var(--muted)", fontSize:".82rem"}}>{c.last_interaction}</div>
            <div><span className={`status-chip ${c.status}`}>{STATUS_LABELS[c.status]}</span></div>
          </div>
        ))}
      </section>
    </div>
  );
}
