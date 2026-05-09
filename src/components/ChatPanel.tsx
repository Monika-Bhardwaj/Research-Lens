"use client";

import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function ChatPanel() {
  const { messages, addMessage, updateMessage, activeDocumentId, inferenceMode } = useAppStore();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeDocumentId || isLoading) return;

    const userMessageId = uuidv4();
    addMessage({ id: userMessageId, role: 'user', content: input });
    setInput('');
    setIsLoading(true);

    const assistantMessageId = uuidv4();
    addMessage({ id: assistantMessageId, role: 'assistant', content: '' });

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, documentId: activeDocumentId, mode: inferenceMode }),
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let text = '';
      let citations = [];

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);

        if (chunkValue.includes('__DATA_END__')) {
          const parts = chunkValue.split('__DATA_END__');
          try {
            const parsed = JSON.parse(parts[0]);
            if (parsed.type === 'metadata') {
              citations = parsed.data.citations;
              updateMessage(assistantMessageId, { 
                citations, 
                confidenceScore: parsed.data.confidenceScore 
              });
            }
          } catch(e) {}
          text += parts[1] || '';
        } else {
          text += chunkValue;
        }

        updateMessage(assistantMessageId, { content: text });
      }
    } catch (error) {
      console.error(error);
      updateMessage(assistantMessageId, { content: 'Sorry, I encountered an error processing your request.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.filter(m => m.content || m.citations?.length).map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-emerald-900/50 flex items-center justify-center shrink-0 border border-emerald-500/20 text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </div>
            )}
            
            <div className={`max-w-[80%] rounded-2xl p-4 ${
              msg.role === 'user' 
                ? 'bg-neutral-800 text-neutral-100 rounded-tr-sm' 
                : 'bg-neutral-900/50 border border-neutral-800/50 text-neutral-200 rounded-tl-sm shadow-xl'
            }`}>
              <div className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </div>
              
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-4 pt-4 border-t border-neutral-800 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-500 font-medium">Sources:</span>
                    {msg.confidenceScore !== undefined && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                        msg.confidenceScore > 80 ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' :
                        msg.confidenceScore > 50 ? 'border-amber-500/30 text-amber-400 bg-amber-500/10' :
                        'border-red-500/30 text-red-400 bg-red-500/10'
                      }`}>
                        {msg.confidenceScore}% Confidence
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {msg.citations.map((c, i) => (
                      <span key={i} className="px-2 py-1 bg-neutral-800 text-neutral-400 text-[10px] font-mono rounded border border-neutral-700 cursor-pointer hover:bg-neutral-700 transition-colors" title={c.text}>
                        Page {c.metadata.pageNumber}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center shrink-0 border border-neutral-700 text-neutral-400">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4">
             <div className="w-8 h-8 rounded-full bg-emerald-900/50 flex items-center justify-center shrink-0 border border-emerald-500/20 text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="bg-neutral-900/50 border border-neutral-800/50 rounded-2xl p-4 rounded-tl-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500/50 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-emerald-500/50 animate-bounce delay-75" />
                <div className="w-2 h-2 rounded-full bg-emerald-500/50 animate-bounce delay-150" />
              </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-neutral-950 border-t border-neutral-800">
        <form onSubmit={handleSubmit} className="relative flex items-center max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about the document..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl py-4 pl-6 pr-14 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-shadow shadow-lg"
            disabled={isLoading || !activeDocumentId}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim() || !activeDocumentId}
            className="absolute right-2 p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 disabled:hover:bg-emerald-600 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="text-center mt-2">
          <span className="text-[10px] text-neutral-600">AI can make mistakes. Verify important information.</span>
        </div>
      </div>
    </div>
  );
}
