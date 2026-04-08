import { useSimulatorStore } from '../store/useSimulatorStore';
import { AVAILABLE_INSTRUMENTS } from '../config/instruments';

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
    customPortfolio,
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

  const isMaklerskieIkeActive = isCoreIke || isSatIke;

  // Budowa listy instrumentów
  const portfolioDetails = customPortfolio.map(item => {
    const inst = AVAILABLE_INSTRUMENTS.find(i => i.id === item.instrumentId);
    if (!inst) return `- Unknown (${item.instrumentId}): ${item.weight}%`;
    
    let ikeStatus = "BRAK IKE (19% PODATKU)";
    if (inst.category === 'Baza' || inst.category === 'Core') {
      ikeStatus = isCoreIke ? "IKE AKTYWNE (0% PODATKU)" : "KONTO OPODATKOWANE";
    } else if (inst.category === 'Bezpiecznik') {
      ikeStatus = isBondsIke ? "IKE AKTYWNE (0% PODATKU)" : "KONTO OPODATKOWANE";
    } else {
      ikeStatus = isSatIke ? "IKE AKTYWNE (0% PODATKU)" : "KONTO OPODATKOWANE";
    }

    return `- ${item.weight}% ${inst.ticker} (${inst.name}) | Kategoria: ${inst.category} | Podatki: ${ikeStatus}`;
  }).join('\n');

  let context = `--- KONTEKST SYMULACJI FINANSOWEJ (KINETIC WEALTH) ---
Użytkownik: Wiek ${currentAge} lat, planowana emerytura w wieku ${retirementAge} lat (Horyzont: ${horizon} lat).
Budowa kapitału: Wpłata ${monthlyContribution} PLN/mc, wzrost wpłaty o inflację (${inflationRate}%).

SKŁAD PORTFELA (INSTRUMENTY RYNEK):
${portfolioDetails}

TARCZA PODATKOWA (GLOBALNA KONFIGURACJA):
- Portfel Maklerski (Core/Sat): ${isMaklerskieIkeActive ? 'REJESTRACJA IKE' : 'KONTO ZWYKŁE'}
- Portfel Obligacji (EDO): ${isBondsIke ? 'REJESTRACJA IKE-EDO' : 'KONTO ZWYKŁE'}
- Status Prawny: ${isBondsIke && isMaklerskieIkeActive ? 'KRYTYCZNY BŁĄD PRAWNY: Dwa rodzaje IKE naraz!' : 'Poprawny'}

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
