import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSimulatorStore } from '../../store/useSimulatorStore';
import { AVAILABLE_INSTRUMENTS } from '../../config/instruments';
import { KineticTooltip } from '../ui/KineticTooltip';
import { getDerivedWasmParams } from '../../store/useSimulatorStore';

export function PortfolioBuilder() {
  const store = useSimulatorStore();
  const portfolio = store.customPortfolio;

  // Laczna waga
  const sumWeights = portfolio.reduce((sum, item) => sum + item.weight, 0);
  const isValid = sumWeights === 100;

  // Pobranie danych agregacyjnych i przełożnienie ich do frontowych parametrów edukacyjnych
  // na podstawie translacji adaptera Wasm, którą napisaliśmy.
  // Adapter bierze stan całego store'a jako parametr, wiec budujemy minimalnego mocka
  const adapterResult = useMemo(() => getDerivedWasmParams(store), [portfolio]);

  const toggleInstrument = (instrumentId: string) => {
    if (portfolio.some(p => p.instrumentId === instrumentId)) {
      store.setCustomPortfolio(portfolio.filter(p => p.instrumentId !== instrumentId));
    } else {
      store.setCustomPortfolio([...portfolio, { instrumentId, weight: 0 }]);
    }
  };

  const updateWeight = (instrumentId: string, weight: number) => {
    store.setCustomPortfolio(portfolio.map(p => 
      p.instrumentId === instrumentId ? { ...p, weight } : p
    ));
  };

  // Całkowite rzutowane parametry łącząc 3 wiadra silnika 
  // (Core + Sat + Bonds) by je pokazać w UI summary.
  const totalCagr = ((adapterResult.coreRate * adapterResult.coreWeight) + 
                    (adapterResult.satRate * adapterResult.satWeight) + 
                    (adapterResult.bondsRate * adapterResult.bondsWeight)) / sumWeights || 0;
                    
  const totalVol = ((adapterResult.coreVolatility * adapterResult.coreWeight) + 
                   (adapterResult.satVolatility * adapterResult.satWeight) + 
                   (adapterResult.bondsVolatility * adapterResult.bondsWeight)) / sumWeights || 0;

  return (
    <section className="space-y-6 max-w-3xl border border-outline-variant/10 bg-white/50 dark:bg-slate-900/30 backdrop-blur-xl p-4 sm:p-6 rounded-3xl" style={{ viewTransitionName: 'builder-panel' }}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h2 className="text-xl font-headline font-black uppercase text-primary tracking-widest flex items-center gap-2">
            <span className="material-symbols-outlined">architecture</span>
            Kreator Portfela
          </h2>
          <p className="text-xs text-slate-500 mt-1">Skomponuj własną strategię rynkową</p>
        </div>
        
        <div className={`px-4 py-2 rounded-xl flex flex-col items-center border ${isValid ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-error/10 border-error/20 text-error'}`}>
          <span className="text-[10px] font-bold uppercase tracking-wider">Złota Zasada (Σ)</span>
          <span className="text-lg font-black">{sumWeights}% / 100%</span>
        </div>
      </div>

      {!isValid && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-error/10 border border-error/20 rounded-lg text-error text-xs text-center font-bold uppercase">
          {sumWeights > 100 
            ? `Przekroczono limit o ${sumWeights - 100}%. Zredukuj wagi aktywów.`
            : `Brakuje ${100 - sumWeights}% do pełnego portfela.`}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AVAILABLE_INSTRUMENTS.map((inst) => {
          const isSelected = portfolio.some(p => p.instrumentId === inst.id);
          const pItem = portfolio.find(p => p.instrumentId === inst.id);

          return (
            <motion.div 
              key={inst.id}
              whileHover={{ scale: 1.01 }}
              className={`p-4 rounded-2xl border transition-colors ${isSelected ? 'bg-primary/5 border-primary/30' : 'bg-white dark:bg-slate-800/50 border-outline-variant/10 hover:border-primary/20'}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => toggleInstrument(inst.id)}
                    className={`w-6 h-6 flex items-center justify-center rounded-md border ${isSelected ? 'bg-primary border-primary text-black' : 'border-outline text-transparent'}`}
                  >
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  </button>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                      {inst.ticker}
                      <KineticTooltip content={inst.description} title={inst.name} stats={{ cagr: inst.expectedCagr, volatility: inst.volatility }}>
                        <span className="material-symbols-outlined text-[14px] text-outline/50 hover:text-primary transition-colors cursor-pointer">info</span>
                      </KineticTooltip>
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">{inst.category}</span>
                  </div>
                </div>
                {inst.isIkeEligible && <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-secondary/10 text-secondary uppercase border border-secondary/20">Możliwe IKE</span>}
              </div>

              {isSelected && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="pt-3 border-t border-primary/10 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-outline uppercase font-bold text-[9px] tracking-wider">Waga ({pItem?.weight}%)</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" step="5" 
                    value={pItem?.weight || 0}
                    onChange={(e) => updateWeight(inst.id, Number(e.target.value))}
                    className="w-full accent-primary" 
                  />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {portfolio.length > 0 && isValid && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 p-4 sm:p-5 bg-slate-100 dark:bg-black/30 rounded-2xl border border-outline-variant/10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Parametry Symulacji Silnika Oczekiwane (Zsumowane Wasm)</span>
              <div className="flex gap-6 mt-2">
                <span className="text-sm font-black text-secondary">Zzysk: {totalCagr.toFixed(2)}%</span>
                <span className="text-sm font-black text-amber-500">Zmienność σ: {totalVol.toFixed(2)}%</span>
              </div>
            </div>
            
            <button
              onClick={() => store.setActiveTab('simulator')}
              className="px-6 py-3 bg-primary text-black rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex gap-2 items-center"
            >
              Uruchom Symulację
              <span className="material-symbols-outlined text-[16px]">play_arrow</span>
            </button>
          </div>
        </motion.div>
      )}
    </section>
  );
}
