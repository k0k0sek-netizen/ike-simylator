import { motion } from 'framer-motion';
import { useSimulatorStore } from '../../store/useSimulatorStore';
import { AnimatedCounter } from '../ui/AnimatedCounter';

interface TemplatesPanelProps {
  simResults: any[] | null;
}

export function TemplatesPanel({ simResults }: TemplatesPanelProps) {
  const store = useSimulatorStore();

  return (
    <section className="space-y-4">
      <h3 className="text-sm font-label uppercase tracking-widest text-outline border-l-2 border-primary pl-3">Szablony Portfeli</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div 
          whileHover={{ scale: 1.03, y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => store.setCustomCorePct(100)}
          className="glass-card rounded-2xl p-5 border border-outline-variant/10 relative overflow-hidden group cursor-pointer hover:border-secondary/50 transition-colors"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 blur-3xl rounded-full -mr-12 -mt-12 transition-transform duration-500 group-hover:scale-150"></div>
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-[10px] font-label text-secondary uppercase tracking-[0.2em] font-bold">Portfel Rdzeniowy</span>
              <h4 className="text-lg font-headline font-bold mt-1">Stabilny Horyzont</h4>
            </div>
            <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-outline font-label uppercase">Przewidywany Kapitał</span>
              <span className="text-xs font-bold text-on-surface">
                {simResults ? <AnimatedCounter value={simResults[0].finalNominal} /> : "0 zł"}
              </span>
            </div>
          </div>
          <button className="mt-6 w-full py-3 bg-secondary/10 group-hover:bg-secondary/20 text-secondary text-[10px] font-bold uppercase tracking-widest rounded transition-all">Wybierz Ten Model</button>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.03, y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => store.setCustomCorePct(0)}
          className="glass-card rounded-2xl p-5 border border-outline-variant/10 relative overflow-hidden group cursor-pointer hover:border-tertiary/50 transition-colors"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-tertiary/5 blur-3xl rounded-full -mr-12 -mt-12 transition-transform duration-500 group-hover:scale-150"></div>
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-[10px] font-label text-tertiary uppercase tracking-[0.2em] font-bold">Portfel Satelitarny</span>
              <h4 className="text-lg font-headline font-bold mt-1">Poszukiwacz Alfy</h4>
            </div>
            <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-outline font-label uppercase">Przewidywany Kapitał</span>
              <span className="text-xs font-bold text-on-surface">
                {simResults ? <AnimatedCounter value={simResults[2].finalNominal} /> : "0 zł"}
              </span>
            </div>
          </div>
          <button className="mt-6 w-full py-3 bg-tertiary/10 group-hover:bg-tertiary/20 text-tertiary text-[10px] font-bold uppercase tracking-widest rounded transition-all">Wybierz Ten Model</button>
        </motion.div>
      </div>
    </section>
  );
}
