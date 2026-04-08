import { useSimulatorStore } from "../../store/useSimulatorStore";
import { EngineStatusBadge } from "../ui/EngineStatusBadge";

export function SettingsView() {
  const store = useSimulatorStore();

  return (
    <div className="min-h-full flex flex-col gap-6 pt-4 pb-24">
      
      <div className="bg-surface-container-low border border-outline-variant/10 p-6 rounded-2xl shadow-sm">
        <h2 className="text-xl font-headline font-black tracking-widest text-on-surface mb-2">USTAWIENIA SYSTEMU</h2>
        <p className="text-sm text-slate-400 font-label mb-6">Diagnostyka aplikacji i zarządzanie silnikami obliczeniowymi Kinetic Wealth.</p>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-white/5">
            <div>
              <p className="font-bold text-sm text-on-surface">Silnik Obliczeniowy</p>
              <p className="text-xs text-slate-500">Status kompilacji i połączenia z modułami Rust WASM.</p>
            </div>
            <EngineStatusBadge engineType={store.engineType} />
          </div>

          <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-white/5">
            <div>
              <p className="font-bold text-sm text-on-surface">PWA Instalacja</p>
              <p className="text-xs text-slate-500">Aplikacja wspiera działanie offline bez dostępu do sieci.</p>
            </div>
            <span className="material-symbols-outlined text-primary/70">auto_awesome</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-white/5">
            <div>
              <p className="font-bold text-sm text-on-surface">Tryb Ciemny</p>
              <p className="text-xs text-slate-500">Wymuś ciemny schemat wizualny interfejsu (dostępne również z nagłówka).</p>
            </div>
            <button 
              onClick={store.toggleDarkMode}
              className="px-3 py-1.5 rounded-lg bg-surface-container-high border border-outline-variant/20 hover:border-primary/50 text-sm transition-all"
            >
              {store.isDarkMode ? 'WŁĄCZONY' : 'WYŁĄCZONY'}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
