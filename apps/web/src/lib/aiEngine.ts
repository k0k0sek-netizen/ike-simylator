import { CreateMLCEngine, MLCEngine } from "@mlc-ai/web-llm";
import type { ChatCompletionRequest, InitProgressReport, ChatCompletion } from "@mlc-ai/web-llm";
import { useSimulatorStore } from "../store/useSimulatorStore";

const MODEL_ID = "Phi-3-mini-4k-instruct-q4f16_1-MLC";
let engine: MLCEngine | null = null;

const SYSTEM_PROMPT = `
Jesteś "Kinetic Advisor" — elitarnym doradcą finansowym zintegrowanym z systemem Kinetic Oracle. 
Twoją specjalnością jest polski system podatkowy (IKE, podatek Belki) oraz matematyka portfelowa (Monte Carlo, Rebalancing, Volatility).

ZASADY TWOJEJ PERSONY:
1. BRUTALNA SZCZEROŚĆ: Jeśli strategia użytkownika jest ryzykowna (np. 100% krypto na koncie Belka bez planu), punktuj to bez litości.
2. EKSPERT REBALANCINGU: Rozumiesz "Drift Tax" — wiesz, że częsty rebalancing na koncie Belka generuje podatek przy sprzedaży zysków, co uszczupla bazę kapitalizacji. Zachęcaj do IKE jako tarczy dla tej strategii.
3. LICZBY: Odnoś się zawsze do danych z otrzymanego kontekstu (P50, sukces %, alokacja).
4. ZWIĘZŁOŚĆ: Twoje odpowiedzi muszą być krótkie, konkretne i techniczne. Nie lej wody. Nie jesteś asystentem do wszystkiego — jesteś wyrocznią finansową.

FORMAT ODPOWIEDZI:
Skup się na 2-3 kluczowych obserwacjach. Pisz w języku polskim. Używaj Markdown.
`;

/**
 * Inicjalizuje silnik WebLLM w asynchronicznym workerze.
 */
export async function initWebLLM() {
  const store = useSimulatorStore.getState();
  
  if (engine) return;
  
  try {
    store.setAIStatus('loading');
    
    const progressCallback = (report: InitProgressReport) => {
      console.log(`[WebLLM] Progress: ${report.text}`);
      // Parsowanie postępu z tekstu (np. "Fetching model... 45%")
      const match = report.text.match(/(\d+)%/);
      if (match) {
        store.setAIProgress(parseInt(match[1]));
      }
    };

    engine = await CreateMLCEngine(
      MODEL_ID,
      { initProgressCallback: progressCallback }
    );

    store.setAIStatus('ready');
  } catch (err: any) {
    console.error("[WebLLM] Init Error:", err);
    store.setAIStatus('error');
    throw new Error(`Błąd inicjalizacji WebGPU/WebLLM: ${err.message}`);
  }
}

/**
 * Generuje poradę na podstawie kontekstu symulacji.
 */
export async function generateAdvice(simulationContext: string): Promise<string> {
  if (!engine) {
    await initWebLLM();
  }

  const messages: ChatCompletionRequest = {
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Przeanalizuj moje dane i daj mi feedback:\n${simulationContext}` }
    ],
    temperature: 0.3,
    max_tokens: 300,
  };

  const reply = await engine!.chat.completions.create(messages) as ChatCompletion;
  return reply.choices[0].message.content || "Nie udało się wygenerować porady.";
}
