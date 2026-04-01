import { motion, AnimatePresence } from 'framer-motion';
import type { SavedPortfolio } from '../../db';

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    maximumFractionDigits: 0
  }).format(val || 0);
};

interface SavedPortfoliosProps {
  savedDocs: SavedPortfolio[];
  onLoadDoc: (p: SavedPortfolio) => void;
}

export function SavedPortfolios({ savedDocs, onLoadDoc }: SavedPortfoliosProps) {
  if (savedDocs.length === 0) return null;

  return (
    <section className="space-y-4">
      <h3 className="text-sm font-label uppercase tracking-widest text-outline border-l-2 border-secondary pl-3">Zapisane Portfele (Local-First)</h3>
      <motion.div 
        className="flex flex-col gap-2"
        variants={{ show: { transition: { staggerChildren: 0.1 } } }}
        initial="hidden"
        animate="show"
      >
        <AnimatePresence>
          {savedDocs.map(doc => (
            <motion.div 
              key={doc.id}
              onClick={() => onLoadDoc(doc)} 
              variants={{
                hidden: { opacity: 0, y: 10 },
                show: { opacity: 1, y: 0 }
              }}
              exit={{ opacity: 0, scale: 0.95 }}
              whileHover={{ scale: 1.01, backgroundColor: "rgba(255,255,255,0.03)" }}
              whileTap={{ scale: 0.98 }}
              className="glass-card rounded-xl p-4 border border-outline-variant/10 cursor-pointer hover:border-secondary/30 transition-colors flex justify-between items-center"
            >
              <div>
                <h4 className="font-bold text-sm text-surface-tint">{doc.name}</h4>
                <p className="text-[10px] text-outline mt-1">
                  {Math.max(1, doc.retirement_age - doc.current_age)} Lat | {doc.custom_core_pct}% Rdzeń | {doc.maximize_ike_limit ? "MAX IKE" : formatCurrency(doc.monthly_contribution)+"/m-c"}
                </p>
              </div>
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 0" }}>download</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
