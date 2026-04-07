
## [2026-04-07] Modernizacja Systemu Eksportu (Opcja Nuklearna)
### Kontekst Techniczny
Wdrożono architekturę **Off-screen Template Export** w odpowiedzi na krytyczne ograniczenia technologiczne:
1. **Natywny Druk Przeglądarki**: Poległ przy trybie Dark Mode (automatyczne usuwanie teł i gradientów przez silniki Chromium/WebKit w celu oszczędności tuszu).
2. **Tailwind v4 & oklab**: Nowoczesna przestrzeń barw oklab używana domyślnie w TW v4 wysadza parser biblioteki `html2canvas` (błędy `parseColorStop` i `CSSParsedDeclaration`).

### Rozwiązanie: Sterylizacja Komponentów
Przeprowadzono "Operację Nuklearną" polegającą na całkowitym oczyszczeniu drzewa komponentów eksportu z klas Tailwind.
- **ExportTemplate.tsx**: 100% stylów inline HEX. Brak zależności od zewnętrznych komponentów UI.
- **InteractiveChart.tsx**: Fizyczne usuwanie węzłów DOM tooltipów podczas eksportu (zapobieganie parsowaniu stylów oklab).
- **AllocationDonut.tsx**: Usunięcie `framer-motion` oraz klas Tailwind. Przejście na statyczne SVG z kolorami HEX.

System jest teraz w pełni deterministyczny i odporny na zmiany w globalnych arkuszach stylów CSS.

## [2026-04-07] Data Enrichment & Oklab Final Sterilization
### Wzbogacenie Biznesowe Raportów
Zakończono rozbudowę komponentu `ExportTemplate.tsx` o sekcję **Business Input Parameters**. Raporty PDF/PNG zawierają teraz kompletny zestaw danych wejściowych symulacji:
- **Parametry Symulacji**: miesięczna wpłata, waloryzacja step-up, łączny wkład własny oraz ramy czasowe (wiek startowy vs emerytalny).
- **Szczegóły Aktywów**: szczegółowa tabela alokacji zawierająca przewidywane stopy zwrotu (Zysk %) oraz typ tarczy podatkowej (IKE vs Belka) dla każdego filaru portfela.

### Status Techniczny (Opcja Nuklearna)
Potwierdzono całkowite wyeliminowanie błędów `oklab` z parserów eksportu (`html2canvas`). Szablon eksportu jest w 100% sterylny – wykorzystuje wyłącznie twarde style inline HEX. Wszystkie komponenty wizualne (wykresy liniowe i kołowe) działają w trybie `isExport`, który odcina wszelki kod CSS powiązany z nowoczesnymi przestrzeniami barw Tailwind v4.

## [2026-04-07] Chart Overflow Hotfix (Export Template)
### Poprawka Wizualna
Nałożono twarde ograniczenie `overflow: hidden` oraz `borderRadius: 12px` na kontener wykresu w `ExportTemplate.tsx`. Poprawka ta eliminuje błąd "rozlewania się" grafiki poza ciemne tło raportu, zapewniając idealnie czyste krawędzie w wygenerowanym dokumencie PDF/PNG. Wysokość kontenera została precyzyjnie dostosowana do biblioteki `lightweight-charts`.

## [2026-04-07] Chart Guillotine Fix (Export Template)
### Poprawka Wymiarowania
Naprawiono błąd "gilotyny" (ucinania osi X) w szablonie eksportu. Wysokość kontenera wykresu została zwiększona z `345px` do `420px`, a wysokość kontenera nadrzędnego do `480px`. Dzięki tym zmianom oś czasu (daty) oraz dolne etykiety skali są w pełni widoczne i czytelne, przy jednoczesnym zachowaniu estetycznego zaokrąglenia i ochrony przed overflow.

## [2026-04-07] Layout Refactor & Responsive Clipping Fix
### Rozwiązanie Problemów Renderowania
Wdrożono gruntowną przebudowę układu `ExportTemplate.tsx` oraz logiki wymiarowania `InteractiveChart.tsx`:
1. **Vertical Stack Layout**: Przejście z układu dwukolumnowego na stos pionowy w raporcie. Pozwoliło to na rozciągnięcie wykresu liniowego do pełnej szerokości arkusza (`820px`).
2. **Fixed Dimensions (Hardcore Fix)**: Wyeliminowano błędy "clippingu" i ucinania osi X poprzez rezygnację z dynamicznego obliczania wymiarów w ukrytym DOM. W trybie `isExport` wykres otrzymuje twarde wymiary (`820x400px`), co gwarantuje poprawny render SVG/Canvas niezależnie od pozycji elementu.
3. **Sterile Legend**: Dodano w pełni sterylną legendę pod wykresem (inline HTML/HEX), zastępując brakujące komponenty Tailwind. Legenda identyfikuje wszystkie serie Monte Carlo (Median, P10-P90) oraz główne składowe portfela.

System raportowania osiągnął stan najwyższej stabilności wizualnej.
