import { motion } from 'framer-motion';
import { useSimulatorStore } from '../../store/useSimulatorStore';

interface TemplatesPanelProps {
  // simResults usunięte z logiki kafelków, ale zostawiam w propsach dla kompatybilności App.tsx (lub usunę później)
  simResults?: any[] | null;
}

export function TemplatesPanel({}: TemplatesPanelProps) {
  const store = useSimulatorStore();

  const applyTemplate = (
    core: number, sat: number, bonds: number,
    coreRate: number, satRate: number, bondsRate: number,
    isCoreIke: boolean, isSatIke: boolean, isBondsIke: boolean
  ) => {
    store.setAllocation(core, sat, bonds);
    store.setCoreRate(coreRate);
    store.setSatRate(satRate);
    store.setBondsRate(bondsRate);
    store.setIsCoreIke(isCoreIke);
    store.setIsSatIke(isSatIke);
    store.setIsBondsIke(isBondsIke);
  };

  const templates = [
    {
      id: 'classic',
      name: 'Klasyka (Bogleheads)',
      desc: 'Spokojny, klasyczny portfel długoterminowy.',
      icon: 'verified_user',
      color: 'secondary',
      config: [80, 0, 20, 7, 15, 1.5, true, true, false], // c, s, b, cr, sr, br, cI, sI, bI
    },
    {
      id: 'modern-classic',
      name: 'Nowoczesna Klasyka (80/20)',
      desc: 'Globalny wzrost + mocny akcent krypto.',
      icon: 'trending_up',
      color: 'primary',
      config: [80, 20, 0, 7, 15, 1.5, true, false, false],
    },
    {
      id: 'barbell',
      name: 'Barbell (Sztanga)',
      desc: 'Maksymalne bezpieczeństwo + kryptowalutowy "moonshot".',
      icon: 'fitness_center',
      color: 'indigo-400',
      config: [0, 20, 80, 7, 15, 1.5, true, true, true],
    },
    {
      id: 'allweather',
      name: 'All-Weather (Dalio Lite)',
      desc: 'Portfel odporny na zawirowania gospodarcze.',
      icon: 'wb_sunny',
      color: 'amber-500',
      config: [40, 10, 50, 7, 15, 1.5, true, false, true],
    },
    {
      id: 'couch-potato',
      name: 'Kanapowiec (100% Bez)',
      desc: 'Ochrona przed inflacją bez zmienności.',
      icon: 'weekend',
      color: 'tertiary',
      config: [0, 0, 100, 7, 15, 1.5, false, false, true],
    }
  ];

  return (
    <section className="space-y-6 pt-8 border-t border-outline-variant/10">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-outline/50">layers</span>
        <h3 className="text-sm font-label uppercase tracking-widest text-outline">Gotowe Strategie Inwestycyjne</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((tpl) => (
          <motion.div 
            key={tpl.id}
            whileHover={{ scale: 1.03, y: -5 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => applyTemplate(
              tpl.config[0] as number, tpl.config[1] as number, tpl.config[2] as number,
              tpl.config[3] as number, tpl.config[4] as number, tpl.config[5] as number,
              tpl.config[6] as boolean, tpl.config[7] as boolean, tpl.config[8] as boolean
            )}
            className="glass-card rounded-2xl p-5 border border-outline-variant/10 relative overflow-hidden group cursor-pointer hover:border-primary/40 transition-colors bg-surface-container-lowest h-full flex flex-col"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 opacity-5 blur-3xl rounded-full -mr-12 -mt-12 transition-transform duration-500 group-hover:scale-150 bg-${tpl.color}`}></div>
            
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg bg-surface-container-low border border-outline-variant/10 text-${tpl.color}`}>
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>{tpl.icon}</span>
              </div>
            </div>

            <h4 className="text-sm font-headline font-bold text-white group-hover:text-primary transition-colors">{tpl.name}</h4>
            <p className="text-[10px] text-outline leading-relaxed mt-2 grow">{tpl.desc}</p>
            
            <div className="mt-4 pt-4 border-t border-outline-variant/5 flex justify-between items-center">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-secondary" title="Świat"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Krypto"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" title="EDO"></div>
              </div>
              <span className="text-[9px] font-label text-outline/60 uppercase tracking-widest group-hover:text-primary transition-colors">Aplikuj Plan →</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
