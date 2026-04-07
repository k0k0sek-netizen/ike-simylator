import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ExportMenuProps {
  onPrint: () => void;
  onExportPNG: () => void;
  isDarkMode: boolean;
}

export function ExportMenu({ onPrint, onExportPNG, isDarkMode }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative w-full mt-4 hide-for-pdf">
      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)} 
        style={{ 
          backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#0f172a', 
          color: '#ffffff',
          border: isDarkMode ? '1px solid rgba(255,255,255,0.2)' : 'none'
        }}
        className="w-full py-4 rounded-xl font-headline font-bold tracking-widest flex justify-center items-center gap-2 transition-all shadow-lg"
      >
        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
          {isOpen ? 'close' : 'picture_as_pdf'}
        </span>
        {isOpen ? 'ANULUJ' : 'POBIERZ RAPORT PDF'}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full left-0 right-0 mb-4 z-60 flex flex-col gap-2"
          >
            <button
              onClick={() => { onPrint(); setIsOpen(false); }}
              className="w-full p-4 rounded-xl bg-white dark:bg-gray-800 border border-slate-200 dark:border-white/10 shadow-2xl flex items-center gap-3 group hover:border-primary transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined">picture_as_pdf</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold dark:text-white">Pobierz Pełny Raport (PDF)</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Storytelling Finansowy A4</p>
              </div>
            </button>

            <button
              onClick={() => { onExportPNG(); setIsOpen(false); }}
              className="w-full p-4 rounded-xl bg-white dark:bg-gray-800 border border-slate-200 dark:border-white/10 shadow-2xl flex items-center gap-3 group hover:border-secondary transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-colors">
                 <span className="material-symbols-outlined">image</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold dark:text-white">Podziel się wynikiem (Podgląd PNG)</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-tighter">#KineticOracleWrapped</p>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
