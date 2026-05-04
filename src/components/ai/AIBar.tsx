'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useResultsStore } from '@/store/results';
import { useMapStore } from '@/store/map';
import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Helper to extract text from v6 UIMessage (parts[]) or legacy v5 (content string)
function getMessageText(m: any): string {
  if (typeof m.content === 'string') return m.content;
  if (Array.isArray(m.parts)) {
    return m.parts
      .filter((p: any) => p.type === 'text')
      .map((p: any) => p.text ?? '')
      .join('');
  }
  return '';
}

export function AIBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [localInput, setLocalInput] = useState('');
  const { liveResultsJson } = useResultsStore();
  const { selectedAcNo } = useMapStore();

  // Keep a ref so the transport body always has the latest live data
  const liveRef = useRef({ liveResultsJson, selectedAcNo });
  liveRef.current = { liveResultsJson, selectedAcNo };

  const { messages, error, status, sendMessage } = useChat({
    // v6: use DefaultChatTransport (concrete impl of HttpChatTransport)
    transport: new DefaultChatTransport({
      api: '/api/chat',
      // body as a function so it's evaluated fresh on each request
      body: () => ({
        liveResultsJson: liveRef.current.liveResultsJson || '{}',
        currentConstituency: liveRef.current.selectedAcNo || 'Kerala',
      }),
    }),
    messages: [
      {
        id: 'welcome',
        role: 'assistant',
        parts: [{ type: 'text', text: 'നമസ്കാരം! 🗳️ Kerala Election 2026 results-നെ കുറിച്ച് ചോദിക്കൂ.' }],
      } as any,
    ],
    onError: (err) => {
      console.error('AI SDK Error:', err);
    },
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  const onManualSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!localInput.trim() || isLoading) return;
    const text = localInput.trim();
    setLocalInput('');
    try {
      await sendMessage({ text });
    } catch (err) {
      console.error('Send Error:', err);
    }
  };

  const onSuggestion = async (s: string) => {
    if (isLoading) return;
    try {
      await sendMessage({ text: s });
    } catch (err) {
      console.error('Suggestion Error:', err);
    }
  };

  return (
    <>
      {/* Mobile Floating Bar */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-kep-bg/90 backdrop-blur-xl border-t border-white/10 p-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full bg-kep-surface border border-white/10 rounded-2xl p-4 flex items-center gap-3 active:scale-95 transition-transform"
        >
          <span className="text-xl">🤖</span>
          <span className="text-sm font-bold text-kep-text-secondary truncate">
            {messages.length > 1 ? getMessageText(messages[messages.length - 1]) : 'Ask Election Assistant...'}
          </span>
        </button>
      </div>

      {/* Desktop Floating Button */}
      <div className="fixed bottom-10 right-10 z-50 hidden md:block">
        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-[24px] bg-kep-ai shadow-[0_20px_50px_rgba(108,99,255,0.4)] flex items-center justify-center text-3xl"
        >
          🤖
        </motion.button>
      </div>

      {/* Chat Sheet */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] md:hidden"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 top-10 md:top-auto md:bottom-28 md:right-10 md:left-auto md:w-[450px] md:h-[650px] z-[100] bg-kep-bg flex flex-col rounded-t-[40px] md:rounded-[40px] border border-white/10 shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 flex justify-between items-center border-b border-white/5 bg-kep-surface">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-kep-ai/20 flex items-center justify-center text-2xl">🤖</div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">KERALA ELECTION AI</h3>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] font-black text-kep-text-tertiary uppercase tracking-widest">LIVE ANALYSIS ACTIVE</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                {messages.map((m) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={m.id}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] p-4 rounded-[24px] ${
                      m.role === 'user'
                        ? 'bg-kep-ai text-white shadow-xl shadow-kep-ai/20 rounded-br-none'
                        : 'bg-kep-surface border border-white/10 text-kep-text-primary rounded-bl-none'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{getMessageText(m)}</p>
                    </div>
                  </motion.div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-kep-surface border border-white/10 p-4 rounded-2xl animate-pulse">
                      <div className="flex gap-1.5">
                        <div className="w-1.5 h-1.5 bg-kep-text-tertiary rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-kep-text-tertiary rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-1.5 h-1.5 bg-kep-text-tertiary rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold text-center uppercase tracking-widest">
                    ⚠️ {error.message}
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-6 bg-kep-surface border-t border-white/5">
                <form onSubmit={onManualSubmit} className="relative group">
                  <input
                    value={localInput}
                    onChange={(e) => setLocalInput(e.target.value)}
                    placeholder="Ask about live counts, fronts, or history..."
                    className="w-full bg-kep-bg border border-white/10 rounded-[24px] py-5 pl-6 pr-16 text-sm focus:outline-none focus:border-kep-ai focus:ring-4 focus:ring-kep-ai/10 transition-all placeholder:text-kep-text-tertiary"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !localInput.trim()}
                    className="absolute right-2.5 top-2.5 w-11 h-11 rounded-xl bg-kep-ai text-white flex items-center justify-center disabled:opacity-30 disabled:grayscale transition-all hover:shadow-lg hover:shadow-kep-ai/30 active:scale-90"
                  >
                    <span className="text-xl font-black">↑</span>
                  </button>
                </form>
                <div className="mt-4 flex flex-wrap gap-2">
                  {['LDF Lead?', 'Pala Winner?', 'UDF Total?'].map((s) => (
                    <button
                      key={s}
                      onClick={() => onSuggestion(s)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-kep-text-tertiary hover:bg-white/10 hover:text-white transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
