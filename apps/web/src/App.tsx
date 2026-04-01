import { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulatorStore } from './store/useSimulatorStore';

import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { StatSummary } from './components/simulator/StatSummary';
import { InteractiveChart } from './components/simulator/InteractiveChart';
import { ControlPanel } from './components/simulator/ControlPanel';
import { YearlyDataTable } from './components/simulator/YearlyDataTable';
import { TemplatesPanel } from './components/simulator/TemplatesPanel';
import { PortfolioManager } from './components/simulator/PortfolioManager';
import { SocialShareCard } from './components/ui/SocialShareCard';
import { AnimatedCounter } from './components/ui/AnimatedCounter';
import { toPng } from 'html-to-image';

export default function App() {
  const [simResults, setSimResults] = useState<any[] | null>(null);

  const wasmModule = useRef<any>(null);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const store = useSimulatorStore();

  useEffect(() => {
    import('engine' as any)
      .then((module) => {
        module.default().then(() => {
          wasmModule.current = module;
          store.setEngineType('WASM');
          console.log('%c[Kinetic Oracle] %c🟢 ZAINICJOWANO SILNIK RUST WASM (Zero-Latency)', 'font-weight: bold; color: #b721ff;', 'color: #4edea3; font-weight: bold;');
        });
      })
      .catch((e) => {
        console.warn('[Kinetic Oracle] Wasm build not found or failed. Switch to JS fallback...', e);
        import('./lib/engineMock.ts')
          .then((module) => {
              wasmModule.current = module;
              store.setEngineType('JS_MOCK');
              console.log('%c[Kinetic Oracle] %c🟡 ZAINICJOWANO SILNIK AWARYJNY JS MOCK', 'font-weight: bold; color: #b721ff;', 'color: #ffc400; font-weight: bold;');
          });
      });
  }, []);

  useEffect(() => {
    if (store.engineType !== 'LOADING' && wasmModule.current) {
      try {
        const inputParams = { 
          monthlyContribution: store.monthlyContribution, 
          currentAge: store.currentAge, 
          retirementAge: store.retirementAge, 
          inflationRate: store.inflationRate, 
          annualStepUp: store.annualStepUp, 
          coreRate: store.coreRate, 
          satRate: store.satRate,
          bondsRate: store.bondsRate,
          isCoreIke: store.isCoreIke,
          isSatIke: store.isSatIke,
          isBondsIke: store.isBondsIke,
          monthlyWithdrawal: store.monthlyWithdrawal,
          withdrawalYears: store.withdrawalYears
        };
        const results = wasmModule.current.generateMultipleScenarios(
          inputParams, 
          store.customCoreWeight,
          store.customSatWeight
        );
        
        setSimResults(results);
      } catch (err) {
        console.error("Wasm calc error:", err);
      }
    }
  }, [
    store.engineType, store.monthlyContribution, store.currentAge, store.retirementAge, store.inflationRate, 
    store.annualStepUp, store.coreRate, store.satRate, store.bondsRate, 
    store.isCoreIke, store.isSatIke, store.isBondsIke,
    store.customCoreWeight, store.customSatWeight, store.monthlyWithdrawal, store.withdrawalYears
  ]);

  const activeScenario = simResults ? simResults[3] : null; 
  const years = Math.max(1, store.retirementAge - store.currentAge);

  // Filtrowanie danych dla wykresu w zależności od aktywnej fazy
  const chartScenario = useMemo(() => {
    if (!activeScenario) return null;
    const allData = activeScenario.yearlyData || [];
    
    if (store.activePhase === 'accumulation') {
      return {
        ...activeScenario,
        yearlyData: allData.slice(0, years),
      };
    } else {
      return {
        ...activeScenario,
        yearlyData: allData.slice(years),
      };
    }
  }, [activeScenario, store.activePhase, years]);

  // Kapitał na moment emerytury (używany w Krok 2 jako "punkt startu")
  const retirementData = activeScenario?.yearlyData?.find((d: any) => d.year === years);
  const capitalAtRetirement = retirementData ? retirementData.nominalBalance : 0;

  const handleShare = async () => {
    if (!shareCardRef.current) return;
    try {
      const dataUrl = await toPng(shareCardRef.current, { cacheBust: true, pixelRatio: 1 });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'kinetic-oracle.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Kinetic Oracle: Moja Symulacja',
          text: 'Sprawdź mój plan IKE w Kinetic Oracle!',
          files: [file]
        });
      } else {
        const link = document.createElement('a');
        link.download = 'kinetic-oracle.png';
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  if (store.engineType === 'LOADING' && !simResults) {
    return (
      <div className="flex w-full h-screen items-center justify-center bg-surface text-on-surface transition-colors duration-500">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <p className="font-headline text-primary tracking-widest uppercase">Uruchamianie Kinetic Oracle... (Silnik)</p>
        </motion.div>
      </div>
    );
  }

  const isAccumulation = store.activePhase === 'accumulation';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ ease: "easeOut", duration: 0.5 }}
      className="bg-background text-on-surface min-h-screen transition-colors duration-500"
    >
      <Header />
      
      <main className="pt-20 px-4 space-y-6 max-w-2xl mx-auto pb-28">
        <SocialShareCard ref={shareCardRef} scenario={activeScenario} />
        
        {/* === PRZEŁĄCZNIK ZAKŁADEK === */}
        <div className="relative flex bg-surface-container-lowest rounded-2xl p-1.5 border border-outline-variant/20 shadow-lg">
          {/* Animated pill background */}
          <motion.div
            className="absolute top-1.5 bottom-1.5 rounded-xl z-0"
            layout
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{
              left: isAccumulation ? '6px' : '50%',
              right: isAccumulation ? '50%' : '6px',
              background: isAccumulation 
                ? 'linear-gradient(135deg, rgba(78, 222, 163, 0.2), rgba(78, 222, 163, 0.05))'
                : 'linear-gradient(135deg, rgba(255, 87, 87, 0.2), rgba(255, 87, 87, 0.05))',
              border: isAccumulation 
                ? '1px solid rgba(78, 222, 163, 0.3)'
                : '1px solid rgba(255, 87, 87, 0.3)',
            }}
          />
          
          <button 
            onClick={() => store.setActivePhase('accumulation')}
            className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 ${
              isAccumulation 
                ? 'text-secondary font-bold' 
                : 'text-outline hover:text-on-surface/70'
            }`}
          >
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
            <span className="text-xs font-label uppercase tracking-widest">Krok 1: Budowa</span>
          </button>
          
          <button 
            onClick={() => store.setActivePhase('decumulation')}
            className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 ${
              !isAccumulation 
                ? 'text-error font-bold' 
                : 'text-outline hover:text-on-surface/70'
            }`}
          >
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>trending_down</span>
            <span className="text-xs font-label uppercase tracking-widest">Krok 2: Wypłaty</span>
          </button>
        </div>

        {/* === KONTEKSTOWY BANNER (Krok 2) === */}
        <AnimatePresence mode="wait">
          {!isAccumulation && (
            <motion.div
              key="decumulation-banner"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-container-low border border-secondary/20">
                <span className="material-symbols-outlined text-2xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>savings</span>
                <div>
                  <p className="text-[10px] font-label text-outline uppercase tracking-wider">Startujesz z kapitałem na emeryturze</p>
                  <AnimatedCounter value={capitalAtRetirement} className="text-xl font-headline font-bold text-secondary" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* === STAT SUMMARY (kontekstowy) === */}
        <StatSummary activeScenario={activeScenario} phase={store.activePhase} />
        
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleShare} 
          className="mt-4 w-full bg-surface-container-highest border border-primary/30 text-primary py-3 rounded-xl font-headline font-bold tracking-widest flex justify-center items-center gap-2 hover:bg-primary/20 transition-colors shadow-lg shadow-primary/5"
        >
          <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>share</span>
          UDOSTĘPNIJ WYNIK
        </motion.button>
        
        {/* === WYKRES (filtrowane dane) === */}
        <InteractiveChart activeScenario={chartScenario} wasmReady={store.engineType !== 'LOADING'} />
        
        {/* === TABELA INSPEKCYJNA (rok po roku) === */}
        <YearlyDataTable 
          yearlyData={chartScenario?.yearlyData || []} 
          startAge={store.activePhase === 'accumulation' ? store.currentAge : store.retirementAge} 
          phase={store.activePhase} 
        />
        
        {/* === PANEL KONTROLNY (kontekstowy) === */}
        <ControlPanel 
          phase={store.activePhase} 
          finalNominal={capitalAtRetirement}
        />
        
        <TemplatesPanel simResults={simResults} />
      </main>

      <PortfolioManager 
        isOpen={store.isManagerOpen} 
        onClose={() => store.setManagerOpen(false)} 
      />
      <BottomNav />
    </motion.div>
  );
}
