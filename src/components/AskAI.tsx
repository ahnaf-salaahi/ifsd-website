"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircleQuestion, X, Send, Loader2 } from "lucide-react";

type Message = {
  role: "user" | "ai";
  text: string;
};

export default function AskAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: "Hi! Ask me anything about our scholarships, events, programmes, or blog posts." },
  ]);
  const [loading, setLoading] = useState(false);

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || loading) return;

    const userQuestion = question;
    setMessages((prev) => [...prev, { role: "user", text: userQuestion }]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await fetch("/api/ask-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userQuestion }),
      });
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: data.answer ?? "Sorry, something went wrong. Please try again." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-[90] bg-rose-600 text-white p-4 rounded-full shadow-lg hover:bg-rose-700 transition-colors"
        aria-label="Ask AI"
      >
        <MessageCircleQuestion size={24} />
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 z-[95]"
            />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="fixed bottom-6 right-6 z-[96] w-[90vw] max-w-sm h-[70vh] max-h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="bg-rose-600 text-white px-5 py-4 flex items-center justify-between">
                <span className="font-semibold">Ask AI</span>
                <button onClick={() => setIsOpen(false)} aria-label="Close">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        m.role === "user"
                          ? "bg-rose-600 text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-500 rounded-2xl px-4 py-2.5 text-sm flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin" /> Thinking...
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleAsk} className="border-t border-gray-100 p-3 flex items-center gap-2">
                <input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-rose-600 text-white p-2.5 rounded-full hover:bg-rose-700 transition-colors disabled:opacity-60 shrink-0"
                  aria-label="Send"
                >
                  <Send size={18} />
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}