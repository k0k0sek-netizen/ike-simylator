export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center h-20 px-4 pb-safe bg-surface-container-low/90 backdrop-blur-2xl border-t border-outline-variant/10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-50 rounded-t-xl hide-for-pdf">
      <a className="flex flex-col items-center justify-center text-primary bg-primary-container/10 rounded-xl px-4 py-1 active:translate-y-0.5 duration-150 transition-colors" href="#">
        <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
        <span className="font-manrope text-[10px] uppercase tracking-widest font-bold">SYMULATOR</span>
      </a>
      <a className="flex flex-col items-center justify-center text-slate-500 hover:text-indigo-300 transition-colors active:translate-y-0.5 duration-150" href="#">
        <span className="material-symbols-outlined mb-1">database</span>
        <span className="font-manrope text-[10px] uppercase tracking-widest font-bold">ZAPISY</span>
      </a>
      <a className="flex flex-col items-center justify-center text-slate-500 hover:text-indigo-300 transition-colors active:translate-y-0.5 duration-150" href="#">
        <span className="material-symbols-outlined mb-1">memory</span>
        <span className="font-manrope text-[10px] uppercase tracking-widest font-bold">WASM</span>
      </a>
      <a className="flex flex-col items-center justify-center text-slate-500 hover:text-indigo-300 transition-colors active:translate-y-0.5 duration-150" href="#">
        <span className="material-symbols-outlined mb-1">auto_awesome</span>
        <span className="font-manrope text-[10px] uppercase tracking-widest font-bold">PWA</span>
      </a>
    </nav>
  );
}
