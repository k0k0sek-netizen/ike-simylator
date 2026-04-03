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
    mcResult,
    monthlyWithdrawal,
    withdrawalYears
  } = state;

  const strategyName = rebalancingStrategy === 1 ? "Twardy Roczny Rebalancing" : "Brak Rebalancingu";
  const horizon = retirementAge - currentAge;

  let context = `--- KONTEKST SYMULACJI FINANSOWEJ ---
Użytkownik: Wiek ${currentAge} lat, planowana emerytura w wieku ${retirementAge} lat (Horyzont: ${horizon} lat).
Budowa kapitału: Wpłata ${monthlyContribution} PLN/mc, wzrost wpłaty o inflację (${inflationRate}%).

ALOKACJA PORTFELA:
1. AKCJE ŚWIAT (CORE): ${customCoreWeight}% | Zmienność: ${coreVolatility}% | IKE: ${isCoreIke ? 'TAK' : 'NIE (Konto Belka)'}
2. KRYPTOWALUTY (SAT): ${customSatWeight}% | Zmienność: ${satVolatility}% | IKE: ${isSatIke ? 'TAK' : 'NIE (Konto Belka)'}
3. OBLIGACJE/EDO: ${customBondsWeight}% | Zmienność: ${bondsVolatility}% | IKE: ${isBondsIke ? 'TAK' : 'NIE (Konto Belka)'}

STRATEGIA: ${strategyName}

FAZA WYPŁAT:
Planowana wypłata: ${monthlyWithdrawal} PLN/mc (w dzisiejszej sile nabywczej) przez ${withdrawalYears} lat.
`;

  if (mcResult) {
    const finalP50 = mcResult.points[mcResult.points.length - 1]?.p50 || 0;
    context += `
WYNIKI SYMULACJI (MONTE CARLO - 1000 iteracji):
- Szansa na sukces (kapitał nie spadł do zera): ${Math.round(mcResult.successRate)}%
- Prognozowany kapitał (Mediana P50): ${new Intl.NumberFormat('pl-PL').format(Math.round(finalP50))} PLN
`;
  } else {
    context += `\n(Brak wyników Monte Carlo - użytkownik jeszcze nie przeliczył symulacji lub trwa obliczanie.)`;
  }

  context += `\n-----------------------------------`;
  
  return context;
}
