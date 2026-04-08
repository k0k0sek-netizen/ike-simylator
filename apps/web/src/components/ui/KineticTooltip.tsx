import React from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface KineticTooltipProps {
  children: ReactNode;
  content: string;
  title?: string;
  stats?: {
    cagr?: number;
    volatility?: number;
  };
}

export function KineticTooltip({ children, content, title, stats }: KineticTooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  // W logice mobilnej: kliknięcie w child wywoła pokazanie overlay
  // Na desktopie: onMouseEnter/Leave
  
  return (
    <div 
      className="relative flex items-center justify-center cursor-help z-50 group"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onClick={() => setIsVisible(!isVisible)}
    >
      {children}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute top-full mt-2 w-64 p-4 rounded-xl bg-slate-900/95 dark:bg-black/90 backdrop-blur-md border border-outline-variant/20 shadow-2xl z-1000 pointer-events-none origin-top"
          >
            {title && (
              <div className="font-headline font-bold text-white uppercase tracking-widest text-[11px] mb-2 pb-2 border-b border-white/10">
                {title}
              </div>
            )}
            
            {stats && (
              <div className="flex gap-4 mb-3">
                {stats.cagr !== undefined && (
                  <div className="flex flex-col">
                    <span className="text-[9px] text-white/50 uppercase font-bold">Zysk R/R</span>
                    <span className="text-[11px] text-secondary font-black">{stats.cagr.toFixed(1)}%</span>
                  </div>
                )}
                {stats.volatility !== undefined && (
                  <div className="flex flex-col">
                    <span className="text-[9px] text-white/50 uppercase font-bold">Ryzyko (σ)</span>
                    <span className="text-[11px] text-amber-500 font-black">{stats.volatility.toFixed(1)}%</span>
                  </div>
                )}
              </div>
            )}
            
            <p className="text-[10px] text-white/80 leading-relaxed font-body">
              {content}
            </p>

            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900/95 dark:bg-black/90 border-l border-t border-outline-variant/20 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
