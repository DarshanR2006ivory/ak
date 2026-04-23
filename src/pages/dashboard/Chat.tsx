import { FormEvent, useEffect, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

// Renders AI response as structured points
const renderContent = (text: string) => {
  const lines = text.split("\n").filter((l) => l.trim() !== "");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        // Numbered list: "1. ..."
        const numbered = trimmed.match(/^(\d+)\.\s+(.+)/);
        // Bullet: "- ..." or "* ..."
        const bullet = trimmed.match(/^[-*•]\s+(.+)/);
        // Bold: **text**
        const formatBold = (str: string) => {
          const parts = str.split(/\*\*(.+?)\*\*/g);
          return parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p);
        };

        if (numbered) {
          return (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span style={{ minWidth: 20, fontWeight: 700, color: "#16a34a" }}>{numbered[1]}.</span>
              <span>{formatBold(numbered[2])}</span>
            </div>
          );
        }
        if (bullet) {
          return (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span style={{ minWidth: 16, color: "#16a34a", fontWeight: 700, marginTop: 1 }}>•</span>
              <span>{formatBold(bullet[1])}</span>
            </div>
          );
        }
        // Heading: "## ..."
        if (trimmed.startsWith("## ")) {
          return <div key={i} style={{ fontWeight: 700, fontSize: 15, marginTop: 4 }}>{formatBold(trimmed.slice(3))}</div>;
        }
        if (trimmed.startsWith("# ")) {
          return <div key={i} style={{ fontWeight: 700, fontSize: 16, marginTop: 4 }}>{formatBold(trimmed.slice(2))}</div>;
        }
        return <div key={i}>{formatBold(trimmed)}</div>;
      })}
    </div>
  );
};

const suggestions = [
  "How to treat yellow leaves on wheat?",
  "What is PM-KISAN scheme?",
  "Today's tomato price in mandi?",
  "Jobs for 10th pass near me",
  "How to apply for Ayushman Bharat?",
  "Best crops for monsoon season",
];

const Chat = () => {
  const { t, lang } = useI18n();
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Namaste! 🙏 I'm your rural assistant. Ask me about farming, schemes, weather, jobs — anything." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (e: FormEvent | null, overrideText?: string) => {
    if (e) e.preventDefault();
    const text = (overrideText ?? input).trim();
    if (!text || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/rural-chat`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: next, lang }),
      });

      if (resp.status === 429) { toast.error("Too many requests, slow down."); setBusy(false); return; }
      if (resp.status === 402) { toast.error("AI credits exhausted."); setBusy(false); return; }
      if (!resp.ok || !resp.body) { toast.error("Chat failed"); setBusy(false); return; }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let acc = "";
      setMessages((m) => [...m, { role: "assistant", content: "" }]);

      let done = false;
      while (!done) {
        const { value, done: d } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const c = JSON.parse(json).choices?.[0]?.delta?.content;
            if (c) {
              acc += c;
              setMessages((m) => m.map((msg, i) => (i === m.length - 1 ? { ...msg, content: acc } : msg)));
            }
          } catch { buf = line + "\n" + buf; break; }
        }
      }
    } catch {
      toast.error("Network error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <style>{`
        .chat-layout {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 20px;
          height: calc(100vh - 180px);
        }
        .chat-panel {
          display: flex;
          flex-direction: column;
          background: var(--surface, #fff);
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 12px;
          overflow: hidden;
        }
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .msg { display: flex; gap: 10px; }
        .msg.user { flex-direction: row-reverse; }
        .msg-bubble {
          max-width: 70%;
          padding: 12px 16px;
          border-radius: 14px;
          font-size: 14px;
          line-height: 1.6;
        }
        .msg.bot .msg-bubble {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 4px 14px 14px 14px;
          color: #111827;
        }
        .msg.user .msg-bubble {
          background: #16a34a;
          color: #fff;
          border-radius: 14px 4px 14px 14px;
        }
        .msg-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 600;
        }
        .bot-avatar { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
        .user-av { background: #f0fdfa; color: #0d9488; }
        .chat-input-row {
          padding: 14px 16px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 10px;
        }
        .chat-input {
          flex: 1;
          height: 44px;
          border: 1.5px solid #e5e7eb;
          border-radius: 8px;
          padding: 0 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          outline: none;
          color: #111827;
          background: #fff;
        }
        .chat-input:focus { border-color: #16a34a; }
        .send-btn {
          width: 44px;
          height: 44px;
          border-radius: 8px;
          background: #16a34a;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          flex-shrink: 0;
        }
        .send-btn:hover { background: #14532d; }
        .send-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .chat-sidebar-panel {
          display: flex;
          flex-direction: column;
          gap: 14px;
          overflow-y: auto;
        }
        .chat-suggestions {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 16px;
        }
        .chat-suggestions h4 {
          font-size: 13px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 10px;
        }
        .suggestion-btn {
          display: block;
          width: 100%;
          text-align: left;
          padding: 8px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #fff;
          cursor: pointer;
          font-size: 13px;
          color: #111827;
          font-family: 'DM Sans', sans-serif;
          margin-bottom: 6px;
          transition: all 0.15s;
        }
        .suggestion-btn:hover { border-color: #16a34a; color: #14532d; background: #f0fdf4; }
        .typing-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #6b7280;
          margin: 0 2px;
          animation: blink 1.2s infinite;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes blink {
          0%, 80%, 100% { opacity: 0; }
          40% { opacity: 1; }
        }
        @media (max-width: 768px) {
          .chat-layout { grid-template-columns: 1fr; }
          .chat-sidebar-panel { display: none; }
        }
      `}</style>

      <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#16a34a,#0d9488)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Sparkles size={20} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontWeight: 700, fontSize: 22, margin: 0 }}>{t("aiChat")}</h1>
          <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>Powered by AI · Speaks your language</p>
        </div>
      </div>

      <div className="chat-layout">
        {/* Chat panel */}
        <div className="chat-panel">
          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.role === "user" ? "user" : "bot"}`}>
                <div className={`msg-avatar ${m.role === "user" ? "user-av" : "bot-avatar"}`}>
                  {m.role === "user" ? "U" : "🌾"}
                </div>
                <div className="msg-bubble">
                  {m.content === "" && m.role === "assistant" ? (
                    <span>
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                    </span>
                  ) : m.role === "assistant" ? renderContent(m.content) : m.content}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <form className="chat-input-row" onSubmit={(e) => send(e)}>
            <input
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(null); } }}
              placeholder={t("askAnything")}
              maxLength={2000}
            />
            <button type="submit" className="send-btn" disabled={busy}>
              <Send size={18} />
            </button>
          </form>
        </div>

        {/* Sidebar */}
        <div className="chat-sidebar-panel">
          <div className="chat-suggestions">
            <h4>Quick Questions</h4>
            {suggestions.map((s) => (
              <button key={s} className="suggestion-btn" onClick={() => send(null, s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;
