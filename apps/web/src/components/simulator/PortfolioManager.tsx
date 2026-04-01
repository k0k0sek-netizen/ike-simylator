import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulatorStore } from '../../store/useSimulatorStore';
import { loadPortfolios, deletePortfolio } from '../../db';
import type { SavedPortfolio } from '../../db';

interface PortfolioManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PortfolioManager({ isOpen, onClose }: PortfolioManagerProps) {
  const store = useSimulatorStore();
  const [portfolios, setPortfolios] = useState<SavedPortfolio[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPortfolios = async () => {
    setIsLoading(true);
    const data = await loadPortfolios();
    setPortfolios(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchPortfolios();
    }
  }, [isOpen]);

  const handleDelete = async (id: number) => {
    if (confirm('Czy na pewno chcesz usunąć ten portfel?')) {
      await deletePortfolio(id);
      fetchPortfolios();
    }
  };

  const handleLoad = (portfolio: SavedPortfolio) => {
    store.loadScenario(portfolio);
    onClose();
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-surface-container-low border-l border-outline-variant/20 z-60 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container">
              <div>
                <h2 className="text-xl font-headline font-black text-white tracking-tight uppercase">Moje Portfele</h2>
                <p className="text-[10px] font-label text-outline uppercase tracking-widest mt-1">Lokalna Baza Scenariuszy</p>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-outline transition-colors"
              >
                ✕
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoading ? (
                <div className="h-40 flex flex-col items-center justify-center opacity-50">
                  <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3"></div>
                  <p className="text-[10px] font-bold uppercase tracking-widest">Ładowanie bazy...</p>
                </div>
              ) : portfolios.length === 0 ? (
                <div className="h-60 flex flex-col items-center justify-center text-center opacity-30 px-10">
                  <span className="text-4xl mb-4">📂</span>
                  <p className="text-xs font-bold uppercase tracking-widest">Brak zapisanych portfeli</p>
                  <p className="text-[10px] mt-2 leading-relaxed">Użyj przycisku 'Zapisz' pod suwakami, aby utrwalić swój pierwszy scenariusz.</p>
                </div>
              ) : (
                portfolios.map((p) => (
                  <motion.div
                    key={p.id}
                    layoutId={`portfolio-${p.id}`}
                    className={`group relative p-4 rounded-2xl border transition-all duration-300 ${
                      store.loadedScenarioId === p.id 
                        ? 'bg-primary/10 border-primary shadow-lg shadow-primary/5' 
                        : 'bg-surface-container-highest/30 border-outline-variant/10 hover:border-outline-variant/30 hover:bg-surface-container-highest/50'
                    }`}
                  >
                    {/* Active Badge */}
                    {store.loadedScenarioId === p.id && (
                      <div className="absolute -top-2 -left-2 bg-primary text-black text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-lg animate-pulse-subtle">
                        Aktywny
                      </div>
                    )}

                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-headline font-bold text-white tracking-tight">{p.name}</h3>
                          <p className="text-[9px] font-label text-outline uppercase tracking-wider mt-0.5">
                            {new Date(p.created_at).toLocaleDateString('pl-PL')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-label text-outline uppercase tracking-tighter">Kapitał docelowy</p>
                          <p className={`font-headline font-black text-sm ${store.loadedScenarioId === p.id ? 'text-primary' : 'text-white/80'}`}>
                            {formatCurrency(p.final_nominal)}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 text-[8px] font-bold text-outline/60 uppercase">
                        <span className="bg-white/5 px-1.5 py-0.5 rounded">Wpłata: {p.monthly_contribution} zł</span>
                        <span className="bg-white/5 px-1.5 py-0.5 rounded">Ret: {p.retirement_age} l.</span>
                        <span className="bg-white/5 px-1.5 py-0.5 rounded">Św: {p.custom_core_weight}%</span>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handleLoad(p)}
                          className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                            store.loadedScenarioId === p.id 
                              ? 'bg-primary text-black cursor-default opacity-50' 
                              : 'bg-surface-container-highest text-white hover:bg-primary hover:text-black shadow-lg shadow-black/20'
                          }`}
                          disabled={store.loadedScenarioId === p.id}
                        >
                          {store.loadedScenarioId === p.id ? 'Załadowany' : 'Wczytaj Portfel'}
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-error/10 text-error hover:bg-error hover:text-white transition-all border border-error/10"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer Tip */}
            <div className="p-6 bg-surface-container border-t border-outline-variant/10 text-center">
              <p className="text-[9px] text-outline opacity-50 leading-relaxed uppercase tracking-widest">
                Wszystkie dane są przechowywane lokalnie na Twoim urządzeniu.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
