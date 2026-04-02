import { AnimatedCounter } from '../ui/AnimatedCounter';
import { useSimulatorStore } from '../../store/useSimulatorStore';

interface StatSummaryProps {
  activeScenario: any | null;
  phase: 'accumulation' | 'decumulation';
}

export function StatSummary({ activeScenario, phase }: StatSummaryProps) {
  const store = useSimulatorStore();
  const isDarkMode = store.isDarkMode;
  const years = Math.max(1, store.retirementAge - store.currentAge);
  
  // Wartości w momencie przejścia na emeryturę (szczyt akumulacji)
  const retirementData = activeScenario?.yearlyData?.find((d: any) => d.year === years);
  const capitalAtRetirement = retirementData ? retirementData.nominalBalance : (activeScenario ? activeScenario.finalNominal : 0);
  
  // Zysk procentowy na moment emerytury
  const investedAtRetirement = retirementData ? retirementData.totalInvestedNominal : (activeScenario ? activeScenario.totalInvestedNominal : 0);
  const investedRealAtRetirement = retirementData ? (retirementData.totalInvestedReal || 0) : (activeScenario ? activeScenario.totalInvestedReal || 0 : 0);
  const profitAtRetirement = capitalAtRetirement - investedAtRetirement;
  const profitPct = investedAtRetirement > 0 
    ? (profitAtRetirement / investedAtRetirement) * 100 
    : 0;

  // Wartość realna, zysk netto i tarcza podatkowa — z momentu emerytury
  const finalReal = retirementData ? retirementData.realBalance : (activeScenario ? activeScenario.finalReal : 0);
  const taxShield = retirementData ? retirementData.taxShield : (activeScenario ? activeScenario.taxShield : 0);
  const taxPaid = retirementData ? (retirementData.taxPaid || 0) : (activeScenario ? activeScenario.taxPaid || 0 : 0);
  const netProfit = retirementData ? retirementData.netProfit : (activeScenario ? activeScenario.netProfit : 0);
  const bankruptAge = activeScenario ? activeScenario.bankruptAge : null;

  // Dane końcowe scenariusza (po dekumulacji)
  const finalData = activeScenario?.yearlyData?.[activeScenario.yearlyData.length - 1];
  const finalNominalEnd = finalData ? finalData.nominalBalance : 0;
  const totalWithdrawn = store.monthlyWithdrawal * 12 * store.withdrawalYears;
  const survivalYears = bankruptAge 
    ? bankruptAge - store.retirementAge 
    : store.withdrawalYears;

  // === KROK 1: BUDOWA KAPITAŁU ===
  if (phase === 'accumulation') {
    return (
      <section className="mt-2" style={{ viewTransitionName: 'stats-summary' }}>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-label uppercase tracking-widest text-slate-500 dark:text-secondary/70">
            Prognozowany Kapitał ({years} Lat)
          </span>
          <div className="flex items-baseline gap-2">
            <AnimatedCounter 
              value={capitalAtRetirement} 
              style={{ color: isDarkMode ? '#ffffff' : '#0f172a' }}
              className="text-5xl font-headline font-bold tracking-tighter" 
            />
            <AnimatedCounter 
              value={profitPct} 
              isCurrency={false} 
              prefix="+" 
              suffix="%" 
              className="text-secondary font-headline font-bold text-lg" 
            />
          </div>

          {/* Monte Carlo Success Rate Badge */}
          {store.mcResult && (
            <div className="flex items-center gap-2 mt-1">
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${
                store.mcResult.successRate >= 90 ? 'bg-secondary/10 border-secondary/30 text-secondary' :
                store.mcResult.successRate >= 75 ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' :
                'bg-error/10 border-error/30 text-error'
              }`}>
                <span className="material-symbols-outlined text-xs">psychology</span>
                Prawdopodobieństwo Sukcesu: {Math.round(store.mcResult.successRate)}%
              </div>
            </div>
          )}
          
          <div className="flex flex-col gap-3 mt-4">
            <div className="flex justify-between items-center p-4 rounded-xl bg-white dark:bg-gray-800/50 border border-outline-variant/10 transition-all hover:bg-slate-50 dark:hover:bg-gray-800/80 duration-300">
              <div>
                <p className="text-[10px] font-label uppercase tracking-wider" style={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : '#475569' }}>
                  Wartość Realna (Po Inflacji)
                </p>
                <AnimatedCounter 
                  value={finalReal}
                  style={{ color: isDarkMode ? '#ffb2b9' : '#e11d48' }} // tertiary
                  className="text-xl font-headline font-bold" 
                />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-label uppercase tracking-wider" style={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : '#475569' }}>
                  Zysk Netto
                </p>
                <AnimatedCounter 
                  value={netProfit}
                  prefix="+"
                  style={{ color: isDarkMode ? '#c0c1ff' : '#4f46e5' }} // primary
                  className="text-xl font-headline font-bold" 
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center p-4 rounded-xl bg-linear-to-r from-primary/10 to-transparent border border-primary/20 dark:from-[#b721ff]/20 dark:to-transparent dark:border-[#b721ff]/30 transition-all hover:shadow-lg dark:hover:shadow-[0_0_20px_rgba(183,33,255,0.15)] duration-300">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary dark:text-[#b721ff]" style={{ fontVariationSettings: "'FILL' 1" }}>gpp_good</span>
                <p className="text-xs font-label text-slate-700 dark:text-[#e4b5ff] uppercase tracking-wider font-bold">Zaoszczędzony podatek Belki (19%)</p>
              </div>
              <AnimatedCounter 
                value={taxShield}
                prefix="+"
                className="text-xl font-headline font-black text-primary dark:text-[#b721ff] tracking-tighter" 
              />
            </div>

            {/* Paragon od Fiskusa — Zapłacony Podatek */}
            <div className={`flex justify-between items-center p-4 rounded-xl border transition-all duration-300 ${taxPaid > 0 ? 'bg-error/10 border-error/30 hover:shadow-md' : 'bg-secondary/10 border-secondary/30 hover:shadow-md'}`}>
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined ${taxPaid > 0 ? 'text-error' : 'text-secondary'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                  {taxPaid > 0 ? 'receipt_long' : 'verified'}
                </span>
                <p className={`text-xs font-label uppercase tracking-wider font-bold ${taxPaid > 0 ? 'text-error/80' : 'text-secondary/80'}`}>
                  {taxPaid > 0 ? 'Zapłacony podatek (Belka)' : 'Pełna Tarcza Podatkowa!'}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-baseline gap-1">
                  {taxPaid > 0 ? (
                    <AnimatedCounter 
                      value={taxPaid}
                      prefix="- "
                      className="text-xl font-headline font-black text-error tracking-tighter" 
                    />
                  ) : (
                    <span className="text-lg font-headline font-black text-secondary tracking-tight">0 zł 🔥</span>
                  )}
                </div>
                
                {/* Szczegółowe rozbicie podatku (tylko jeśli podatek > 0) */}
                {taxPaid > 0 && (
                  <div className="flex gap-2 text-[9px] font-label text-error/60 uppercase tracking-tighter">
                    {activeScenario.taxPaidCore > 1 && (
                      <span>Świat: {new Intl.NumberFormat('pl-PL').format(Math.round(activeScenario.taxPaidCore))} zł</span>
                    )}
                    {activeScenario.taxPaidSat > 1 && (
                      <span>{activeScenario.taxPaidCore > 1 && "|"} Krypto: {new Intl.NumberFormat('pl-PL').format(Math.round(activeScenario.taxPaidSat))} zł</span>
                    )}
                    {activeScenario.taxPaidBonds > 1 && (
                      <span>{(activeScenario.taxPaidCore > 1 || activeScenario.taxPaidSat > 1) && "|"} EDO: {new Intl.NumberFormat('pl-PL').format(Math.round(activeScenario.taxPaidBonds))} zł</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* === WKŁAD WŁASNY — "Chłopski Rozum" === */}
            <div className="p-4 rounded-xl bg-white dark:bg-gray-900/40 border border-outline-variant/10 space-y-3 shadow-sm dark:shadow-none">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
                <p className="text-[10px] font-label text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Tyle fizycznie przelejesz na konto przez {years} lat
                </p>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[9px] font-label uppercase tracking-wider" style={{ color: isDarkMode ? 'rgba(255,255,255,0.5)' : '#64748b' }}>Łączny Wkład Własny</p>
                  <AnimatedCounter 
                    value={investedAtRetirement}
                    style={{ color: isDarkMode ? '#ffffff' : '#0f172a' }}
                    className="text-lg font-headline font-bold" 
                  />
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-label uppercase tracking-wider" style={{ color: isDarkMode ? 'rgba(255,255,255,0.5)' : '#64748b' }}>Siła Nabywcza Wkładu</p>
                  <AnimatedCounter 
                    value={investedRealAtRetirement}
                    style={{ color: isDarkMode ? '#ffb2b9' : '#e11d48' }}
                    className="text-lg font-headline font-bold" 
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-outline-variant/10">
                <span className="material-symbols-outlined text-secondary text-sm">trending_up</span>
                <p className="text-[10px] font-body text-slate-600 dark:text-slate-400">
                  Wpłacasz <span className="font-bold text-slate-900 dark:text-white">{investedAtRetirement > 0 ? new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(investedAtRetirement) : '0 zł'}</span>, 
                  a otrzymujesz <span className="font-bold text-secondary">{new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(capitalAtRetirement)}</span> kapitału
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // === KROK 2: FAZA WYPŁAT ===
  return (
    <section className="mt-2" style={{ viewTransitionName: 'stats-summary' }}>
      <div className="flex flex-col gap-1">
        <span className="text-xs font-label uppercase tracking-widest text-error/70">
          Faza Wypłat — Przetrwanie Kapitału
        </span>

        {/* Główny wskaźnik: czas przetrwania */}
        <div className="flex items-baseline gap-3">
          <AnimatedCounter 
            value={survivalYears} 
            isCurrency={false}
            suffix=" lat"
            style={{ color: isDarkMode ? '#ffffff' : '#0f172a' }}
            className="text-5xl font-headline font-bold tracking-tighter" 
          />
          <span className="text-sm font-label text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {bankruptAge ? 'do wyczerpania' : 'pełne pokrycie ✓'}
          </span>
          
          {/* Success Rate in Decumulation */}
          {store.mcResult && (
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ml-4 ${
              store.mcResult.successRate >= 90 ? 'bg-secondary/10 border-secondary/30 text-secondary shadow-[0_0_15px_rgba(78,222,163,0.1)]' :
              store.mcResult.successRate >= 75 ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' :
              'bg-error/10 border-error/30 text-error animate-pulse'
            }`}>
              Szansa na sukces: {Math.round(store.mcResult.successRate)}%
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-3 mt-4">
          {/* Kapitał końcowy po dekumulacji */}
          <div className="flex justify-between items-center p-4 rounded-xl bg-white dark:bg-gray-800/50 border border-outline-variant/10 transition-all hover:bg-slate-50 dark:hover:bg-gray-800/80 duration-300">
            <div>
              <p className="text-[10px] font-label text-slate-600 dark:text-slate-400 uppercase tracking-wider">Kapitał Końcowy (Spadek)</p>
              <AnimatedCounter 
                value={finalNominalEnd}
                className="text-xl font-headline font-bold text-tertiary" 
              />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-label text-slate-600 dark:text-slate-400 uppercase tracking-wider">Łącznie Wypłacone</p>
              <AnimatedCounter 
                value={Math.min(totalWithdrawn, capitalAtRetirement + (activeScenario?.netProfit || 0))}
                prefix="-"
                className="text-xl font-headline font-bold text-error" 
              />
            </div>
          </div>

          {/* Kwota miesięczna z waloryzacją */}
          <div className="flex justify-between items-center p-4 rounded-xl bg-white dark:bg-gray-800/50 border border-outline-variant/10 transition-all hover:bg-slate-50 dark:hover:bg-gray-800/80 duration-300">
            <div>
              <p className="text-[10px] font-label text-slate-600 dark:text-slate-400 uppercase tracking-wider">Wypłata Miesięczna (Dziś)</p>
              <AnimatedCounter 
                value={store.monthlyWithdrawal}
                className="text-xl font-headline font-bold text-primary" 
              />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-label text-slate-600 dark:text-slate-400 uppercase tracking-wider">Wypłata Roczna</p>
              <AnimatedCounter 
                value={store.monthlyWithdrawal * 12}
                className="text-xl font-headline font-bold text-primary" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Alert bankructwa */}
      {bankruptAge != null && (
        <div className="mt-4 p-4 rounded-xl bg-error/10 border border-error/30 flex items-center gap-3 shadow-md dark:shadow-none">
          <span className="text-2xl">💀</span>
          <div>
            <p className="text-xs font-label uppercase tracking-wider text-error font-bold">Zagrożenie Bankructwem!</p>
            <p className="text-sm font-body text-error/80 mt-1">Kapitał całkowicie wyczerpie się w wieku <span className="font-headline font-bold text-error">{bankruptAge} lat</span> przy założonych obciążeniach.</p>
          </div>
        </div>
      )}

      {/* Pozytywny alert — kapitał przetrwał */}
      {bankruptAge == null && store.withdrawalYears > 0 && (
        <div className="mt-4 p-4 rounded-xl bg-secondary/10 border border-secondary/30 flex items-center gap-3 shadow-md dark:shadow-none">
          <span className="text-2xl">🏖️</span>
          <div>
            <p className="text-xs font-label uppercase tracking-wider text-secondary font-bold">Kapitał Przetrwał!</p>
            <p className="text-sm font-body text-secondary/80 mt-1">Twój portfel pokryje wypłaty przez pełne <span className="font-headline font-bold text-secondary">{store.withdrawalYears} lat</span> emerytury. Na koniec pozostanie spadek.</p>
          </div>
        </div>
      )}
    </section>
  );
}
