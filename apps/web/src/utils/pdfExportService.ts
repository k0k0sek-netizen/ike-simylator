import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';

/**
 * triggerPrint - Generowanie raportu PDF przy użyciu wzorca Off-screen Template.
 * Wykorzystuje html-to-image do zrzutu ukrytego komponentu oraz jsPDF do zapisu pliku.
 */
export async function triggerPrint(elementId: string = 'export-template') {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`[pdfExportService] Element o ID "${elementId}" nie został znaleziony. Upewnij się, że ExportTemplate jest zamontowany w App.tsx.`);
    return;
  }

  // Zapamiętujemy oryginalne krycie i ustawiamy na 100% dla zrzutu
  const originalOpacity = element.style.opacity;
  element.style.opacity = '1';

  try {
    // PROBLEM 1: Rozjazd danych (Stale State / Rendering Race Condition)
    // Czekamy chwilę po odkryciu elementu, aby React zdążył domontować i przerysować 
    // widok z aktualnymi danymi ze statu przed przechwyceniem zrzutu ekranu.
    await new Promise(resolve => setTimeout(resolve, 300));

    // PROBLEM 2: Gigantyczny rozmiar pliku PDF (Bloat)
    // Zmieniamy toPng na toJpeg (z kompresją 0.90) aby wyeliminować gigantyczne pliki
    // przy jednoczesnym zachowaniu pixelRatio: 2 dla ostrych tekstów.
    const dataUrl = await toJpeg(element, {
      pixelRatio: 2,
      quality: 0.90,
      backgroundColor: '#0c1324',
    });

    // Pobieramy wymiary elementu z DOM aby poprawnie zachować aspect ratio
    const rect = element.getBoundingClientRect();
    const ratio = rect.width ? (rect.height / rect.width) : 1;
    
    // Proporcje A4: 210mm x 297mm
    const imgWidth = 210; 
    const pageHeight = 297;
    const imgHeight = imgWidth * ratio;
    
    // Tworzymy dokument PDF. Z włączoną natywną kompresją jsPDF.
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: imgHeight > pageHeight ? [imgWidth, imgHeight] : 'a4',
      compress: true
    });

    // Wstawiamy skompresowany JPEG zamiast PNG
    pdf.addImage(dataUrl, 'JPEG', 0, 0, imgWidth, imgHeight);
    
    // Nazwa pliku z datą dla profesjonalnego efektu
    const timestamp = new Date().toISOString().slice(0, 10);
    pdf.save(`KineticOracle-Raport-${timestamp}.pdf`);

  } catch (error) {
    console.error('[pdfExportService] Błąd generowania PDF z szablonu:', error);
    alert('Wystąpił błąd podczas generowania raportu PDF.');
  } finally {
    // Przywracamy ukryte krycie (Opcja Nuklearna)
    element.style.opacity = originalOpacity || '0.01';
  }
}
