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

  if (phase === 'accumulation') {
    return (
      <section className="space-y-6">
        <h3 className="text-sm font-label uppercase tracking-widest text-outline border-l-2 border-secondary pl-3">
          Parametry Budowy Kapitału
        </h3>
        
        <div className="grid grid-cols-1 gap-6">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="group flex flex-col gap-3"
          >
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-label text-outline uppercase tracking-wider">Miesięczna Wpłata</label>
              <span className="text-lg font-headline font-bold text-primary">
                {store.maximizeIkeLimit ? "~ " + formatCurrency(26000 / 12) : <AnimatedCounter value={store.monthlyContribution} />}
              </span>
            </div>
            <div className={`relative flex items-center h-8 px-2 bg-surface-container-low rounded-lg transition-all duration-500 group-focus-within:bg-surface-container ${store.maximizeIkeLimit ? 'opacity-30 grayscale pointer-events-none' : ''}`}>
              <input className="w-full" type="range" min="100" max="10000" step="100" value={store.monthlyContribution} onChange={(e) => store.setMonthlyContribution(Number(e.target.value))} disabled={store.maximizeIkeLimit} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer mt-1 group-hover:text-primary transition-colors">
              <input type="checkbox" className="w-4 h-4 rounded appearance-none border border-outline bg-surface-container-lowest checked:bg-primary checked:border-primary relative
                after:content-[''] after:absolute after:top-0.5 after:left-1.5 after:w-1 after:h-2 after:border-r-2 after:border-b-2 after:border-black after:-translate-x-1/2 after:rotate-45 after:opacity-0 checked:after:opacity-100 transition-all cursor-pointer"
                checked={store.maximizeIkeLimit} onChange={(e) => store.setMaximizeIkeLimit(e.target.checked)} />
              <span className="text-xs font-label text-outline uppercase tracking-wider select-none font-bold">Maksymalizuj roczny limit IKE (26 000 PLN)</span>
            </label>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }} className="group flex flex-col gap-3">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-label text-outline uppercase tracking-wider">Twój Obecny Wiek</label>
                <AnimatedCounter value={store.currentAge} isCurrency={false} suffix=" Lat" className="text-lg font-headline font-bold text-primary" />
              </div>
              <div className="relative flex items-center h-8 px-2 bg-surface-container-low rounded-lg transition-colors group-focus-within:bg-surface-container">
                <input className="w-full" type="range" min="18" max="75" step="1" value={store.currentAge} onChange={(e) => store.setCurrentAge(Number(e.target.value))} />
              </div>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }} className="group flex flex-col gap-3">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-label text-outline uppercase tracking-wider">Wiek Emerytalny</label>
                <AnimatedCounter value={store.retirementAge} isCurrency={false} suffix=" Lat" className="text-lg font-headline font-bold text-primary" />
              </div>
              <div className="relative flex items-center h-8 px-2 bg-surface-container-low rounded-lg transition-colors group-focus-within:bg-surface-container">
                <input className="w-full" type="range" min="30" max="85" step="1" value={store.retirementAge} onChange={(e) => store.setRetirementAge(Number(e.target.value))} />
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }} className="group flex flex-col gap-3">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-label text-outline uppercase tracking-wider">Stopa Zwrotu (Rdzeń)</label>
                <AnimatedCounter value={store.coreRate} isCurrency={false} suffix="%" className="text-sm font-headline font-bold text-secondary" />
              </div>
              <input className="w-full" type="range" min="0" max="15" step="0.5" value={store.coreRate} onChange={(e) => store.setCoreRate(Number(e.target.value))} />
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }} className="group flex flex-col gap-3">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-label text-outline uppercase tracking-wider">Waloryzacja (Step-Up)</label>
                <AnimatedCounter value={store.annualStepUp} isCurrency={false} suffix="%" className="text-sm font-headline font-bold text-primary" />
              </div>
              <input className="w-full" type="range" min="0" max="15" step="0.5" value={store.annualStepUp} onChange={(e) => store.setAnnualStepUp(Number(e.target.value))} />
            </motion.div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }} className="group flex flex-col gap-3">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-label text-outline uppercase tracking-wider">Inflacja</label>
                <AnimatedCounter value={store.inflationRate} isCurrency={false} suffix="%" className="text-sm font-headline font-bold text-tertiary" />
              </div>
              <input className="w-full" type="range" min="0" max="10" step="0.5" value={store.inflationRate} onChange={(e) => store.setInflationRate(Number(e.target.value))} />
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }} className="group flex flex-col gap-3">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-label text-outline uppercase tracking-wider">Stopa Zwrotu (Satelita)</label>
                <AnimatedCounter value={store.satRate} isCurrency={false} suffix="%" className="text-sm font-headline font-bold text-amber-500" />
              </div>
              <input className="w-full accent-amber-500" type="range" min="0" max="30" step="1" value={store.satRate} onChange={(e) => store.setSatRate(Number(e.target.value))} />
            </motion.div>
          </div>
          
          <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }} className="group flex flex-col gap-3">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-label text-outline uppercase tracking-wider">Alokacja: Rdzeń / Satelita</label>
              <span className="text-sm font-headline font-bold text-primary">
                <AnimatedCounter value={store.customCorePct} isCurrency={false} suffix="%" /> 
                {' / '} 
                <AnimatedCounter value={100 - store.customCorePct} isCurrency={false} suffix="%" />
              </span>
            </div>
            <input className="w-full" type="range" min="0" max="100" step="5" value={store.customCorePct} onChange={(e) => store.setCustomCorePct(Number(e.target.value))} />
          </motion.div>
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
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-[9px] font-label text-outline/60 uppercase">Wpłata</p>
              <p className="text-sm font-headline font-bold text-white/60">{formatCurrency(store.monthlyContribution)}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] font-label text-outline/60 uppercase">Rdzeń / Sat</p>
              <p className="text-sm font-headline font-bold text-white/60">{store.customCorePct}% / {100 - store.customCorePct}%</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] font-label text-outline/60 uppercase">Stopy</p>
              <p className="text-sm font-headline font-bold text-white/60">{store.coreRate}% / {store.satRate}%</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
