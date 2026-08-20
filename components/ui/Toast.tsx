'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type ToastTone = 'success' | 'error' | 'info';

interface ToastMessage {
  id: number;
  tone: ToastTone;
  text: string;
}

interface ToastApi {
  push: (text: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const tones: Record<ToastTone, string> = {
  success: 'border-olive/40 text-olive',
  error: 'border-terracotta/50 text-terracotta',
  info: 'border-[color:var(--color-line-strong)] text-espresso',
};

/** Notifications éphémères, annoncées aux lecteurs d'écran via `aria-live`. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const push = useCallback((text: string, tone: ToastTone = 'info') => {
    const id = Date.now() + Math.random();
    setMessages((current) => [...current, { id, tone, text }]);
    window.setTimeout(() => {
      setMessages((current) => current.filter((message) => message.id !== id));
    }, 5000);
  }, []);

  const api = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[100] flex flex-col items-center gap-2 px-4 sm:bottom-8"
      >
        <AnimatePresence>
          {messages.map((message) => (
            <motion.p
              key={message.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25 }}
              className={`pointer-events-auto rounded-full border bg-ivory px-5 py-2.5 font-body text-sm shadow-soft ${tones[message.tone]}`}
            >
              {message.text}
            </motion.p>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast doit être utilisé dans un ToastProvider.');
  return context;
}
