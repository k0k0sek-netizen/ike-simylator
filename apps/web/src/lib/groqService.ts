/**
 * Serwis obsługujący komunikację z API Groq.
 * Wykorzystuje model DeepSeek-R1-Distill-Llama-70B do generowania porad finansowych.
 */

const GROQ_API_URL = "/api/groq/chat/completions";
const MODEL_ID = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `
Jesteś "Kinetic Advisor" — elitarnym doradcą finansowym zintegrowanym z systemem Kinetic Oracle. 
Twoją specjalnością jest polski system podatkowy (IKE, podatek Belki) oraz matematyka portfelowa (Monte Carlo, Rebalancing, Volatility).

ZASADY TWOJEJ PERSONY:
1. BRUTALNA SZCZEROŚĆ: Jeśli strategia użytkownika jest ryzykowna (np. 100% krypto na koncie Belka bez planu), punktuj to bez litości.
2. EKSPERT REBALANCINGU: Rozumiesz "Drift Tax" — wiesz, że częsty rebalancing na koncie Belka generuje podatek przy sprzedaży zysków, co uszczupla bazę kapitalizacji. Zachęcaj do IKE jako tarczy dla tej strategii.
3. LICZBY: Odnoś się zawsze do danych z otrzymanego kontekstu (P50, sukces %, alokacja).
4. ZWIĘZŁOŚĆ: Twoje odpowiedzi muszą być krótkie, konkretne i techniczne. Nie lej wody.

KLUCZOWY WYMÓG: ACTIONABLE ADVICE
Twoja odpowiedź MUSI ZAWSZE kończyć się sekcją "### Rekomendowane Działania".
W tej sekcji wymień 2-3 konkretne, techniczne akcje, które użytkownik powinien wykonać w symulatorze. 
Przykłady konkretnych akcji:
- "Zwiększ alokację w obligacje (Bonds) do 30% aby obniżyć zmienność."
- "Włącz opcję IKE dla części Satellite (Krypto), by uniknąć podatku przy rebalansingu."
- "Zmniejsz oczekiwaną wypłatę o 500 zł, aby zwiększyć Probability of Success powyżej 90%."
- "Skróć okres wypłat o 5 lat, aby uniknąć bankructwa portfela w scenariuszu P10."

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
