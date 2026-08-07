"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Send, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { quickActions, type ChatMessage } from "@/lib/ai/prompts";
import { cn } from "@/lib/utils";

export function AssistantChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    if (!text.trim() || streaming) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
    } catch {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "assistant", content: "⚠️ Không thể kết nối AI." };
        return copy;
      });
    } finally {
      setStreaming(false);
    }
  }

  const empty = messages.length === 0;

  return (
    <div className="mx-auto flex h-[calc(100vh-9rem)] max-w-3xl flex-col">
      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto pb-4">
        {empty ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
              <Sparkles className="size-7" />
            </div>
            <h2 className="mt-4 text-xl font-semibold">Xin chào, tôi là AI Coach 👋</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Hỏi tôi bất cứ điều gì về kế hoạch, thói quen, tài chính hay phát triển bản thân.
            </p>
            <div className="mt-6 grid w-full max-w-lg grid-cols-2 gap-2 sm:grid-cols-3">
              {quickActions.map((a) => (
                <button
                  key={a.key}
                  onClick={() => send(a.prompt)}
                  className="glass ring-hairline flex flex-col items-start gap-1 rounded-xl p-3 text-left transition-colors hover:bg-accent/40"
                >
                  <span className="text-lg">{a.emoji}</span>
                  <span className="text-xs font-medium">{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => <Bubble key={i} message={m} streaming={streaming && i === messages.length - 1} />)
        )}
        <div ref={endRef} />
      </div>

      {/* Composer */}
      <div className="glass ring-hairline flex items-end gap-2 rounded-2xl p-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
          }}
          rows={1}
          placeholder="Nhắn cho AI Coach…  (Enter để gửi)"
          className="max-h-32 flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
        />
        <Button size="icon" onClick={() => send(input)} disabled={!input.trim() || streaming}>
          {streaming ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </Button>
      </div>
    </div>
  );
}

function Bubble({ message, streaming }: { message: ChatMessage; streaming: boolean }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-3", isUser && "flex-row-reverse")}
    >
      <div
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-lg",
          isUser ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground",
        )}
      >
        {isUser ? <User className="size-4" /> : <Sparkles className="size-4" />}
      </div>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser ? "bg-primary text-primary-foreground" : "glass ring-hairline",
        )}
      >
        <Markdown text={message.content} />
        {streaming && !message.content && <span className="text-muted-foreground">Đang soạn…</span>}
      </div>
    </motion.div>
  );
}

/** Minimal markdown: **bold**, `code`, headings, and line breaks. */
function Markdown({ text }: { text: string }) {
  return (
    <div className="space-y-1.5">
      {text.split("\n").filter(Boolean).map((line, i) => {
        const heading = /^#{1,3}\s/.test(line);
        const clean = line.replace(/^#{1,3}\s/, "");
        const html = clean
          .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
          .replace(/`(.+?)`/g, '<code class="rounded bg-black/20 px-1 text-[0.85em]">$1</code>')
          .replace(/\*(.+?)\*/g, "<em>$1</em>");
        return (
          <p
            key={i}
            className={cn(heading && "font-semibold")}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}
    </div>
  );
}
