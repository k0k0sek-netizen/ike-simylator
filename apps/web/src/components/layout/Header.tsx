import { useSimulatorStore } from '../../store/useSimulatorStore';

export function Header() {
  const store = useSimulatorStore();
  
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#0c1324]/80 backdrop-blur-xl border-b border-outline-variant/15 shadow-[0_20px_40px_-12px_rgba(192,193,255,0.08)] flex justify-between items-center px-6 h-16">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-indigo-200" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
        <h1 className="font-headline font-black text-xl tracking-[0.2em] text-[#c0c1ff]">KINETIC_ORACLE</h1>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Theme Toggle (Hotfix) */}
        <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-high border border-outline-variant/20 text-outline hover:text-primary transition-all duration-300">
          <span className="material-symbols-outlined text-[20px]">light_mode</span>
        </button>

        <button 
          onClick={() => store.setManagerOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-black transition-all duration-300 group shadow-lg shadow-primary/5"
        >
          <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">folder_shared</span>
          <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Moje Portfele</span>
        </button>

        {/* User Profile Hook */}
        <div className="w-10 h-10 rounded-xl border border-primary/20 bg-surface-container overflow-hidden active:scale-95 duration-200 transition-all hover:brightness-125 cursor-pointer shadow-md">
          <img alt="User" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/a/ACg8ocL7J7G1lJ7N5L1G8Z7S8P8Q9R0T1U2V3W4X5Y6Z7=s96-c"/>
        </div>
      </div>
    </header>
  );
}
