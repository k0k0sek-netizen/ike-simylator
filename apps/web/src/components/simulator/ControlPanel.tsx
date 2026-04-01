import { motion } from 'framer-motion';
import { useSimulatorStore } from '../../store/useSimulatorStore';
import { AnimatedCounter } from '../ui/AnimatedCounter';

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    maximumFractionDigits: 0
  }).format(val || 0);
};

interface ControlPanelProps {
  phase: 'accumulation' | 'decumulation';
}

export function ControlPanel({ phase }: ControlPanelProps) {
  const store = useSimulatorStore();

  const checkIkeWarning = () => {
    const counts = [store.isCoreIke, store.isSatIke, store.isBondsIke].filter(Boolean).length;
    if (counts > 1) {
      return (
        <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex gap-3 items-start animate-pulse-subtle">
          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white mt-0.5">!</div>
          <p className="text-[10px] leading-relaxed text-blue-200">
            <span className="font-bold text-blue-400 uppercase block mb-1">Uwaga prawna</span>
            W Polsce jedna osoba może posiadać tylko jedno konto IKE. Symulacja powyżej zakłada portfel rodzinny (np. Twój i małżonka).
          </p>
        </div>
      );
    }
    return null;
  };

  if (phase === 'accumulation') {
    return (
      <section className="space-y-8">
        <div>
          <h3 className="text-sm font-label uppercase tracking-widest text-outline border-l-2 border-secondary pl-3 mb-6">
            Parametry Budowy Kapitału
          </h3>
          
          <div className="grid grid-cols-1 gap-6">
            <motion.div whileHover={{ scale: 1.01 }} className="group flex flex-col gap-3">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-label text-outline uppercase tracking-wider">Miesięczna Wpłata</label>
                <div className="flex items-baseline gap-1">
                  <AnimatedCounter value={store.monthlyContribution} className="text-xl font-headline font-bold text-primary" />
                </div>
              </div>
              <div className="relative flex items-center h-10 px-3 bg-surface-container-low rounded-xl transition-all duration-300 group-focus-within:bg-primary/5 border border-outline-variant/10 group-focus-within:border-primary/30">
                <input className="w-full h-1 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary" type="range" min="100" max="15000" step="100" value={store.monthlyContribution} onChange={(e) => store.setMonthlyContribution(Number(e.target.value))} />
              </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-4">
              <motion.div whileHover={{ scale: 1.01 }} className="group flex flex-col gap-3">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-label text-outline uppercase tracking-wider">Twój Wiek</label>
                  <AnimatedCounter value={store.currentAge} isCurrency={false} suffix=" Lat" className="text-lg font-headline font-bold text-primary" />
                </div>
                <div className="relative flex items-center h-8 px-2 bg-surface-container-low rounded-lg border border-outline-variant/10">
                  <input className="w-full accent-primary" type="range" min="18" max="70" step="1" value={store.currentAge} onChange={(e) => store.setCurrentAge(Number(e.target.value))} />
                </div>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.01 }} className="group flex flex-col gap-3">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-label text-outline uppercase tracking-wider">Emerytura</label>
                  <AnimatedCounter value={store.retirementAge} isCurrency={false} suffix=" Lat" className="text-lg font-headline font-bold text-primary" />
                </div>
                <div className="relative flex items-center h-8 px-2 bg-surface-container-low rounded-lg border border-outline-variant/10">
                  <input className="w-full accent-primary" type="range" min="30" max="85" step="1" value={store.retirementAge} onChange={(e) => store.setRetirementAge(Number(e.target.value))} />
                </div>
              </motion.div>
            </div>

            <div className="space-y-4 pt-4 border-t border-outline-variant/10">
              <p className="text-[10px] font-label text-outline uppercase tracking-wider">Alokacja Portfela (Suma 100%)</p>
              
              {/* CORE Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] uppercase font-bold">
                  <span className="text-secondary">Świat (Akcje)</span>
                  <span className="text-secondary">{store.customCoreWeight}%</span>
                </div>
                <input className="w-full accent-secondary" type="range" min="0" max="100" step="5" value={store.customCoreWeight} onChange={(e) => store.setAllocation(Number(e.target.value), undefined, undefined)} />
              </div>

              {/* SAT Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] uppercase font-bold">
                  <span className="text-amber-500">Krypto / Satelita</span>
                  <span className="text-amber-500">{store.customSatWeight}%</span>
                </div>
                <input className="w-full accent-amber-500" type="range" min="0" max="100" step="5" value={store.customSatWeight} onChange={(e) => store.setAllocation(undefined, Number(e.target.value), undefined)} />
              </div>

              {/* BONDS Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] uppercase font-bold">
                  <span className="text-indigo-400">Obligacje EDO</span>
                  <span className="text-indigo-400">{store.customBondsWeight}%</span>
                </div>
                <input className="w-full accent-indigo-400" type="range" min="0" max="100" step="5" value={store.customBondsWeight} onChange={(e) => store.setAllocation(undefined, undefined, Number(e.target.value))} />
              </div>
            </div>

            {/* Stopy zwrotu */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 pt-4 border-t border-outline-variant/10">
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-label text-outline uppercase">Zysk Świat</label>
                <div className="flex items-center gap-2">
                  <input className="w-full accent-secondary" type="range" min="0" max="15" step="0.5" value={store.coreRate} onChange={(e) => store.setCoreRate(Number(e.target.value))} />
                  <span className="text-[10px] font-bold text-secondary min-w-[30px]">{store.coreRate}%</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-label text-outline uppercase">Zysk Krypto</label>
                <div className="flex items-center gap-2">
                  <input className="w-full accent-amber-500" type="range" min="0" max="40" step="1" value={store.satRate} onChange={(e) => store.setSatRate(Number(e.target.value))} />
                  <span className="text-[10px] font-bold text-amber-500 min-w-[30px]">{store.satRate}%</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-label text-outline uppercase">Zysk EDO</label>
                <div className="flex items-center gap-2">
                  <input className="w-full accent-indigo-400" type="range" min="0" max="10" step="0.5" value={store.bondsRate} onChange={(e) => store.setBondsRate(Number(e.target.value))} />
                  <span className="text-[10px] font-bold text-indigo-400 min-w-[30px]">{store.bondsRate}%</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-label text-outline uppercase">Waloryzacja (Step-up)</label>
                <div className="flex items-center gap-2">
                  <input className="w-full accent-primary" type="range" min="0" max="15" step="0.5" value={store.annualStepUp} onChange={(e) => store.setAnnualStepUp(Number(e.target.value))} />
                  <span className="text-[10px] font-bold text-primary min-w-[30px]">{store.annualStepUp}%</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-label text-outline uppercase">Inflacja</label>
                <div className="flex items-center gap-2">
                  <input className="w-full accent-tertiary" type="range" min="0" max="15" step="0.5" value={store.inflationRate} onChange={(e) => store.setInflationRate(Number(e.target.value))} />
                  <span className="text-[10px] font-bold text-tertiary min-w-[30px]">{store.inflationRate}%</span>
                </div>
              </div>
            </div>

            {/* Sekcja IKE */}
            <div className="pt-6 border-t border-outline-variant/10">
              <label className="text-[10px] font-label text-outline uppercase tracking-wider block mb-4">Typ konta (Tarcza IKE)</label>
              <div className="space-y-3">
                {[
                  { label: 'Świat (np. mBank/XTB)', val: store.isCoreIke, set: store.setIsCoreIke, color: 'border-secondary/30 text-secondary' },
                  { label: 'Krypto (np. Bossa)', val: store.isSatIke, set: store.setIsSatIke, color: 'border-amber-500/30 text-amber-500' },
                  { label: 'EDO (PKO BP)', val: store.isBondsIke, set: store.setIsBondsIke, color: 'border-indigo-400/30 text-indigo-400' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className={`text-[10px] font-bold uppercase ${item.color.split(' ')[1]}`}>{item.label}</span>
                    <div className="flex bg-surface-container-highest/50 rounded-lg p-0.5 border border-outline-variant/10">
                      <button 
                        onClick={() => item.set(true)}
                        className={`px-3 py-1 text-[9px] font-bold uppercase rounded-md transition-all ${item.val ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-outline hover:text-white'}`}
                      >
                        IKE
                      </button>
                      <button 
                        onClick={() => item.set(false)}
                        className={`px-3 py-1 text-[9px] font-bold uppercase rounded-md transition-all ${!item.val ? 'bg-error text-white' : 'text-outline hover:text-white'}`}
                      >
                        BELKA
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {checkIkeWarning()}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // === KROK 2: FAZA DEKUMULACJI ===
  return (
    <section className="space-y-6">
      <h3 className="text-sm font-label uppercase tracking-widest text-outline border-l-2 border-error pl-3">
        Parametry Wypłat Emerytalnych
      </h3>
      
      <div className="grid grid-cols-1 gap-6">
        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }} className="group flex flex-col gap-3">
          <div className="flex justify-between items-end">
            <label className="text-[10px] font-label text-outline uppercase tracking-wider">Miesięczna Wypłata (w dzisiejszych PLN)</label>
            <span className="text-lg font-headline font-bold text-error">
              - {formatCurrency(store.monthlyWithdrawal)}
            </span>
          </div>
          <div className="relative flex items-center h-8 px-2 bg-surface-container-low rounded-lg transition-colors group-focus-within:bg-error/10">
            <input className="w-full accent-error" type="range" min="1000" max="30000" step="500" value={store.monthlyWithdrawal} onChange={(e) => store.setMonthlyWithdrawal(Number(e.target.value))} />
          </div>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }} className="group flex flex-col gap-3">
          <div className="flex justify-between items-end">
            <label className="text-[10px] font-label text-outline uppercase tracking-wider">Długość życia na emeryturze</label>
            <AnimatedCounter value={store.withdrawalYears} isCurrency={false} suffix=" Lat" className="text-lg font-headline font-bold text-tertiary" />
          </div>
          <div className="relative flex items-center h-8 px-2 bg-surface-container-low rounded-lg transition-colors group-focus-within:bg-surface-container">
            <input className="w-full" type="range" min="1" max="50" step="1" value={store.withdrawalYears} onChange={(e) => store.setWithdrawalYears(Number(e.target.value))} />
          </div>
        </motion.div>

        {/* Podgląd kluczowych parametrów akumulacji (read-only w Kroku 2) */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/10">
          <p className="text-[10px] font-label text-outline uppercase tracking-wider mb-3">Parametry z Kroku 1 (przełącz by edytować)</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-2 rounded bg-surface-container-low/30 border border-outline-variant/5">
              <p className="text-[9px] font-label text-outline/60 uppercase">Miesięczna Wpłata</p>
              <p className="text-sm font-headline font-bold text-white/60">{formatCurrency(store.monthlyContribution)}</p>
            </div>
            <div className="p-2 rounded bg-surface-container-low/30 border border-outline-variant/5">
              <p className="text-[9px] font-label text-outline/60 uppercase">Alokacja (Rdzeń/Sat/Bon)</p>
              <p className="text-sm font-headline font-bold text-white/60">{store.customCoreWeight}% / {store.customSatWeight}% / {store.customBondsWeight}%</p>
            </div>
            <div className="p-2 rounded bg-surface-container-low/30 border border-outline-variant/5">
              <p className="text-[9px] font-label text-outline/60 uppercase">Stopy (Rdzeń/Sat/Bon)</p>
              <p className="text-sm font-headline font-bold text-white/60">{store.coreRate}% / {store.satRate}% / {store.bondsRate}%</p>
            </div>
            <div className="p-2 rounded bg-surface-container-low/30 border border-outline-variant/5">
              <p className="text-[9px] font-label text-outline/60 uppercase">Status Tarczy IKE</p>
              <p className="text-[10px] font-headline font-bold text-primary/60">
                {[store.isCoreIke ? 'Core' : '', store.isSatIke ? 'Sat' : '', store.isBondsIke ? 'Bon' : ''].filter(Boolean).join(', ') || 'Brak'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
