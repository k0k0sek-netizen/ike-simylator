import { motion, AnimatePresence } from 'framer-motion';
import { useSimulatorStore } from '../../store/useSimulatorStore';
import { useEffect, useRef } from 'react';

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
                {store.aiStatus === 'idle' && 'Offline (Lokalny model Phi-3)'}
                {store.aiStatus === 'loading' && `Pobieranie modelu: ${store.aiProgress}%`}
                {store.aiStatus === 'ready' && 'Analityk Gotowy'}
                {store.aiStatus === 'generating' && 'Analiza portfela...'}
              </p>
            </div>
          </div>

          <button 
            onClick={handleAsk}
            disabled={store.aiStatus === 'loading' || store.aiStatus === 'generating'}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              store.aiStatus === 'idle' 
                ? 'bg-primary text-background hover:scale-105 active:scale-95 shadow-lg shadow-primary/20' 
                : 'border border-primary/30 text-primary hover:bg-primary/5'
            } disabled:opacity-50`}
          >
            {store.aiStatus === 'idle' ? 'Zainicjuj AI Advisor' : 'Odśwież poradę'}
          </button>
        </div>

        {/* AI Response Area */}
        <AnimatePresence mode="wait">
          {store.aiStatus === 'loading' && (
            <motion.div 
              key="loading-ai"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-primary shadow-[0_0_15px_rgba(192,193,255,0.5)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${store.aiProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-center text-[10px] text-slate-500 dark:text-white/40 uppercase tracking-widest font-bold">
                Pobieranie modelu Phi-4 (1.2 GB) do pamięci GPU... To potrwa chwilę.
              </p>
            </motion.div>
          )}

          {store.aiStatus === 'generating' && (
            <motion.div 
              key="generating-ai"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-3 py-4"
            >
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce shadow-sm"></div>
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-100 shadow-sm"></div>
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-200 shadow-sm"></div>
              </div>
              <p className="text-xs font-body italic text-slate-500">Konsultacja z Wyrocznią...</p>
            </motion.div>
          )}

          {store.aiLastResponse && (
            <motion.div 
              key="response-ai"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative p-5 rounded-2xl bg-secondary/5 border border-secondary/20 shadow-inner group"
            >
              <div className="absolute top-2 right-4 text-[10px] font-black uppercase text-secondary/40 tracking-widest pointer-events-none">
                AI ANALYTICS - PHI-3-MINI
              </div>
              
              <div className="prose prose-invert prose-sm max-w-none prose-headings:font-headline prose-p:font-body prose-p:leading-relaxed text-slate-700 dark:text-slate-200">
                <div dangerouslySetInnerHTML={{ __html: store.aiLastResponse.replace(/\n/g, '<br/>') }} />
              </div>
              <div ref={chatEndRef} />
            </motion.div>
          )}

          {store.aiStatus === 'error' && (
            <motion.div 
              key="error-ai"
              className="p-4 rounded-xl bg-error/10 border border-error/30 flex items-center gap-3"
            >
              <span className="material-symbols-outlined text-error">warning</span>
              <p className="text-xs text-error font-bold uppercase tracking-wider">{store.aiError || 'Błąd krytyczny WebGPU'}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Privacy Note */}
        <div className="mt-6 flex items-center gap-2 pt-4 border-t border-white/5">
          <span className="material-symbols-outlined text-slate-600 text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
          <p className="text-[9px] font-label text-slate-500 uppercase tracking-widest font-black">
            100% Privacy-First: Twoje dane finansowe nigdy nie opuszczają tej przeglądarki.
          </p>
        </div>
      </div>
    </section>
  );
}
