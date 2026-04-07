import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulatorStore } from '../../store/useSimulatorStore';
import { EngineStatusBadge } from '../ui/EngineStatusBadge';

export function Header() {
  const store = useSimulatorStore();

  // Dark Mode Synchronization
  useEffect(() => {
    if (store.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [store.isDarkMode]);
  
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/15 shadow-lg flex justify-between items-center px-4 sm:px-6 h-16 transition-all duration-500 hide-for-pdf">
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
        <h1 className="font-headline font-black text-sm sm:text-lg lg:text-xl tracking-widest sm:tracking-widest text-on-surface">KINETIC<span className="text-primary">_</span>ORACLE</h1>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Engine Status Badge (Now integrated into Header flow) */}
        <div className="hidden md:block">
          <EngineStatusBadge engineType={store.engineType} />
        </div>

        {/* Theme Toggle - Reactive! */}
        <button 
          onClick={store.toggleDarkMode}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-high border border-outline-variant/20 text-on-surface hover:text-primary hover:border-primary/50 transition-all duration-300 shadow-md active:scale-90"
          title={store.isDarkMode ? "Przełącz na tryb jasny" : "Przełącz na tryb ciemny"}
        >
          <AnimatePresence mode="wait">
            <motion.span 
              key={store.isDarkMode ? 'dark' : 'light'}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="material-symbols-outlined text-[20px]"
            >
              {store.isDarkMode ? 'light_mode' : 'dark_mode'}
            </motion.span>
          </AnimatePresence>
        </button>

        <button 
          onClick={() => store.setManagerOpen(true)}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-background transition-all duration-300 group shadow-lg shadow-primary/5 active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">folder_shared</span>
          <span className="text-[10px] font-black uppercase tracking-widest hidden lg:inline">Moje Portfele</span>
        </button>
      </div>
    </header>
  );
}
