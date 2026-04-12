"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, RotateCcw, Loader2 } from "lucide-react";
import { useAssistant } from "@/hooks/useAssistant";
import AssistantMessageBubble from "@/components/admin/AssistantMessage";

const SUGGESTED_PROMPTS = [
  "What should I do today?",
  "How are my zones looking?",
  "Any equipment overdue?",
  "What's the weather this week?",
  "Revenue update",
  "Which varieties should I list?",
  "When should I start digging?",
  "Help me plan next week",
];

export default function AssistantPage() {
  const { messages, loading, sendMessage, clearConversation } = useAssistant();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    sendMessage(input);
    setInput("");
  };

  const handleSuggestedPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-cream pb-0 -mb-16">
      {/* Header */}
      <div className="bg-cream/95 backdrop-blur border-b border-fence px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-leaf flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bitter text-lg font-bold text-root leading-tight">Borden</h1>
            <p className="text-[10px] text-stone-c uppercase tracking-wider font-bold">Farm Advisor</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearConversation}
            className="p-2 text-stone-c hover:text-root transition-colors"
            title="New conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          /* Empty state with suggested prompts */
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-16 h-16 rounded-full bg-leaf-lt flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-leaf" />
            </div>
            <h2 className="font-bitter text-xl font-bold text-root mb-1">Hey Gary.</h2>
            <p className="text-sm text-stone-c mb-6 text-center">I've got the full farm picture. What do you need?</p>

            <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
              {SUGGESTED_PROMPTS.map(prompt => (
                <button
                  key={prompt}
                  onClick={() => handleSuggestedPrompt(prompt)}
                  className="text-left px-3 py-2.5 bg-linen rounded-xl border border-fence-lt text-xs font-dm-sans text-root hover:bg-clay hover:border-fence transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Conversation */
          <>
            {messages.map((msg, i) => (
              <AssistantMessageBubble key={i} message={msg} />
            ))}
            {loading && (
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-leaf flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <div className="bg-linen border border-fence-lt px-4 py-3 rounded-2xl rounded-bl-md">
                  <Loader2 className="w-4 h-4 text-stone-c animate-spin" />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Input bar — above bottom nav */}
      <div className="border-t border-fence bg-linen px-3 py-2 pb-20">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask Borden anything..."
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-full border border-fence bg-cream text-root text-sm font-dm-sans focus:outline-none focus:ring-2 focus:ring-leaf focus:border-transparent disabled:opacity-50 placeholder:text-ash"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-full bg-leaf text-white flex items-center justify-center disabled:opacity-30 hover:bg-leaf-dk active:scale-95 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
