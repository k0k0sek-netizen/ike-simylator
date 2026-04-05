import type { SimulatorState } from '../store/useSimulatorStore';

/**
 * Przekształca stan symulacji na skondensowany kontekst tekstowy dla LLM.
 * Pozwala doradcy AI na "zrozumienie" konkretnej sytuacji finansowej użytkownika.
 */
export function exportSimulationContext(state: SimulatorState): string {
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
    coreVolatility,
    satVolatility,
    bondsVolatility,
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

ALOKACJA PORTFELA:
- Akcje Świat (CORE): ${customCoreWeight}% (IKE: ${isCoreIke ? 'Włączone' : 'Wyłączone - Podatek Belki'}) | Zmienność: ${coreVolatility}%
- Kryptowaluty (SAT): ${customSatWeight}% (IKE: ${isSatIke ? 'Włączone' : 'Wyłączone - Podatek Belki'}) | Zmienność: ${satVolatility}%
- Obligacje EDO (Bonds): ${customBondsWeight}% (IKE: ${isBondsIke ? 'Włączone' : 'Wyłączone - Podatek Belki'}) | Zmienność: ${bondsVolatility}%

STRATEGIA: ${strategyName}

FAZA WYPŁAT:
Planowana wypłata: ${monthlyWithdrawal} PLN/mc (w dzisiejszej sile nabywczej) przez ${withdrawalYears} lat.
`;

  const activeMcResult = activePhase === 'accumulation' ? mcResultAccumulation : mcResultDecumulation;

  if (activeMcResult) {
    const finalP50 = activeMcResult.points[activeMcResult.points.length - 1]?.p50 || 0;
    context += `
WYNIKI SYMULACJI (MONTE CARLO - 1000 iteracji) dla fazy ${activePhase === 'accumulation' ? 'BUDOWY' : 'WYPŁAT'}:
- Szansa na sukces (kapitał nie spadł do zera): ${Math.round(activeMcResult.successRate * 100)}%
- Prognozowany kapitał (Mediana P50): ${new Intl.NumberFormat('pl-PL').format(Math.round(finalP50))} PLN
`;
  } else {
    context += `\n(Brak wyników Monte Carlo - użytkownik jeszcze nie przeliczył symulacji lub trwa obliczanie.)`;
  }

  context += `\n-----------------------------------`;
  
  return context;
}
