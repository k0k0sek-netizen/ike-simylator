import { forwardRef } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { useSimulatorStore } from '../../store/useSimulatorStore';
import '../../utils/chartSetup';

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    maximumFractionDigits: 0
  }).format(val || 0);
};

interface SocialShareCardProps {
  scenario: any;
}

const COLORS = {
  primary: '#2563eb',    // Blue-600
  secondary: '#10b981',  // Emerald-500
  accent: '#f59e0b',     // Amber-500
  bg: '#0c0a1a',
  text: '#ffffff',
  textMuted: '#94a3b8',
};

export const SocialShareCard = forwardRef<HTMLDivElement, SocialShareCardProps>(({ scenario }, ref) => {
  const store = useSimulatorStore();
  const years = Math.max(1, store.retirementAge - store.currentAge);
  
  if (!scenario) return null;

  // Data dla Donut (Alokacja)
  const donutData = {
    labels: ['Akcje', 'Krypto', 'EDO'],
    datasets: [{
      data: [store.customCoreWeight, store.customSatWeight, store.customBondsWeight],
      backgroundColor: [COLORS.primary, COLORS.accent, COLORS.secondary],
      borderWidth: 0,
    }]
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false }
    },
    cutout: '75%'
  };

  return (
    <div 
      ref={ref} 
      className="fixed top-[-9999px] left-[-9999px] w-[1200px] h-[630px] flex flex-col justify-between p-16 overflow-hidden rounded-none shadow-none"
      style={{ 
        fontFamily: "'Inter', sans-serif",
        backgroundColor: COLORS.bg,
        color: COLORS.text
      }}
    >
      {/* Background Decor (Using RGBA to avoid modern color functions) */}
      <div 
        className="absolute top-[-300px] right-[-300px] w-[900px] h-[900px] rounded-full blur-[180px] mix-blend-screen"
        style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)' }}
      ></div>
      <div 
        className="absolute bottom-[-300px] left-[-300px] w-[900px] h-[900px] rounded-full blur-[180px] mix-blend-screen"
        style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
      ></div>
      {/* Safe CSS Grid Pattern instead of external texture */}
      <div 
        className="absolute inset-0 opacity-10" 
        style={{ 
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      ></div>

      {/* Header */}
      <div className="relative z-10 flex justify-between items-center">
        <div>
          <h1 className="text-5xl font-black tracking-tighter mb-1 leading-none uppercase" style={{ color: COLORS.text }}>KINETIC ORACLE</h1>
          <p className="text-xl font-bold tracking-[0.3em] uppercase" style={{ color: COLORS.primary }}>Mój Plan Finansowy 80/20</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="px-5 py-2 rounded-full border backdrop-blur-md text-sm font-bold tracking-widest"
               style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)', color: COLORS.textMuted }}>
            ZASILANE RUST WASM
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 grid grid-cols-5 gap-12 items-center my-auto">
        <div className="col-span-3 space-y-8">
          <div>
            <p className="text-xl font-bold uppercase tracking-widest mb-2" style={{ color: COLORS.textMuted }}>Mój kapitał po {years} latach:</p>
            <h2 className="text-[110px] leading-none font-black tracking-tighter drop-shadow-[0_0_30px_rgba(78,222,163,0.2)]" style={{ color: COLORS.text }}>
              {formatCurrency(scenario.finalNominal)}
            </h2>
          </div>

          {/* BELKA HIGHLIGHT */}
          <div className="inline-block relative">
             <div className="absolute inset-0 blur-2xl opacity-20" style={{ backgroundColor: COLORS.secondary }}></div>
             <div className="relative border-l-8 p-6 rounded-r-2xl" 
                  style={{ 
                    borderLeftColor: COLORS.secondary, 
                    background: `linear-gradient(to right, rgba(16, 185, 129, 0.2), transparent)` 
                  }}>
                <p className="text-sm font-black tracking-widest uppercase mb-1" style={{ color: COLORS.secondary }}>🛡️ ZAOSZCZĘDZONY PODATEK BELKI:</p>
                <p className="text-6xl font-black leading-none" style={{ color: COLORS.text }}>
                  {formatCurrency(scenario.taxShield || 0)}
                </p>
             </div>
          </div>
        </div>

        <div className="col-span-2 relative flex flex-col items-center">
          <div className="w-64 h-64 relative">
             <Doughnut data={donutData} options={donutOptions as any} />
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black" style={{ color: COLORS.text }}>{years}</span>
                <span className="text-[10px] font-bold uppercase tracking-tighter" style={{ color: COLORS.textMuted }}>Lat Inwestycji</span>
             </div>
          </div>
          <div className="mt-8 flex gap-4">
             <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.primary }}></span><span className="text-[10px] font-bold uppercase" style={{ color: COLORS.textMuted }}>Świat</span></div>
             <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.accent }}></span><span className="text-[10px] font-bold uppercase" style={{ color: COLORS.textMuted }}>Krypto</span></div>
             <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.secondary }}></span><span className="text-[10px] font-bold uppercase" style={{ color: COLORS.textMuted }}>EDO</span></div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 flex justify-between items-end border-t pt-10" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
        <div className="flex gap-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: COLORS.textMuted }}>Miesięczna Wpłata</p>
            <p className="text-2xl font-black" style={{ color: COLORS.text }}>{formatCurrency(store.monthlyContribution)}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: COLORS.textMuted }}>Strategia</p>
            <p className="text-2xl font-black" style={{ color: COLORS.text }}>{scenario.title || 'Custom 80/20'}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: COLORS.textMuted }}>Zbuduj swój plan:</p>
          <p className="text-2xl font-black tracking-tighter uppercase" style={{ color: COLORS.primary }}>https://kinetic-oracle.app</p>
        </div>
      </div>
    </div>
  );
});

SocialShareCard.displayName = 'SocialShareCard';
