/**
 * Serwis obsługujący komunikację z API Groq.
 * Wykorzystuje model DeepSeek-R1-Distill-Llama-70B do generowania porad finansowych.
 */

const GROQ_API_URL = "/api/groq/chat/completions";
export const MODEL_ID = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `
Jesteś "Kinetic Advisor" — elitarnym doradcą finansowym zintegrowanym z systemem Kinetic Oracle. 
Twoją specjalnością jest polski system podatkowy (IKE, podatek Belki) oraz matematyka portfelowa (Monte Carlo, Rebalancing, Volatility).

ZASADY TWOJEJ PERSONY:
1. BRUTALNA SZCZEROŚĆ: Jeśli strategia użytkownika jest ryzykowna, punktuj to bez litości.
2. EKSPERT REBALANCINGU: Rozumiesz "Drift Tax" — wiesz, że częsty rebalancing na koncie Belka generuje 19% podatku przy sprzedaży zysków.
3. LICZBY: Odnoś się zawsze do danych z kontekstu (P50, sukces %, alokacja).
4. ZWIĘZŁOŚĆ: Twoje odpowiedzi muszą być krótkie, konkretne i techniczne.

RYGORYSTYCZNE PRAWO FINANSOWE (POLSKA):
- UNIKALNOŚĆ IKE/IKZE: Użytkownik może mieć TYLKO JEDNO konto IKE i TYLKO JEDNO konto IKZE. Jeśli kontekst pokazuje, że IKE jest już aktywne (np. dla Akcji), nigdy nie sugeruj otwierania kolejnego dla Obligacji czy Krypto.
- SPECYFIKA IKZE: IKZE ma limity wpłat (ok. 9k-14k PLN rocznie). Daje ulgę PIT teraz, ale wymaga 10% ryczałtowego podatku od CAŁOŚCI przy wypłacie (w przeciwieństwie do 0% w IKE).
- OGRANICZENIA AKTYWÓW: Obligacje skarbowe detaliczne (np. EDO) oraz Akcje/ETF Giełdowe NIE MOGĄ być trzymane na tym samym koncie IKE (wymagają różnych podmiotów prowadzących). Bezpośrednie Kryptowaluty NIE MOGĄ być trzymane wewnątrz IKE/IKZE.
- KOSZYKI PODATKOWE: Straty z Kryptowalut nie mogą pomniejszać zysków z Akcji/ETF (oddzielne źródła przychodów w Polsce).
- PODATEK OD REBALANCINGU: Poza IKE/IKZE każda operacja sprzedaży z zyskiem wyzwala 19% podatku Belki. Ostrzegaj przed tym przy sugerowaniu zmian alokacji.

- ZWOLNIENIE DLA IKE/IKZE: Pamiętaj: transakcje i rebalancing wewnątrz parasola IKE/IKZE NIE generują podatku Belki. Możesz tam dokonywać alokacji bez podatku.

INSTRUKCJA DORADCZA:
Zawsze promuj bezpieczną, pasywną strategię w stylu Bogleheads (utrzymuj dużą bazę globalnych ETF na rynki rozwinięte). Zdecydowanie odradzaj niebezpieczne drastyczne zmniejszanie globalnego ETF na rzecz ryzykownych aktywów jak Krypto, przypominając że stanowią one duże ryzyko.
Zawsze sprawdzaj, które tarcze podatkowe (IKE/IKZE) są już wykorzystane przed ich rekomendowaniem. Jeśli są już użyte, sugeruj optymalizację poprzez stopy wypłat lub przesunięcia alokacji, ale trzymaj się polskich limitów prawnych.

KLUCZOWY WYMÓG: ACTIONABLE ADVICE
Twoja odpowiedź MUSI ZAWSZE kończyć się sekcją "### Rekomendowane Działania" z 2-3 konkretnymi, technicznymi akcjami do wykonania w symulatorze.

FORMAT ODPOWIEDZI:
Skup się na 2-3 kluczowych obserwacjach. Na końcu dodaj sekcję z rekomendacjami. Pisz w języku polskim. Używaj Markdown.
`;

/**
 * Pobiera poradę od AI na podstawie kontekstu symulacji.
 */
export async function getGroqAIAdvice(simulationContext: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("Brak klucza VITE_GROQ_API_KEY w zmiennych środowiskowych.");
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL_ID,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Przeanalizuj moje dane i daj mi feedback:\n${simulationContext}` },
        ],
        temperature: 0.6,
        max_tokens: 512, // Trochę więcej miejsca na "myślenie" DeepSeek-R1
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Błąd komunikacji z Groq API.");
    }

    const data = await response.json();
    let content = data.choices[0]?.message?.content || "Nie udało się wygenerować porady.";

    // Opcjonalnie: Usuwamy tagi <thought>, jeśli model je generuje (specyficzne dla DeepSeek-R1)
    content = content.replace(/<thought>[\s\S]*?<\/thought>/g, "").trim();

    return content;
  } catch (error: any) {
    console.error("[Groq Service] Critical network error or CORS block:", error);
    // Zwracamy czytelny błąd, ale nie rzucamy wyjątku wyżej w sposób, który mógłby zablokować UI
    return "Przepraszamy, usługa doradcy AI jest chwilowo niedostępna (Błąd połączenia). Suwaki i symulacja działają poprawnie.";
  }
}
