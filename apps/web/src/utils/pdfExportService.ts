import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * triggerPrint - Generowanie raportu PDF przy użyciu wzorca Off-screen Template.
 * Wykorzystuje html2canvas do zrzutu ukrytego komponentu oraz jsPDF do zapisu pliku.
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
    // Generowanie canvasu z ukrytego szablonu
    // Używamy scale: 2 dla lepszej jakości (High DPI)
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#0c1324',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    
    // Proporcje A4: 210mm x 297mm
    const imgWidth = 210; 
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Tworzymy dokument PDF. Jeśli obraz jest dłuższy niż A4, tworzymy długą stronę (Infographic style)
    const pdf = new jsPDF({
      orientation: imgHeight > pageHeight ? 'p' : 'p',
      unit: 'mm',
      format: imgHeight > pageHeight ? [imgWidth, imgHeight] : 'a4'
    });

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    
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
