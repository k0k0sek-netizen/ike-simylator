import { useSimulatorStore } from '../../store/useSimulatorStore';

export function BottomNav() {
  const store = useSimulatorStore();

  const getTabClass = (tabName: string) => {
    return store.activeTab === tabName 
      ? "flex flex-col items-center justify-center text-primary bg-primary-container/10 rounded-xl px-4 py-1 duration-150 transition-colors"
      : "flex flex-col items-center justify-center text-slate-500 hover:text-indigo-300 transition-colors active:translate-y-0.5 duration-150";
  };

  const getIconStyle = (tabName: string) => {
    return store.activeTab === tabName ? { fontVariationSettings: "'FILL' 1" } : {};
  };

  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center h-20 px-4 pb-safe bg-surface-container-low/90 backdrop-blur-2xl border-t border-outline-variant/10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-50 rounded-t-xl hide-for-pdf">
      <button className={getTabClass('simulator')} onClick={() => store.setActiveTab('simulator')}>
        <span className="material-symbols-outlined mb-1" style={getIconStyle('simulator')}>analytics</span>
        <span className="font-manrope text-[10px] uppercase tracking-widest font-bold">SYMULATOR</span>
      </button>
      <button className={getTabClass('builder')} onClick={() => store.setActiveTab('builder')}>
        <span className="material-symbols-outlined mb-1" style={getIconStyle('builder')}>architecture</span>
        <span className="font-manrope text-[10px] uppercase tracking-widest font-bold">KREATOR</span>
      </button>
      <button className={getTabClass('history')} onClick={() => store.setActiveTab('history')}>
        <span className="material-symbols-outlined mb-1" style={getIconStyle('history')}>folder_shared</span>
        <span className="font-manrope text-[10px] uppercase tracking-widest font-bold">ZAPISY</span>
      </button>
      <button className={getTabClass('settings')} onClick={() => store.setActiveTab('settings')}>
        <span className="material-symbols-outlined mb-1" style={getIconStyle('settings')}>settings</span>
        <span className="font-manrope text-[10px] uppercase tracking-widest font-bold">USTAW.</span>
      </button>
    </nav>
  );
}
