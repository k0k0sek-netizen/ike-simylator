import { toJpeg } from 'html-to-image';

/**
 * Asynchroniczne oczekiwanie na pełen render DOM (Polling).
 * Rozwiązuje problem pustych wykresów w html-to-image wywołanych przez asynchroniczne komponenty (np. Recharts).
 */
export async function waitForRender(element: HTMLElement, maxWaitMs = 2000, pollIntervalMs = 50): Promise<void> {
  return new Promise((resolve) => {
    let elapsed = 0;
    const interval = setInterval(() => {
      // Szukamy elementów, które ładują się najwolniej (np. Canvas/SVG z Recharts)
      const rechartsSurface = element.querySelector('.recharts-surface');
      
      // Jeżeli węzeł graficzny istnieje albo dobiliśmy do Timeoutu, kończymy pętlę.
      if (rechartsSurface || elapsed >= maxWaitMs) {
        clearInterval(interval);
        // Ostatni mikro-delay, żeby przeglądarka fizycznie zdążyła nabrać farby.
        setTimeout(resolve, 100);
      }
      elapsed += pollIntervalMs;
    }, pollIntervalMs);
  });
}

/**
 * exportToIsolatedPNG - Generowanie obrazu PNG (Social Wrapped) z ukrytego szablonu.
 * Silnik html-to-image celuje w #export-template dając czytelny, profesjonalny obraz (obsługa CSS w SVG foreignObject).
 */
export async function exportToIsolatedPNG(scenario: any) {
  const element = document.getElementById('export-template');
  if (!element) {
    console.warn('[exportUtils] Element #export-template nie został znaleziony. Próba użycia body (fallback).');
    // W przypadku błędu szablonu, używamy body lub zwracamy błąd
    alert('Błąd szablonu eksportu. Upewnij się, że ExportTemplate jest zamontowany.');
    return;
  }

  // Zapamiętujemy oryginalne krycie i ustawiamy na 100% dla zrzutu
  const originalOpacity = element.style.opacity;
  element.style.opacity = '1';

  try {
    // Solidny polling oczekujący na pełne zbudowanie węzłów SVG/Recharts
    await waitForRender(element);

    // PROBLEM 2: Zbyt duży rozmiar pliku (zamiana toPng na toJpeg z zachowaniem pixelRatio)
    const dataUrl = await toJpeg(element, {
      pixelRatio: 2, // Zapewnia wysoką rozdzielczość (Retina)
      quality: 0.95,
      backgroundColor: '#0c1324',
    });
    
    // Tworzymy link do pobrania pliku
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    link.download = `KineticOracle-${(scenario.title || 'Wrapped').replace(/\s+/g, '-')}-${timestamp}.jpg`;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error('[exportUtils] Błąd eksportu PNG:', err);
    alert('Wystąpił błąd podczas generowania obrazu PNG.');
  } finally {
    // Przywracamy ukryte krycie (Opcja Nuklearna)
    element.style.opacity = originalOpacity || '0.01';
  }
};
