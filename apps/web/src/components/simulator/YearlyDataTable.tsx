import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const fmt = (val: number) =>
  new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(val || 0);

interface YearlyDataTableProps {
  yearlyData: any[];
  startAge: number;
  phase: 'accumulation' | 'decumulation';
}

export function YearlyDataTable({ yearlyData, startAge, phase }: YearlyDataTableProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!yearlyData || yearlyData.length === 0) return null;

  const isAccumulation = phase === 'accumulation';

  return (
    <div className="mt-2">
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl 
          bg-surface-container-lowest border border-outline-variant/15
          hover:bg-surface-container-low transition-all duration-300 group"
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-lg text-outline/60" style={{ fontVariationSettings: "'FILL' 1" }}>
            table_chart
          </span>
          <span className="text-xs font-label uppercase tracking-widest text-outline group-hover:text-white/80 transition-colors">
            {isAccumulation ? 'Pokaż wpłaty rok po roku' : 'Pokaż wypłaty rok po roku'}
          </span>
        </div>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="material-symbols-outlined text-outline/60"
        >
          expand_more
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-xl border border-outline-variant/10 bg-white/3 backdrop-blur-sm overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-4 gap-0 px-4 py-2.5 bg-white/5 border-b border-outline-variant/10">
                <span className="text-[9px] font-label uppercase tracking-widest text-outline/60">Rok / Wiek</span>
                <span className="text-[9px] font-label uppercase tracking-widest text-outline/60 text-right">
                  {isAccumulation ? 'Wpłacono' : 'Wypłacono'}
                </span>
                <span className="text-[9px] font-label uppercase tracking-widest text-outline/60 text-right">Zysk Nom.</span>
                <span className="text-[9px] font-label uppercase tracking-widest text-outline/60 text-right">Saldo</span>
              </div>

              {/* Scrollable body */}
              <div className="max-h-96 overflow-y-auto overscroll-contain custom-scrollbar">
                {yearlyData.map((row: any, idx: number) => {
                  const yearNum = row.year ?? idx + 1;
                  const age = startAge + yearNum;
                  const invested = isAccumulation
                    ? (row.yearlyInvestedNominal ?? 0)
                    : Math.abs(row.monthlyPmt ?? 0) * 12;
                  const interest = row.nominalInterest ?? 0;
                  const balance = row.nominalBalance ?? 0;

                  return (
                    <motion.div
                      key={yearNum}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(idx * 0.02, 0.6), duration: 0.2 }}
                      className={`grid grid-cols-4 gap-0 px-4 py-2 border-b border-outline-variant/5 
                        hover:bg-white/4 transition-colors duration-200
                        ${idx % 2 === 0 ? '' : 'bg-white/1.5'}`}
                    >
                      {/* Rok / Wiek */}
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs font-headline font-bold text-white/80">{yearNum}</span>
                        <span className="text-[10px] font-label text-outline/40">({age} lat)</span>
                      </div>

                      {/* Wpłacono / Wypłacono */}
                      <span className={`text-xs font-mono font-medium text-right tabular-nums ${
                        isAccumulation ? 'text-primary/80' : 'text-error/80'
                      }`}>
                        {isAccumulation ? '+' : '-'}{fmt(invested)}
                      </span>

                      {/* Zysk */}
                      <span className={`text-xs font-mono font-medium text-right tabular-nums ${
                        interest >= 0 ? 'text-secondary/80' : 'text-error/80'
                      }`}>
                        {interest >= 0 ? '+' : ''}{fmt(interest)}
                      </span>

                      {/* Saldo */}
                      <span className="text-xs font-mono font-bold text-right tabular-nums text-white/90">
                        {fmt(balance)}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Footer — podsumowanie */}
              <div className="grid grid-cols-4 gap-0 px-4 py-2.5 bg-white/5 border-t border-outline-variant/10">
                <span className="text-[10px] font-label uppercase tracking-wider text-outline/60 font-bold">Σ Razem</span>
                <span className={`text-[11px] font-mono font-bold text-right tabular-nums ${
                  isAccumulation ? 'text-primary' : 'text-error'
                }`}>
                  {isAccumulation ? '+' : '-'}{fmt(
                    yearlyData.reduce((sum: number, r: any) => 
                      sum + (isAccumulation ? (r.yearlyInvestedNominal ?? 0) : Math.abs(r.monthlyPmt ?? 0) * 12), 0
                    )
                  )}
                </span>
                <span className="text-[11px] font-mono font-bold text-right tabular-nums text-secondary">
                  +{fmt(yearlyData.reduce((sum: number, r: any) => sum + (r.nominalInterest ?? 0), 0))}
                </span>
                <span className="text-[11px] font-mono font-bold text-right tabular-nums text-white">
                  {fmt(yearlyData[yearlyData.length - 1]?.nominalBalance ?? 0)}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
