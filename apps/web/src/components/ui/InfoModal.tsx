import { motion, AnimatePresence } from 'framer-motion';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InfoModal({ isOpen, onClose }: InfoModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-2000 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            // Center absolute horizontally & vertically
            className="fixed inset-x-4 max-w-md mx-auto top-[20%] z-2010 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-outline-variant/20 shadow-2xl"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-headline font-black uppercase tracking-widest text-primary text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">psychology</span>
                Demistyfikacja Monte Carlo
              </h3>
              <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors text-outline">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="space-y-4 text-[11px] sm:text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <p>
                <strong>Jak to liczymy?</strong> Nie zgadujemy przyszłości. Silnik Kinetic uruchamia 1000 alternatywnych wszechświatów finansowych dla Twojego portfela, rzucając rynkiem w górę i w dół na podstawie historycznej zmienności.
              </p>
              
              <ul className="space-y-3 bg-slate-50 dark:bg-black/40 p-4 rounded-xl border border-outline-variant/10">
                <li className="flex gap-2">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-secondary shrink-0" />
                  <p><strong className="text-secondary uppercase">Mediana (P50):</strong> To najbardziej prawdopodobny środek. W co drugiej symulacji zarobisz więcej, w co drugiej mniej.</p>
                </li>
                <li className="flex gap-2">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-error shrink-0" />
                  <p><strong className="text-error uppercase">Zakres P10:</strong> Ścieżka brutalnego kryzysu. 90% alternatywnych rynków poradziło sobie w naszej symulacji lepiej. Jeśli przetrwasz test w scenariuszu P10 – przetrwasz wszystko.</p>
                </li>
                <li className="flex gap-2">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-primary shrink-0" />
                  <p><strong className="text-primary uppercase">Zakres P90:</strong> Bardzo optymistyczny rynek (Hossa dekady).</p>
                </li>
              </ul>

              <p className="italic text-outline/80 mt-2">
                Brak tu czarnych skrzynek (Black-box). Opieramy się o rygorystyczne równania stochastyczne i matematykę na zmiennoprzecinkowych bitach Rust (WASM).
              </p>
            </div>

            <button 
              onClick={onClose}
              className="mt-6 w-full py-3 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-black font-bold uppercase tracking-widest text-[10px] transition-all"
            >
              Rozumiem
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
