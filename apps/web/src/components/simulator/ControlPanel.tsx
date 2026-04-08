import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulatorStore } from '../../store/useSimulatorStore';
import { AnimatedCounter } from '../ui/AnimatedCounter';
import { savePortfolio } from '../../db';

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    maximumFractionDigits: 0
  }).format(val || 0);
};

interface ControlPanelProps {
  phase: 'accumulation' | 'decumulation';
  finalNominal: number;
}

export function ControlPanel({ phase, finalNominal }: ControlPanelProps) {
  const store = useSimulatorStore();
  const isDarkMode = store.isDarkMode;
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isRiskExpanded, setIsRiskExpanded] = useState(false);

  const handleSave = async () => {
    const name = prompt("Podaj nazwę dla swojego portfela:", "Mój Portfel IKE");
    if (!name) return;

    setSaveStatus('saving');
    try {
      await savePortfolio(name, {
        monthly_contribution: store.monthlyContribution,
        current_age: store.currentAge,
        retirement_age: store.retirementAge,
        inflation_rate: store.inflationRate,
        annual_step_up: store.annualStepUp,
        core_rate: store.coreRate,
        sat_rate: store.satRate,
        bonds_rate: store.bondsRate,
        is_core_ike: store.isCoreIke,
        is_sat_ike: store.isSatIke,
        is_bonds_ike: store.isBondsIke,
        custom_core_weight: store.customCoreWeight,
        custom_sat_weight: store.customSatWeight,
        custom_bonds_weight: store.customBondsWeight,
        final_nominal: finalNominal
      });
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      console.error(err);
      alert("Błąd zapisu: " + err);
      setSaveStatus('idle');
    }
  };


  const SaveButton = (
    <div className="pt-8 border-t border-outline-variant/10 hide-for-pdf">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSave}
        disabled={saveStatus !== 'idle'}
        style={{ 
          backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#0f172a', 
          color: '#ffffff',
          border: isDarkMode ? '1px solid rgba(255,255,255,0.2)' : 'none'
        }}
        className="w-full py-4 rounded-xl font-headline font-black tracking-widest transition-all duration-300 flex items-center justify-center gap-3 shadow-lg"
      >
        <AnimatePresence mode="wait">
          {saveStatus === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">save</span>
              ZAPISZ BIEŻĄCY SCENARIUSZ
            </motion.div>
          )}
          {saveStatus === 'saving' && (
            <motion.div
              key="saving"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full" />
              ZAPISYWANIE...
            </motion.div>
          )}
          {saveStatus === 'saved' && (
            <motion.div
              key="saved"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">check_circle</span>
              ZAPISANO ✓
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
      <p className="text-[9px] text-center text-outline/40 uppercase tracking-[0.2em] mt-3">
        Projekt zostanie utrwalony w lokalnej bazie PGlite
      </p>
    </div>
  );

  if (phase === 'accumulation') {
    return (
      <section className="space-y-8" style={{ viewTransitionName: 'control-panel' }}>
        <div>
          <h3 className="text-sm font-label uppercase tracking-widest border-l-2 border-secondary pl-3 mb-6" style={{ color: isDarkMode ? '#ffffff' : '#0f172a' }}>
            Parametry Budowy Kapitału
          </h3>
          
          <div className="grid grid-cols-1 gap-6">
            <motion.div whileHover={{ scale: 1.01 }} className="group flex flex-col gap-3">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-label uppercase tracking-wider" style={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : '#475569' }}>Miesięczna Wpłata</label>
                <div className="flex items-baseline gap-1">
                  <AnimatedCounter value={store.monthlyContribution} style={{ color: isDarkMode ? '#ffffff' : '#0f172a' }} className="text-xl font-headline font-bold" />
                </div>
              </div>
              <div className="relative flex items-center h-10 px-3 bg-white dark:bg-gray-800/50 rounded-xl transition-all duration-300 group-focus-within:bg-primary/5 border border-outline-variant/10 group-focus-within:border-primary/30 hide-for-pdf">
                <input className="w-full h-1 bg-slate-100 dark:bg-gray-700/50 rounded-lg appearance-none cursor-pointer accent-primary" type="range" min="100" max="15000" step="100" value={store.monthlyContribution} onChange={(e) => store.setMonthlyContribution(Number(e.target.value))} />
              </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-4">
              <motion.div whileHover={{ scale: 1.01 }} className="group flex flex-col gap-3">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-label uppercase tracking-wider" style={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : '#475569' }}>Twój Wiek</label>
                  <AnimatedCounter value={store.currentAge} isCurrency={false} suffix=" Lat" style={{ color: isDarkMode ? '#ffffff' : '#0f172a' }} className="text-lg font-headline font-bold" />
                </div>
                <div className="relative flex items-center h-8 px-2 bg-white dark:bg-gray-800/50 rounded-lg border border-outline-variant/10 shadow-sm dark:shadow-none hide-for-pdf">
                  <input className="w-full accent-primary" type="range" min="18" max="70" step="1" value={store.currentAge} onChange={(e) => store.setCurrentAge(Number(e.target.value))} />
                </div>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.01 }} className="group flex flex-col gap-3">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-label uppercase tracking-wider" style={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : '#475569' }}>Emerytura</label>
                  <AnimatedCounter value={store.retirementAge} isCurrency={false} suffix=" Lat" style={{ color: isDarkMode ? '#ffffff' : '#0f172a' }} className="text-lg font-headline font-bold" />
                </div>
                <div className="relative flex items-center h-8 px-2 bg-white dark:bg-gray-800/50 rounded-lg border border-outline-variant/10 shadow-sm dark:shadow-none hide-for-pdf">
                  <input className="w-full accent-primary" type="range" min="30" max="85" step="1" value={store.retirementAge} onChange={(e) => store.setRetirementAge(Number(e.target.value))} />
                </div>
              </motion.div>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-4 pt-4 border-t border-outline-variant/10">
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-label text-slate-500 dark:text-slate-400 uppercase">Waloryzacja (Step-up)</label>
                <div className="flex items-center gap-2">
                  <input className="w-full accent-primary hide-for-pdf" type="range" min="0" max="15" step="0.5" value={store.annualStepUp} onChange={(e) => store.setAnnualStepUp(Number(e.target.value))} />
                  <span className="text-[10px] font-bold text-primary min-w-[30px]">{store.annualStepUp}%</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-label text-slate-500 dark:text-slate-400 uppercase">Inflacja</label>
                <div className="flex items-center gap-2">
                  <input className="w-full accent-tertiary hide-for-pdf" type="range" min="0" max="15" step="0.5" value={store.inflationRate} onChange={(e) => store.setInflationRate(Number(e.target.value))} />
                  <span className="text-[10px] font-bold text-tertiary min-w-[30px]">{store.inflationRate}%</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-outline-variant/10">
              <label className="text-[10px] font-label text-outline uppercase tracking-wider block mb-4">Typ konta (Tarcza IKE)</label>
              <div className="space-y-3">
                {[
                  { 
                    label: 'Świat (np. mBank/XTB)', 
                    val: store.isCoreIke, 
                    set: store.setIsCoreIke, 
                    color: 'border-secondary/30 text-secondary',
                    disabled: store.isBondsIke // Wykluczone przez IKE-Obligacje
                  },
                  { 
                    label: 'Krypto (np. Bossa)', 
                    val: store.isSatIke, 
                    set: store.setIsSatIke, 
                    color: 'border-amber-500/30 text-amber-500',
                    disabled: store.isBondsIke // Wykluczone przez IKE-Obligacje
                  },
                  { 
                    label: 'EDO (PKO BP)', 
                    val: store.isBondsIke, 
                    set: store.setIsBondsIke, 
                    color: 'border-indigo-400/30 text-indigo-400',
                    disabled: store.isCoreIke || store.isSatIke // Wykluczone przez IKE Maklerskie
                  },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className={`text-[10px] font-bold uppercase ${item.color.split(' ')[1]}`}>{item.label}</span>
                    <div className="flex bg-slate-100 dark:bg-gray-700/50 rounded-lg p-0.5 border border-outline-variant/10 hide-for-pdf">
                      <button 
                        onClick={() => !item.disabled && item.set(true)}
                        disabled={item.disabled}
                        className={`px-3 py-1 text-[9px] font-bold uppercase rounded-md transition-all ${
                          item.val 
                            ? 'bg-primary text-black shadow-lg shadow-primary/20' 
                            : item.disabled
                              ? 'opacity-20 cursor-not-allowed text-slate-400'
                              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white'
                        }`}
                      >
                        IKE
                      </button>
                      <button 
                        onClick={() => item.set(false)}
                        className={`px-3 py-1 text-[9px] font-bold uppercase rounded-md transition-all ${!item.val ? 'bg-error text-white' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white'}`}
                      >
                        BELKA
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[9px] leading-relaxed text-slate-500 italic border-t border-white/5 pt-3">
                💡 <span className="font-bold text-primary/80">Info:</span> Akcje giełdowe i Kryptowaluty (ETN) mogą być trzymane wspólnie na jednym koncie IKE Maklerskim. Polskie prawo wyklucza jednak łączenie ich z dedykowanym kontem IKE-Obligacje (EDO).
              </p>
            </div>

            {/* === MONTE CARLO RISK SETTINGS === */}
            <div className="pt-4 border-t border-outline-variant/10">
              <button 
                onClick={() => setIsRiskExpanded(!isRiskExpanded)}
                className="w-full flex items-center justify-between text-[10px] font-label text-outline uppercase tracking-widest hover:text-primary transition-colors hide-for-pdf"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">analytics</span>
                  Parametry Ryzyka (Monte Carlo)
                </div>
                <span className="material-symbols-outlined text-sm transition-transform duration-300" style={{ transform: isRiskExpanded ? 'rotate(180deg)' : 'rotate(0)' }}>
                  expand_more
                </span>
              </button>
              
              <AnimatePresence>
                {isRiskExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                    animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                    className="overflow-hidden space-y-5"
                  >
                    <div className="bg-primary/5 rounded-xl p-4 border border-primary/20 space-y-4">
                      <div className="pt-3 border-t border-primary/10">
                        <label className="text-[9px] font-bold text-outline tracking-wider uppercase block mb-3 text-center">Strategia Rebalancingu</label>
                        <div className="grid grid-cols-2 gap-2 bg-slate-200 dark:bg-black/20 p-1 rounded-xl hide-for-pdf">
                          <button 
                            onClick={() => store.setRebalancingStrategy(0)}
                            className={`py-2 text-[8px] font-black uppercase rounded-lg transition-all ${store.rebalancingStrategy === 0 ? 'bg-primary text-black shadow-md' : 'text-outline/40 hover:text-outline'}`}
                          >
                            Brak (Dryf)
                          </button>
                          <button 
                            onClick={() => store.setRebalancingStrategy(1)}
                            className={`py-2 text-[8px] font-black uppercase rounded-lg transition-all ${store.rebalancingStrategy === 1 ? 'bg-primary text-black shadow-md' : 'text-outline/40 hover:text-outline'}`}
                          >
                            Twardy Roczny
                          </button>
                        </div>
                        <p className="text-[8px] text-center text-outline/50 mt-2 italic px-2">
                          {store.rebalancingStrategy === 1 
                            ? "Wymusza wagi co 12 mies. Generuje Drift Tax na kontach BELKA." 
                            : "Wpłaty dzielone wagami, kapitał rośnie swobodnie."}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        {SaveButton}
      </section>
    );
  }

  // === KROK 2: FAZA DEKUMULACJI ===
  return (
    <section className="space-y-6" style={{ viewTransitionName: 'control-panel' }}>
      <h3 className="text-sm font-label uppercase tracking-widest border-l-2 border-error pl-3" style={{ color: isDarkMode ? '#ffffff' : '#0f172a' }}>
        Parametry Wypłat Emerytalnych
      </h3>
      
      <div className="grid grid-cols-1 gap-6">
        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }} className="group flex flex-col gap-3">
          <div className="flex justify-between items-end">
            <label className="text-[10px] font-label uppercase tracking-wider" style={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : '#475569' }}>Miesięczna Wypłata (w dzisiejszych PLN)</label>
            <span className="text-lg font-headline font-bold" style={{ color: isDarkMode ? '#ffb4ab' : '#dc2626' }}>
              - {formatCurrency(store.monthlyWithdrawal)}
            </span>
          </div>
          <div className="relative flex items-center h-8 px-2 bg-white dark:bg-gray-800/50 rounded-lg border border-outline-variant/5 shadow-sm dark:shadow-none transition-colors group-focus-within:bg-error/10 hide-for-pdf">
            <input className="w-full accent-error" type="range" min="1000" max="30000" step="500" value={store.monthlyWithdrawal} onChange={(e) => store.setMonthlyWithdrawal(Number(e.target.value))} />
          </div>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }} className="group flex flex-col gap-3">
          <div className="flex justify-between items-end">
            <label className="text-[10px] font-label text-slate-600 dark:text-slate-400 uppercase tracking-wider">Długość życia na emeryturze</label>
            <AnimatedCounter value={store.withdrawalYears} isCurrency={false} suffix=" Lat" className="text-lg font-headline font-bold text-tertiary" />
          </div>
          <div className="relative flex items-center h-8 px-2 bg-white dark:bg-gray-800/50 rounded-lg border border-outline-variant/5 shadow-sm dark:shadow-none transition-colors group-focus-within:bg-slate-50 dark:group-focus-within:bg-gray-800/80 hide-for-pdf">
            <input className="w-full accent-tertiary" type="range" min="1" max="50" step="1" value={store.withdrawalYears} onChange={(e) => store.setWithdrawalYears(Number(e.target.value))} />
          </div>
        </motion.div>

        <div className="p-4 rounded-xl bg-white dark:bg-gray-900/40 border border-outline-variant/10 shadow-sm dark:shadow-none">
          <p className="text-[10px] font-label text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-3">Parametry z Kroku 1 (przełącz by edytować)</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-2 rounded bg-slate-50 dark:bg-gray-800/10 border border-outline-variant/5">
              <p className="text-[9px] font-label text-slate-500 dark:text-slate-500 uppercase">Miesięczna Wpłata</p>
              <p className="text-sm font-headline font-bold text-slate-700 dark:text-white/60">{formatCurrency(store.monthlyContribution)}</p>
            </div>
            <div className="p-2 rounded bg-slate-50 dark:bg-gray-800/10 border border-outline-variant/5">
              <p className="text-[9px] font-label text-slate-500 dark:text-slate-500 uppercase">Ilość Aktywów (Kreator)</p>
              <p className="text-sm font-headline font-bold text-slate-700 dark:text-white/60">{store.customPortfolio.length} ETF/Krypto</p>
            </div>
            <div className="p-2 rounded bg-slate-50 dark:bg-gray-800/10 border border-outline-variant/5">
              <p className="text-[9px] font-label text-slate-500 dark:text-slate-500 uppercase">Status Tarczy IKE</p>
              <p className="text-[10px] font-headline font-bold text-primary/70 dark:text-primary/60">
                {[store.isCoreIke ? 'Core' : '', store.isSatIke ? 'Sat' : '', store.isBondsIke ? 'Bon' : ''].filter(Boolean).join(', ') || 'Brak'}
              </p>
            </div>
          </div>
        </div>
      </div>
      {SaveButton}
    </section>
  );
}
