import { toPng } from 'html-to-image';

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
    const dataUrl = await toPng(element, {
      pixelRatio: 2, // Zapewnia wysoką rozdzielczość (Retina)
      backgroundColor: '#0c1324',
    });
    
    // Tworzymy link do pobrania pliku
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    link.download = `KineticOracle-${(scenario.title || 'Wrapped').replace(/\s+/g, '-')}-${timestamp}.png`;
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
