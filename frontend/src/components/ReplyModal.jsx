import React, { useState } from "react";
import axios from "axios";
import { API } from "../App";

export default function ReplyModal({ review, onClose, onSaved, mode = "reply" }) {
  const [text, setText] = useState(
    mode === "thank"
      ? "Dziękujemy serdecznie za miłe słowa — czekamy na Państwa ponownie!"
      : mode === "intercept"
      ? "Bardzo nam przykro za niedogodności. Chcielibyśmy to naprawić — proszę napisać prywatnie."
      : ""
  );
  const [saving, setSaving] = useState(false);

  const titles = {
    reply: "Odpowiedz publicznie",
    thank: "Podziękuj klientowi",
    intercept: "Przechwyć — prywatna wiadomość",
  };
  const descs = {
    reply: "Odpowiedź widoczna publicznie pod opinią.",
    thank: "Krótka publiczna podziękowanie buduje reputację.",
    intercept: "Wiadomość trafia bezpośrednio do klienta — opinia zostaje przechwycona, a klient odzyskany.",
  };

  const save = async () => {
    if (!text.trim()) return;
    setSaving(true);
    const payload =
      mode === "intercept"
        ? { manager_message: text, status: "resolved" }
        : { response: text, status: "resolved" };
    try {
      await axios.patch(`${API}/reviews/${review.id}`, payload);
      onSaved && (await onSaved());
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-back" data-testid="reply-modal" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{titles[mode]}</h3>
        <div className="desc">{descs[mode]}</div>
        <label>Wiadomość</label>
        <textarea
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          data-testid="reply-textarea"
        />
        <div className="actions-row">
          <button className="btn" onClick={onClose} data-testid="reply-cancel">Anuluj</button>
          <button className="btn primary" onClick={save} disabled={saving} data-testid="reply-save">
            {saving ? "Zapisywanie…" : "Wyślij"}
          </button>
        </div>
      </div>
    </div>
  );
}
