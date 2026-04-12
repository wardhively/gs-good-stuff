"use client";

import { Check, Sparkles } from "lucide-react";
import type { ChatMessage } from "@/hooks/useAssistant";

export default function AssistantMessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[85%] ${isUser ? 'order-1' : 'order-1'}`}>
        {/* Avatar for Borden */}
        {!isUser && (
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-5 h-5 rounded-full bg-leaf flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="text-[10px] font-bold text-stone-c uppercase tracking-wider">Borden</span>
          </div>
        )}

        {/* Message bubble */}
        <div className={`px-4 py-3 rounded-2xl text-sm font-dm-sans leading-relaxed ${
          isUser
            ? 'bg-soil text-white rounded-br-md'
            : 'bg-linen border border-fence-lt text-root rounded-bl-md'
        }`}>
          {/* Render markdown-like content */}
          {message.content.split('\n').map((line, i) => (
            <p key={i} className={`${i > 0 ? 'mt-2' : ''} ${line.startsWith('- ') ? 'pl-2' : ''}`}>
              {line.startsWith('- ') ? `• ${line.slice(2)}` : line}
            </p>
          ))}
        </div>

        {/* Action badges */}
        {message.actions && message.actions.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.actions.map((action, i) => {
              // Truncate long results (like weather data dumps)
              const result = action.result.length > 100
                ? action.result.substring(0, 100) + '...'
                : action.result;
              // Skip showing raw data fetches as badges
              if (action.tool === 'get_weather_forecast') return null;
              return (
                <div key={i} className="flex items-start gap-2 bg-leaf-lt px-3 py-1.5 rounded-lg text-xs">
                  <Check className="w-3 h-3 text-leaf flex-shrink-0 mt-0.5" />
                  <span className="text-leaf-dk font-bold">{result}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Timestamp */}
        <p className={`text-[9px] mt-1 ${isUser ? 'text-right' : 'text-left'} text-ash`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
