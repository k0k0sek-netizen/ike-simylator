import { useEffect, useState, useRef, useMemo } from 'react';
import { flushSync } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulatorStore, getDerivedWasmParams } from './store/useSimulatorStore';

import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { StatSummary } from './components/simulator/StatSummary';
import { InteractiveChart } from './components/simulator/InteractiveChart';
import { ControlPanel } from './components/simulator/ControlPanel';
import { YearlyDataTable } from './components/simulator/YearlyDataTable';
import { TemplatesPanel } from './components/simulator/TemplatesPanel';
import { PortfolioManager } from './components/simulator/PortfolioManager';
import { AIAdvisorPanel } from './components/simulator/AIAdvisorPanel';
import { AnimatedCounter } from './components/ui/AnimatedCounter';
import { ExportMenu } from './components/simulator/ExportMenu';
import { exportToIsolatedPNG } from './utils/exportUtils';
import { triggerPrint } from './utils/pdfExportService';
import { ExportTemplate } from './components/simulator/ExportTemplate';
import { SettingsView } from './components/settings/SettingsView';
import { PortfolioBuilder } from './components/builder/PortfolioBuilder';
import { InfoModal } from './components/ui/InfoModal';

export default function App() {
  const [simResults, setSimResults] = useState<any[] | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const wasmModule = useRef<any>(null);
  const store = useSimulatorStore();

  useEffect(() => {
    import('engine' as any)
      .then((module) => {
        module.default().then(() => {
          wasmModule.current = module;
          store.setEngineType('WASM');
            console.log('%c[Kinetic Wealth] %c🟢 ZAINICJOWANO SILNIK RUST WASM (Zero-Latency)', 'font-weight: bold; color: #b721ff;', 'color: #4edea3; font-weight: bold;');
          });
        })
        .catch((e) => {
          console.warn('[Kinetic Wealth] Wasm build not found or failed. Switch to JS fallback...', e);
          import('./lib/engineMock.ts')
            .then((module) => {
                wasmModule.current = module;
                store.setEngineType('JS_MOCK');
                console.log('%c[Kinetic Wealth] %c🟡 ZAINICJOWANO SILNIK AWARYJNY JS MOCK', 'font-weight: bold; color: #b721ff;', 'color: #ffc400; font-weight: bold;');
            });
        });
    }, []);
  
    useEffect(() => {
      if (store.engineType !== 'LOADING' && wasmModule.current) {
        try {
          const adapterParams = getDerivedWasmParams(store);
          
          // === DIAGNOSTIC LOG: WASM PAYLOAD INJECTION ===
          console.log('[WASM PAYLOAD INJECTION]', {
            coreWeight: adapterParams.coreWeight,
            satWeight: adapterParams.satWeight,
            bondsWeight: adapterParams.bondsWeight,
            coreRate: adapterParams.coreRate,
            satRate: adapterParams.satRate,
            bondsRate: adapterParams.bondsRate,
            coreVol: adapterParams.coreVolatility,
            satVol: adapterParams.satVolatility,
            bondsVol: adapterParams.bondsVolatility,
            isCoreIke: adapterParams.isCoreIke,
            isSatIke: adapterParams.isSatIke,
            isBondsIke: adapterParams.isBondsIke,
            sumWeights: adapterParams.coreWeight + adapterParams.satWeight + adapterParams.bondsWeight,
          });

          const inputParams = { 
            monthlyContribution: store.monthlyContribution, 
            currentAge: store.currentAge, 
            retirementAge: store.retirementAge, 
            inflationRate: store.inflationRate, 
            annualStepUp: store.annualStepUp, 
            coreRate: adapterParams.coreRate, 
            satRate: adapterParams.satRate,
            bondsRate: adapterParams.bondsRate,
            isCoreIke: adapterParams.isCoreIke,
            isSatIke: adapterParams.isSatIke,
            isBondsIke: adapterParams.isBondsIke,
            monthlyWithdrawal: store.monthlyWithdrawal,
            withdrawalYears: store.withdrawalYears,
            coreVolatility: adapterParams.coreVolatility,
            satVolatility: adapterParams.satVolatility,
            bondsVolatility: adapterParams.bondsVolatility,
            iterations: 1, // Deterministyczny używa 1 iteracji
            rebalancingStrategy: store.rebalancingStrategy,
          };
          
          // Deterministyczne przeliczenie
          const results = wasmModule.current.generateMultipleScenarios(
            inputParams, 
            adapterParams.coreWeight,
            adapterParams.satWeight
          );
          
          setSimResults(results);
  
          // Asynchroniczne przeliczenie Monte Carlo
          store.calculateMonteCarlo();
        } catch (err) {
          console.error("Wasm calc error:", err);
        }
      }
    }, [
      store.engineType, store.monthlyContribution, store.currentAge, store.retirementAge, store.inflationRate, 
      store.annualStepUp, store.customPortfolio, store.monthlyWithdrawal, store.withdrawalYears,
      store.rebalancingStrategy
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
  
    const handlePrint = async () => {
      if (activeScenario) {
        await triggerPrint('export-template');
      }
    };
  
    const handleExportPNG = async () => {
      if (activeScenario) {
        await exportToIsolatedPNG(activeScenario);
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
            <p className="font-headline text-primary tracking-widest uppercase">Uruchamianie Kinetic Wealth... (Silnik)</p>
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
        
        <main id="report-target" className="pt-20 px-4 space-y-6 max-w-2xl mx-auto pb-28">
          
          {store.activeTab === 'simulator' && (
            <>
              {/* === PRZEŁĄCZNIK ZAKŁADEK === */}
              <div className="relative flex bg-white dark:bg-gray-800/50 rounded-2xl p-1.5 border border-outline-variant/20 shadow-lg">
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
                  onClick={() => {
                    if (!(document as any).startViewTransition) {
                      store.setActivePhase('accumulation');
                      return;
                    }
                    (document as any).startViewTransition(() => {
                      flushSync(() => {
                        store.setActivePhase('accumulation');
                      });
                    });
                  }}
                  style={{ color: isAccumulation ? (store.isDarkMode ? '#ffffff' : '#0f172a') : (store.isDarkMode ? 'rgba(255,255,255,0.4)' : '#64748b') }}
                  className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 ${
                    isAccumulation ? 'font-bold' : ''
                  }`}
                >
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
                  <span className="text-xs font-label uppercase tracking-widest">Krok 1: Budowa</span>
                </button>
                
                <button 
                  onClick={() => {
                    if (!(document as any).startViewTransition) {
                      store.setActivePhase('decumulation');
                      return;
                    }
                    (document as any).startViewTransition(() => {
                      flushSync(() => {
                        store.setActivePhase('decumulation');
                      });
                    });
                  }}
                  style={{ color: !isAccumulation ? (store.isDarkMode ? '#ffffff' : '#0f172a') : (store.isDarkMode ? 'rgba(255,255,255,0.4)' : '#64748b') }}
                  className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 ${
                    !isAccumulation ? 'font-bold' : ''
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
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-gray-800/10 border border-secondary/20 shadow-sm dark:shadow-none">
                      <span className="material-symbols-outlined text-2xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>savings</span>
                      <div>
                        <p className="text-[10px] font-label uppercase tracking-wider" style={{ color: store.isDarkMode ? 'rgba(255,255,255,0.6)' : '#475569' }}>
                          Startujesz z kapitałem na emeryturze
                        </p>
                        <AnimatedCounter 
                          value={capitalAtRetirement} 
                          style={{ color: store.isDarkMode ? '#ffffff' : '#0f172a' }}
                          className="text-xl font-headline font-bold" 
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* === STAT SUMMARY & PHASE CONTENT === */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={store.activePhase}
                  initial={{ opacity: 0, x: isAccumulation ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isAccumulation ? 20 : -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <StatSummary activeScenario={activeScenario} phase={store.activePhase} />
                </motion.div>
              </AnimatePresence>
              
              {/* === EXPORT MENU (PDF/PNG) === */}
              <ExportMenu 
                onPrint={handlePrint}
                onExportPNG={handleExportPNG}
                isDarkMode={store.isDarkMode}
              />
              
              {/* === WYKRES (filtrowane dane) === */}
              <div className="relative">
                <div className="flex justify-between items-end mb-2">
                  <h3 className="text-[10px] font-label text-outline uppercase tracking-wider">
                    Symulacja Scenariuszy Wasm
                  </h3>
                  <button 
                    onClick={() => setIsInfoOpen(true)}
                    className="flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-secondary/10 text-secondary border border-secondary/20 hover:bg-secondary hover:text-black transition-colors font-bold uppercase"
                  >
                    Demistyfikuj
                    <span className="material-symbols-outlined text-[13px]">help</span>
                  </button>
                </div>
                <InteractiveChart activeScenario={chartScenario} wasmReady={store.engineType !== 'LOADING'} />
              </div>
              
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
              
              {/* === KINETIC AI ADVISOR (Local Edge AI) === */}
              <AIAdvisorPanel />

              <TemplatesPanel simResults={simResults} />
            </>
          )}

          {store.activeTab === 'builder' && (
            <PortfolioBuilder />
          )}

          {store.activeTab === 'history' && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="material-symbols-outlined text-6xl text-slate-500 mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>folder_shared</span>
              <h2 className="text-2xl font-headline font-black tracking-widest text-on-surface mb-2">HISTORIA ZAPISÓW</h2>
              <p className="text-slate-400 font-label mb-6">Przechowalnia scenariuszy.<br/>Zarządzanie poprzez ikony w górnym prawym rogu.</p>
              <button 
                onClick={() => store.setManagerOpen(true)}
                className="px-6 py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-background transition-all font-bold tracking-widest uppercase text-xs"
              >
                Otwórz Menedżer (Legacy)
              </button>
            </div>
          )}

          {store.activeTab === 'settings' && (
            <SettingsView />
          )}

        </main>

      <PortfolioManager 
        isOpen={store.isManagerOpen} 
        onClose={() => store.setManagerOpen(false)} 
      />
      <BottomNav />
      
      {/* EXPORT TEMPLATE (Off-screen) */}
      <ExportTemplate activeScenario={activeScenario} />
      
      <InfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />
    </motion.div>
  );
}
