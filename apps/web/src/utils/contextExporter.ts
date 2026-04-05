import { useSimulatorStore } from '../store/useSimulatorStore';

/**
 * Przekształca stan symulacji na skondensowany kontekst tekstowy dla LLM.
 * Pozwala doradcy AI na "zrozumienie" konkretnej sytuacji finansowej użytkownika.
 */
export function exportSimulationContext(): string {
  // Pobieramy świeży, aktualny stan bezpośrednio ze Store, aby uniknąć problemu "stale closure"
  const state = useSimulatorStore.getState();
  
  const {
    monthlyContribution,
    currentAge,
    retirementAge,
    inflationRate,
    customCoreWeight,
    customSatWeight,
    customBondsWeight,
    isCoreIke,
    isSatIke,
    isBondsIke,
    rebalancingStrategy,
    mcResultAccumulation,
    mcResultDecumulation,
    activePhase,
    monthlyWithdrawal,
    withdrawalYears
  } = state;

  const strategyName = rebalancingStrategy === 1 ? "Twardy Roczny Rebalancing" : "Brak Rebalancingu";
  const horizon = retirementAge - currentAge;

  let context = `--- KONTEKST SYMULACJI FINANSOWEJ ---
Użytkownik: Wiek ${currentAge} lat, planowana emerytura w wieku ${retirementAge} lat (Horyzont: ${horizon} lat).
Budowa kapitału: Wpłata ${monthlyContribution} PLN/mc, wzrost wpłaty o inflację (${inflationRate}%).

ALOKACJA PORTFELA (BARDZO WAŻNE):
- Akcje Świat: ${customCoreWeight}% | STATUS TARCZY: ${isCoreIke ? 'IKE WŁĄCZONE (0% PODATKU)' : 'BRAK IKE (19% PODATKU BELKI)'}
- Kryptowaluty: ${customSatWeight}% | STATUS TARCZY: ${isSatIke ? 'IKE WŁĄCZONE (0% PODATKU)' : 'BRAK IKE (19% PODATKU BELKI)'}
- Obligacje EDO: ${customBondsWeight}% | STATUS TARCZY: ${isBondsIke ? 'IKE WŁĄCZONE (0% PODATKU)' : 'BRAK IKE (19% PODATKU BELKI)'}

STRATEGIA: ${strategyName}

FAZA WYPŁAT:
Planowana wypłata: ${monthlyWithdrawal} PLN/mc (w dzisiejszej sile nabywczej) przez ${withdrawalYears} lat.
`;

  // TWARDY RESET IZOLACJI - rygorystyczny wybór slotu
  const activeMcResult = activePhase === 'decumulation' ? mcResultDecumulation : mcResultAccumulation;

  if (activeMcResult && activeMcResult.points && activeMcResult.points.length > 0) {
    const lastPoint = activeMcResult.points[activeMcResult.points.length - 1];
    const finalP50 = lastPoint.p50;
    const targetYear = lastPoint.year;
    
    context += `
WYNIKI SYMULACJI (MONTE CARLO) DLA FAZY ${activePhase === 'accumulation' ? 'BUDOWY' : 'WYPŁAT'}:
- Horyzont obliczeń: do roku ${targetYear} (${targetYear - currentAge} lat od teraz)
- Szansa na sukces (kapitał > 0): ${Math.round(activeMcResult.successRate * 100)}%
- Przewidywana MEDIANA kapitału na koniec okresu (P50): ${new Intl.NumberFormat('pl-PL').format(Math.round(finalP50))} PLN
`;
  } else {
    context += `\n(Brak aktualnych wyników Monte Carlo dla fazy ${activePhase}.)`;
  }

  context += `\n-----------------------------------`;
  
  return context;
}
