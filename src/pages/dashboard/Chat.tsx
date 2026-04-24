import { FormEvent, useEffect, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

const renderContent = (text: string) => {
  const lines = text.split("\n").filter((line) => line.trim() !== "");

  return (
    <div className="space-y-2">
      {lines.map((line, index) => {
        const trimmed = line.trim();
        const numbered = trimmed.match(/^(\d+)\.\s+(.+)/);
        const bullet = trimmed.match(/^[-*•]\s+(.+)/);
        const formatBold = (str: string) => {
          const parts = str.split(/\*\*(.+?)\*\*/g);
          return parts.map((part, partIndex) => (partIndex % 2 === 1 ? <strong key={partIndex}>{part}</strong> : part));
        };

        if (numbered) {
          return (
            <div key={index} className="flex items-start gap-3">
              <span className="min-w-5 font-accent font-bold text-primary">{numbered[1]}.</span>
              <span>{formatBold(numbered[2])}</span>
            </div>
          );
        }

        if (bullet) {
          return (
            <div key={index} className="flex items-start gap-3">
              <span className="min-w-4 font-accent font-bold text-primary">•</span>
              <span>{formatBold(bullet[1])}</span>
            </div>
          );
        }

        if (trimmed.startsWith("## ")) {
          return <div key={index} className="pt-1 font-accent text-sm font-bold uppercase tracking-[0.18em] text-primary">{formatBold(trimmed.slice(3))}</div>;
        }

        if (trimmed.startsWith("# ")) {
          return <div key={index} className="pt-1 font-display text-lg font-bold text-foreground">{formatBold(trimmed.slice(2))}</div>;
        }

        return <div key={index}>{formatBold(trimmed)}</div>;
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
    { role: "assistant", content: "Namaste! I'm your rural assistant. Ask me about farming, schemes, weather, jobs, or daily village needs." },
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

      if (resp.status === 429) {
        toast.error("Too many requests, slow down.");
        setBusy(false);
        return;
      }
      if (resp.status === 402) {
        toast.error("AI credits exhausted.");
        setBusy(false);
        return;
      }
      if (!resp.ok || !resp.body) {
        toast.error("Chat failed");
        setBusy(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let acc = "";
      setMessages((current) => [...current, { role: "assistant", content: "" }]);

      let done = false;
      while (!done) {
        const { value, done: readDone } = await reader.read();
        if (readDone) break;
        buf += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, newlineIndex);
          buf = buf.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;

          const json = line.slice(6).trim();
          if (json === "[DONE]") {
            done = true;
            break;
          }

          try {
            const chunk = JSON.parse(json).choices?.[0]?.delta?.content;
            if (chunk) {
              acc += chunk;
              setMessages((current) =>
                current.map((message, index) => (index === current.length - 1 ? { ...message, content: acc } : message)),
              );
            }
          } catch {
            buf = `${line}\n${buf}`;
            break;
          }
        }
      }
    } catch {
      toast.error("Network error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-glow">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <span className="page-kicker">AI conversation</span>
            <h1 className="font-display text-4xl font-extrabold text-foreground">{t("aiChat")}</h1>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">A calmer chat box with richer typography, layered panels and friendlier reading rhythm.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="ambient-panel-strong flex min-h-[70vh] flex-col overflow-hidden">
          <div className="border-b border-border/50 px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-accent text-xs uppercase tracking-[0.24em] text-primary">Live assistant</div>
                <div className="mt-1 font-display text-xl font-semibold">Answers in a clearer, card-based chat flow</div>
              </div>
              <div className="ambient-chip">Responsive</div>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 md:px-6">
            {messages.map((message, index) => (
              <div key={index} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                {message.role === "assistant" && (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 font-accent text-sm font-bold text-primary">
                    AI
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-[1.5rem] px-4 py-3 text-sm leading-7 shadow-soft md:max-w-[72%] ${
                    message.role === "user"
                      ? "rounded-tr-md bg-primary text-primary-foreground"
                      : "rounded-tl-md border border-white/60 bg-white/80 text-foreground backdrop-blur"
                  }`}
                >
                  {message.content === "" && message.role === "assistant" ? (
                    <div className="flex items-center gap-1 py-1">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-primary/60" />
                      <span className="h-2 w-2 animate-pulse rounded-full bg-primary/60 [animation-delay:150ms]" />
                      <span className="h-2 w-2 animate-pulse rounded-full bg-primary/60 [animation-delay:300ms]" />
                    </div>
                  ) : message.role === "assistant" ? (
                    renderContent(message.content)
                  ) : (
                    message.content
                  )}
                </div>

                {message.role === "user" && (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-100 to-emerald-100 font-accent text-sm font-bold text-teal-700">
                    U
                  </div>
                )}
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <form onSubmit={(e) => send(e)} className="border-t border-border/50 px-4 py-4 md:px-6">
            <div className="flex gap-3">
              <input
                className="ambient-input h-12 flex-1 rounded-2xl border px-4 font-sans text-sm outline-none transition focus:border-primary"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(null);
                  }
                }}
                placeholder={t("askAnything")}
                maxLength={2000}
              />
              <button
                type="submit"
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-warm text-white shadow-glow transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={busy}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <div className="ambient-panel p-5">
            <h3 className="font-accent text-sm uppercase tracking-[0.24em] text-primary">Quick questions</h3>
            <div className="mt-4 space-y-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  className="w-full rounded-2xl border border-white/55 bg-white/70 px-4 py-3 text-left text-sm leading-6 text-foreground transition hover:border-primary/40 hover:bg-secondary"
                  onClick={() => send(null, suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div className="ambient-panel p-5" style={{ animationDelay: "100ms" }}>
            <h3 className="font-display text-xl font-semibold">Why this feels better</h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              The chat page now uses softer surfaces, stronger hierarchy and more breathing room so long AI answers are easier to trust and read.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
