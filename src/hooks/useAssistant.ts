"use client";

import { useState, useCallback, useRef } from "react";

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  actions?: Array<{ tool: string; input: any; result: string }>;
  timestamp: Date;
}

export function useAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const conversationId = useRef(`conv-${Date.now()}`);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: text.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversationId.current,
          message: text.trim(),
          history: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Request failed');
      }

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: data.response,
        actions: data.actions?.length > 0 ? data.actions : undefined,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setError(err.message);
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: `Sorry, I hit an issue: ${err.message}. Try again.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }, [messages, loading]);

  const clearConversation = useCallback(() => {
    setMessages([]);
    conversationId.current = `conv-${Date.now()}`;
    setError(null);
  }, []);

  return { messages, loading, error, sendMessage, clearConversation };
}
