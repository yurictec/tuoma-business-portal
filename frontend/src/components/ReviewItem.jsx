import React from "react";
import { Stars, SourceBadge, StatusPill } from "./Atoms";

export default function ReviewItem({ rev, onReply, onThank, onIntercept }) {
  const unreplied = rev.status === "new" || rev.status === "in_progress";
  return (
    <div className={`rev${unreplied ? " unreplied" : ""}`} data-testid={`review-${rev.id}`}>
      <span className="av">{rev.initial}</span>
      <div className="body">
        <div className="top">
          <span className="who">{rev.author}</span>
          <Stars rating={rev.rating} />
          <span className="when">{rev.when}</span>
          <SourceBadge source={rev.source} intercepted={rev.intercepted} />
        </div>
        <div className="txt">{rev.text}</div>

        {rev.manager_message && (
          <div className="mgr">
            <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            <div>
              <div className="lab">Prywatna wiadomość do menedżera</div>
              <div className="m">„{rev.manager_message}”</div>
            </div>
          </div>
        )}

        {rev.response && !rev.manager_message && (
          <div className="mgr">
            <svg viewBox="0 0 24 24"><path d="M3 7l9 6 9-6M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7" /></svg>
            <div>
              <div className="lab">Twoja odpowiedź</div>
              <div className="m">„{rev.response}”</div>
            </div>
          </div>
        )}

        <div className="actions">
          <StatusPill status={rev.status} />
          {rev.rating >= 4 && rev.status === "new" && (
            <button className="act solid" data-testid={`btn-thank-${rev.id}`} onClick={() => onThank(rev)}>
              <svg viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-7.6-4.7L3 21l1.7-2.9A8.5 8.5 0 1 1 21 11.5z" /></svg>
              Podziękuj
            </button>
          )}
          {rev.rating <= 3 && unreplied && (
            <>
              <button className="act solid" data-testid={`btn-reply-${rev.id}`} onClick={() => onReply(rev)}>
                <svg viewBox="0 0 24 24"><path d="M3 7l9 6 9-6M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7M3 7l9-4 9 4" /></svg>
                Odpowiedz
              </button>
              {rev.source === "google" && (
                <button className="act go" data-testid={`btn-google-help-${rev.id}`}>
                  <svg viewBox="0 0 24 24"><path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></svg>
                  Pomoc: skarga do Google
                </button>
              )}
              {rev.source === "tuoma" && (
                <button className="act" data-testid={`btn-intercept-${rev.id}`} onClick={() => onIntercept(rev)}>
                  <svg viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-7.6-4.7L3 21l1.7-2.9A8.5 8.5 0 1 1 21 11.5z" /></svg>
                  Przechwyć
                </button>
              )}
            </>
          )}
          {rev.intercepted && rev.status === "resolved" && (
            <>
              <button className="act" data-testid={`btn-whatsapp-${rev.id}`}>
                <svg viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-7.6-4.7L3 21l1.7-2.9A8.5 8.5 0 1 1 21 11.5z" /></svg>
                WhatsApp
              </button>
              <button className="act"><svg viewBox="0 0 24 24"><path d="M3 7l9 6 9-6M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7" /></svg>Poproś o aktualizację</button>
            </>
          )}
          {rev.response && !rev.manager_message && rev.status === "resolved" && (
            <button className="act" data-testid={`btn-answered-${rev.id}`}>
              <svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>
              Odpowiedziano
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
