import { motion, AnimatePresence } from 'framer-motion';
import { useSimulatorStore } from '../../store/useSimulatorStore';
import { useEffect, useRef } from 'react';
import { MODEL_ID } from '../../lib/groqService';

export function AIAdvisorPanel() {
  const store = useSimulatorStore();
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Automatyczne przewijanie do odpowiedzi
  useEffect(() => {
    if (store.aiLastResponse) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [store.aiLastResponse]);

  const handleAsk = async () => {
    if (store.aiStatus === 'idle') {
      await store.initAI();
      await store.calculateAIAdvice();
    } else {
      await store.calculateAIAdvice();
    }
  };



  return (
    <section className="mt-8 mb-4">
      <div className={`p-6 rounded-2xl border transition-all duration-500 shadow-xl ${
        store.isDarkMode 
          ? 'bg-[#0c1324]/80 backdrop-blur-xl border-white/10' 
          : 'bg-white border-slate-200'
      }`}>
        
        {/* Header - Kinetic Advisor Logo / Status */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className={`material-symbols-outlined text-3xl ${store.aiStatus === 'ready' ? 'text-secondary animate-pulse' : 'text-primary'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                psychology
              </span>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full border-2 border-background shadow-[0_0_10px_rgba(78,222,163,0.5)]"></div>
            </div>
            <div>
              <h3 className="text-sm font-headline font-black uppercase tracking-widest text-slate-900 dark:text-white">
                Kinetic AI Advisor
              </h3>
              <p className={`text-[10px] font-label uppercase tracking-wider font-bold ${store.aiStatus === 'ready' ? 'text-secondary' : 'text-slate-500'}`}>
                {store.aiStatus === 'idle' && 'Gotowy do analizy'}
                {store.aiStatus === 'ready' && 'Analityk DeepSeek-R1 Aktywny (Cloud)'}
                {store.aiStatus === 'generating' && 'Analiza portfela...'}
                {store.aiStatus === 'error' && 'Błąd systemu AI'}
              </p>
            </div>
          </div>

          <button 
            onClick={handleAsk}
            disabled={store.aiStatus === 'generating'}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              store.aiStatus === 'idle' 
                ? 'bg-primary text-background hover:scale-105 active:scale-95 shadow-lg shadow-primary/20' 
                : 'border border-primary/30 text-primary hover:bg-primary/5'
            } disabled:opacity-50`}
          >
            {store.aiStatus === 'idle' ? 'Zadaj pytanie' : 'Odśwież analizę'}
          </button>
        </div>

        {/* AI Response Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${store.aiStatus}-${store.activePhase}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {store.aiStatus === 'generating' ? (
              <div className="flex flex-col gap-3 py-4">
                <div className="flex gap-2 items-center">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce shadow-sm"></div>
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-100 shadow-sm"></div>
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-200 shadow-sm"></div>
                  <p className="text-xs font-body italic text-slate-500 ml-2">Konsultacja z Wyrocznią chmurową...</p>
                </div>
              </div>
            ) : store.aiStatus === 'error' ? (
              <div className="p-4 rounded-xl bg-error/10 border border-error/30 flex items-center gap-3">
                <span className="material-symbols-outlined text-error">warning</span>
                <p className="text-xs text-error font-bold uppercase tracking-wider">{store.aiError || 'Błąd komunikacji z chmurą'}</p>
              </div>
            ) : store.aiLastResponse ? (
              <div className="relative p-5 rounded-2xl bg-secondary/5 border border-secondary/20 shadow-inner group">
                <div className="absolute top-2 right-4 text-[10px] font-black uppercase text-secondary/40 tracking-widest pointer-events-none">
                  AI ANALYTICS - {MODEL_ID.replace('-versatile', '').toUpperCase()}
                </div>
                
                <div className="prose prose-invert prose-sm max-w-none prose-headings:font-headline prose-p:font-body prose-p:leading-relaxed text-slate-700 dark:text-slate-200">
                  <div dangerouslySetInnerHTML={{ __html: store.aiLastResponse.replace(/\n/g, '<br/>') }} />
                </div>
                <div ref={chatEndRef} />
              </div>
            ) : (
              <div className="py-8 text-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-2xl">
                <p className="text-[10px] font-label uppercase tracking-widest text-slate-400">Brak aktywnej analizy. Kliknij przycisk powyżej.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Nota o prywatności i przetwarzaniu w chmurze */}
        <div className="mt-6 flex flex-col gap-2 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-600 text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
            <p className="text-[9px] font-label text-slate-500 uppercase tracking-widest font-black">
              Prywatność przez anonimizację parametrów.
            </p>
          </div>
          <p className="text-[8px] leading-relaxed text-slate-500/60 font-body uppercase tracking-tighter">
            W celu analizy, anonimowe parametry Twojej symulacji zostaną przesłane do chmurowego modelu AI (Groq). Żadne dane osobowe nie są zbierane ani przechowywane.
          </p>
        </div>
      </div>
    </section>
  );
}
