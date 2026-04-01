import { forwardRef } from 'react';
import { useSimulatorStore } from '../../store/useSimulatorStore';

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

export const SocialShareCard = forwardRef<HTMLDivElement, SocialShareCardProps>(({ scenario }, ref) => {
  const store = useSimulatorStore();
  const years = Math.max(1, store.retirementAge - store.currentAge);
  const bankruptAge = scenario?.bankruptAge || null;
  const isBankrupt = bankruptAge !== null;

  return (
    <div 
      ref={ref} 
      // Vibe Design, absolute size so that image gets generated with standard Open Graph dimensions
      className="absolute top-[-9999px] left-[-9999px] w-[1200px] h-[630px] bg-surface-container-lowest text-on-surface flex flex-col justify-between p-12 aspect-[1.91/1] overflow-hidden rounded-[40px] border-16 border-surface-container shadow-[0_0_100px_rgba(0,0,0,0.5)] bg-linear-to-br from-[#0c0a1a] to-[#1a1438]"
    >
      <div className="absolute top-[-200px] right-[-200px] w-[800px] h-[800px] bg-primary/20 rounded-full blur-[150px] mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-[-200px] left-[-200px] w-[800px] h-[800px] bg-tertiary/20 rounded-full blur-[150px] mix-blend-screen pointer-events-none"></div>

      <div className="z-10 flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-6xl font-headline font-black text-white tracking-tighter">Kinetic Oracle</h1>
          <p className="text-2xl font-label tracking-widest text-outline uppercase font-bold">Symulacja Fazy Emerytalnej IKE</p>
        </div>
        <div className="px-6 py-3 rounded-full bg-surface-container/80 backdrop-blur-xl border border-outline/30 flex items-center gap-3 shadow-[0_0_30px_rgba(0,0,0,0.3)]">
          <span className="w-4 h-4 rounded-full bg-primary shadow-[0_0_10px_#4edea3] animate-pulse"></span>
          <span className="text-xl font-label text-white uppercase tracking-wider font-bold">Zasilane Wasm</span>
        </div>
      </div>

      <div className="z-10 flex flex-col items-center justify-center my-auto w-full">
        <p className="text-2xl font-label uppercase tracking-widest text-primary/70 mb-4">Prognozowany Kapitał po {years} latach</p>
        <h2 className="text-[120px] leading-tight font-headline font-black text-white tracking-tighter drop-shadow-[0_0_40px_rgba(78,222,163,0.3)]">
          {formatCurrency(scenario?.finalNominal || 0)}
        </h2>
        
        {isBankrupt ? (
          <div className="mt-8 px-8 py-4 bg-error/20 border-2 border-error/50 rounded-2xl flex items-center gap-4">
            <span className="text-5xl">💀</span>
            <div>
              <p className="text-xl font-headline text-error font-bold tracking-wider">KAPITAŁ WYCZERPANY</p>
              <p className="text-2xl text-white font-body mt-1">Bankructwo w wieku {bankruptAge} lat</p>
            </div>
          </div>
        ) : (
          <div className="mt-8 flex items-center gap-6">
            <div className="flex flex-col items-center">
              <span className="text-lg font-label uppercase text-outline tracking-wider">Zysk Netto</span>
              <span className="text-4xl font-headline font-bold text-secondary">+{formatCurrency(scenario?.netProfit || 0)}</span>
            </div>
            <div className="w-px h-16 bg-outline/30"></div>
            <div className="flex flex-col items-center">
              <span className="text-lg font-label uppercase text-[#e4b5ff] tracking-wider font-bold">Tarcza Podatkowa IKE 🛡️</span>
              <span className="text-4xl font-headline font-black text-[#b721ff] drop-shadow-[0_0_15px_rgba(183,33,255,0.4)]">+{formatCurrency(scenario?.taxShield || 0)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="z-10 flex justify-between items-end border-t border-outline/20 pt-8 mt-8">
        <div className="flex gap-12">
          <div>
            <span className="block text-sm font-label uppercase text-outline tracking-widest mb-1">Miesięczna Wpłata</span>
            <span className="text-2xl font-headline text-white">{store.maximizeIkeLimit ? 'MAX IKE' : formatCurrency(store.monthlyContribution)}</span>
          </div>
          <div>
            <span className="block text-sm font-label uppercase text-outline tracking-widest mb-1">Strategia</span>
            <span className="text-2xl font-headline text-white">{scenario?.title || 'Własny'}</span>
          </div>
          <div className="bg-surface-container-low px-4 py-2 rounded-xl">
            <span className="block text-sm font-label uppercase text-outline tracking-widest mb-1">Wypłata</span>
            <span className="text-2xl font-headline text-error font-bold"> - {formatCurrency(store.monthlyWithdrawal)}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-label uppercase text-outline tracking-widest font-bold">Sprawdź sam na:</p>
          <p className="text-2xl font-headline text-primary mt-1 drop-shadow-[0_0_10px_rgba(78,222,163,0.5)]">ike-simulator.space</p>
        </div>
      </div>
    </div>
  );
});

SocialShareCard.displayName = 'SocialShareCard';
