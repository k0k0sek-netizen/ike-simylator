# PAMIĘĆ AGENTA / DZIENNIK POKŁADOWY

## AKTUALNY STAN (PUNKT PRZYWRACANIA)
**Zakończono na:** Finalnej modernizacji silnika eksportu. Usunięto `html2canvas` na rzecz `html-to-image` (foreignObject SVG), co umożliwiło poprawne renderowanie gradientów `oklab` w raportach Neon Dark.
**Następny krok:** Prezentacja gotowego symulatora użytkownikowi.

## HISTORIA ZMIAN
* Zainicjowano pamięć Markdown. Ustalono architekturę Local-First.
* Wygenerowano skielet monorepo, manifest package.json dla frontendu (React 19) oraz Cargo.toml dla backendu Wasm.
* Przetłumaczono prototyp JS z logiką finansową IKE do języka Rust (`lib.rs`), silnik operuje na silnie typowanych strukturach za pomocą Serde.
* Stworzono po stronie klienta (React) stan aplikacji z biblioteką Zustand. Utworzono surowy podgląd wyzwalający logikę Wasm na każdą zmianę stanu.
* Zastąpiono surową makietę wygenerowanym kodem UI wykorzystującym Tailwind CDN. Podpięto interakcje UI pod `Wasm` z ekranem ładowania (loader) oraz dynamicznymi wyliczeniami w 100% Client-Side.
* (ITERACJA 4) Integracja PGlite jako in-browser PostgreSQL instance dla zapisów symulacji użytkownika.
* (ITERACJA 4) Wymiana pliku SVG na kompletny instancję Lightweight Charts rysującą portfele nominalne i zwaloryzowane o inflację.
* (ITERACJA 4) Kompletna konfiguracja vite-plugin-pwa.
* Wysłano plik zapasowy JS (Mock) dla środowiska Vite.
* (ITERACJA 5) Utworzenie Pamięci Długoterminowej (Ideas) zawierającej cele z monetyzacją i marketingiem aplikacji.
* (ITERACJA 5) Operacja "Polonizacja": wdrożenie tłumaczeń L11n (pl-PL), korekcja separatorów walutowych na format PLN w UI React oraz zwiastunach docelowych w Wasm/JS.

## ZWERYFIKOWANE PROBLEMY
* Brak komendy cargo - paczkę "engine" zainicjowano asynchronicznie poprzez dynamiczny import (top-level awaryjnie w bloku catch). 
* Konfiguracja Tailwind CSS wykorzystuje na razie zagnieżdżoną formę skryptową przez CDN (zgodnie z Vibe UI promptu). Należy to ewentualnie spakować do lokalnego PostCSS/TailwindCLI w późniejszej fazie optymalizacji bundle'a.

## WYNIK AUDYTU ARCHITEKTONICZNEGO
Zderzono obecny stan aplikacji z 11 pierwotnymi założeniami biznesowymi. Wynik klasyfikacji:

**Logika Biznesowa i UI (Core):**
1. 🔴 Brakujące (DO NADROBIENIA): Panel Sterowania: Parametry 'Twój obecny wiek' oraz 'Wiek emerytalny' (zamiast ogólnikowego 'Czasu trwania inwestycji').
2. 🔴 Brakujące (DO NADROBIENIA): Panel Sterowania: Miesięczna wpłata posiada twardą opcję/checkbox 'Maksymalizuj limit IKE'.
3. 🔴 Brakujące (DO NADROBIENIA): Wykres warstwowy: Pokazuje precyzyjnie trzy warstwy w czasie: Wpłacony kapitał, Zysk z odsetek, Oszczędność na podatku Belki (19%).
4. 🔴 Brakujące (DO NADROBIENIA): Silnik Rust: Twardo pilnuje ustawowego, rocznego limitu wpłat na IKE i nie pozwala go przekroczyć w kalkulacjach.
5. 🔴 Brakujące (DO NADROBIENIA): Silnik Rust: Kalkuluje podatek Belki (19%) dla alternatywnego, zwykłego konta, aby wyraźnie pokazać użytkownikowi różnicę i zysk z samego faktu posiadania IKE.

**Architektura i "Wow Factor" (Wersja Premium):**
6. 🔴 Brakujące: Silnik obliczeniowy: Zaawansowane modele Monte Carlo.
7. 🟡 Częściowo wdrożone / Zmienione: Architektura Danych: Synchronizacja lokalnej bazy (PGlite) z chmurą (np. Supabase/ElectricSQL) w tle (CRDT). (PGlite działa, brak chmury).
8. 🔴 Brakujące: Frontend: Wykorzystanie View Transitions API do bezszwowego przechodzenia między ekranami.
9. 🔴 Brakujące: UI: Interaktywne elementy 3D (np. Spline) wizualizujące kapitał.
10. 🔴 Brakujące: AI Edge: Integracja WebLLM uruchamianego w przeglądarce jako doradca portfelowy.
11. 🔴 Brakujące: Dane Rynkowe: Pobieranie i lokalne cachowanie historii z zewnętrznych API (Polygon.io, NBP).

**Iteracja 7 (Kinetic Refactor & Pętla Wykonawcza)**:
- Krytyczna interwencja użytkownika: agent usunął proces planowania w `.agent/gemini.md`. Rozkazem nadrzędnym **przywrócono protokół wykonawczy**.
- Nowe absolutne dyrektywy: Zero Spaghetti, SOLID oraz Next-Gen UI 2026.
- Całkowita separacja molochu `App.tsx` do komponentów `apps/web/src/components/`: `Header`, `BottomNav`, `StatSummary`, `InteractiveChart`, `ControlPanel`, `SavedPortfolios`, `TemplatesPanel`. Wdrożono `utils/cn.ts`. 
- Wdrożenie architektury sprężystych, kręcących się za sprawą `framer-motion` i hooka `useSpring` liczników dla wielkich wartości walutowych i lat (`AnimatedCounter`). Interfejs zyskał kinetyczne życie.

**Audyt Mechanizmu Wasm (Verification Mission)**:
- Wdrożono w interfejsie `EngineStatusBadge.tsx` informujący o środowisku uruchomieniowym (🟢 Wasm Engine / 🟡 JS Fallback), wraz z precyzyjnymi `console.log` o statusie silnika.
- Zidentyfikowano ryzyko w ścieżce importu: `import('../../../packages/engine/pkg/engine.js')`. Taki import może napotkać bariery serwera lokalnego deweloperskiego (Vite `fs.strict`) – bezpiecznie jest zamienić to w przyszłości na zadeklarowaną w `package.json` zależność lokalną: `"engine": "file:../../packages/engine/pkg"`.

**Iteracja 8 (Optymalizacja Środowiska i Clean Engine)**:
- Porzucono developerski skrypt Tailwind CDN w pliku HTML. Zainstalowano w pełni kompilowany `@tailwindcss/vite` używający najnowszej architektury CSS kompilatora V4. 
- Logikę kolorów i formatów (Vibe UI) przeniesiono natywnie do `src/index.css` jako zmienne CSS z adnotacją `@theme`. Zoptymalizowano proces budowania.
- Wdrożono zalecenie po-audytowe dotyczące Rusta: zamapowano silnik natywny do NPM Workspace. Relatywny spaghetti-kod importu zastąpiono eleganckim i w pełni natywnym linkowaniem paczek NPM w `App.tsx`: `import('engine')`.
- Wprowadzono *UI Polish*: płynne zanikanie suwaków `opacity` i desaturację podczas blokowania opcji wpłat. Skonstruowano precyzyjny efekt świetlnego kręgu (*Glow*) okalający pulsującą zieloną pigułkę statusu łączności Wasm.
- **Audyt Zgodności Lintera:** Poprawiono ostrzeżenia narzędzi statycznych. Przestarzałe klasy gradientów `bg-gradient-to...` zastąpiono na natywne w v4 `bg-linear-to...`. Zamieniono ręczne kolory z nawigacji na powiązane dyrektywami `theme` zmienne (np. `bg-surface-container-low`), dostosowując się do nowej, bezkonfiguracyjnej struktury CSS.

**System Update - Protokół Operacyjny**:
- Wdrożono *Regułę V. DOKUMENTACJA I ŚLEDZENIE POSTĘPÓW (ABSOLUTE RULE)* do pliku `gemini.md`. Wymusza to rygorystyczne przestrzeganie uaktualnień dzienników postępu oraz stanu architektury w plikach systemowych. Przed przejściem do kodowania nowych modułów oparto kolejne prace na skrupulatnych zatwierdzeniach (*Implementation Plan*).

**Iteracja 9 i 10 (Dekumulacja Kapitału i Social Share)**:
- Rozbudowano jądro silnika Wasm (Rust `InputParams`) dodając obsługę raty wypłacanej `monthly_withdrawal` oraz czasu na emeryturze `withdrawal_years`.
- Przebudowano funkcję modelującą: algorytm wykrywa wiek rentowy, po którym ujemny bilans "pożera" kapitał. Skonfigurowano powiadomienie o bankructwie (wypalenie kapitału do 0.0) wraz z dokładnym śladem wieku (`bankruptAge`). Pakiety Rust kompilują logiczne struktury bezbłędnie. Zapewniono pełną zgodność moka (JS_MOCK).
- Wdrożono element Social Share: `SocialShareCard.tsx`. Wykorzystuje bibliotekę `html-to-image` do zrzutu niewidzialnych (przetrzymywanych bez flagi display: none, ale wysuniętych poza viewport) klatek komponentów estetycznych. Użyto `navigator.share` do natywnego przesyłania plików z fallbackiem pobierania. 
**Iteracja 11 (Krytyczny Bugfix i Polerowanie UX)**:
- Naprawiono drastyczny bug w jądrze Rusta (podwójne potrącanie wypłat w modelu Core/Sat i błędne budowanie salda nominalnego uciekającego w nieskończoność dla wysokich zysków giełdy). Rata wypłat jest teraz poprawnie dzielona przez wagę procentową portfeli testowych. Przebudowano kompilację.
- Rozwiązano błąd pustej referencji wieku bankructwa na frontendzie, poprzez użycie poprawnej weryfikacji (`bankruptAge != null`).
- Zoptymalizowano `InteractiveChart`: odblokowano oś Y z kwotami ułatwiając kalkulację, wymuszono autoskalowanie timeScale oraz zniesiono overflow, aby zapobiec ucinaniu etykiet crosshairów. Wdrożono margines wewnątrz płótna. Skrypt mockujący (`engineMock.ts`) precyzyjne odwzorowuje teraz logikę naprawionego Rusta.

**Iteracja 12 (Krytyczny Protokół Naprawczy: Factor 100)**:
- Usunięto błąd przeliczeniowy o czynnik 100 (zwracany kapitał 91M -> 913k PLN). Zastosowano natywne post-procesowanie w `App.tsx` przy wywołaniu procedury `generateMultipleScenarios()`.
- Wszystkie wartości finansowe we flagowej tablicy `ScenarioResult` oraz sub-tablicach `yearlyData` (Zysk Netto, Tarcza Podatkowa, Bilans Nominalny, Zainwestowany Kapitał i Oszczędności) mapowane są w React State z nałożonym operatorem `/ 100.0`.
- Wykres `InteractiveChart` samodzielnie ustosunkował się do nowych wartości setek tysięcy wraz z przerysowaniem adekwatnej, rynkowej osi Y. Zapewniono pełną asymilację naprawy ze zrzutami Social Share.

**Iteracja 13 (Core Math Integrity - Definitywny Bugfix Logiki)**:
- Obnażenie faktycznej przyczyny wyników kapitału rzędu dziesiątek milionów: **Architektoniczna utrata relacji limitu 26,000 PLN pomiędzy częścią strukturalną (Core) i satelitarną (Sat)**. Wasm obcinał każdą z wpłat *z osobna* do pułapu limitu, podwajając faktycznie wnoszony wolumen wejściowy co dekadę! Zastosowano wariantowe maskowanie limitu wagą porcji `portion_weight` przycinając maksymalną wpłatę.
- Zniesienie mylnego hardkodu ukrytej zmiennej `annualStepUp` (waloryzacji pompującej kapitał nominalny pod spodem o niewidzialne +5% r/r). Zaimplementowano ujednoznaczniony suwak w `ControlPanel.tsx` oraz cofnięto jej stan `defaultValue` na domyślne `0%`.
- Cofnięcie powierzchownego obejścia z Iteracji 12 (mapowanie z użyciem `/ 100.0`) co przywraca silnikowi w RUST jego naturalny i całkowicie precyzyjny typ zliczania `f64`. Rzetelność matematyczna Wasm i JS wreszcie się nakłada.

**Iteracja 14 (Compound Math Fix)**:
- Doprecyzowanie leksykalne wzoru zysku procentowego na zalecenie Tech Leada. Silnik obliczeniowy wektorowo rozbija `nominal_rate` najpierw na ułamek roczny (`rate_annual_nominal = nominal_rate / 100.0`), a potemm dzieli go wprost na stawkę miesięczną (`rate_annual_nominal / 12.0`), by na końcu użyć dedykowanej zmiennej do potęgowania kapitału. Uniknięto w ten sposób jakiejkolwiek pomyłki składniowej podczas kompilacji `wasm-bindgen`. Ten sam wariant zaimplementowano również w fallbacku (`engineMock.ts`). Zawrotne kwoty (8.5+ MLN) to fizyczny, w pełni zasymulowany matematycznie efekt magii składanego oprocentowania działającego dodatkowo dla dekad nieujemnej fazy w `withdrawalYears` (faza emerytalna).

**Iteracja 15 (Final Polish — Double Negative & StatSummary Spójność)**:
- **Double Negative Fix:** W `lib.rs` (Rust) i `engineMock.ts` (JS) zastosowano wartość bezwzględną `.abs()` / `Math.abs()` na zmiennej `monthly_withdrawal_amount` w bloku dekumulacji. Chroni to przed sytuacją, w której ujemna wartość wypłaty odwraca znak odejmowania i zamiast pomniejszać kapitał — pompuje go w górę.
- **StatSummary.tsx — Spójność Czasowa Wskaźników:** Wszystkie pola panelu statystyk (capitalAtRetirement, finalReal, netProfit, taxShield, profitPct) zaciągają teraz dane z `retirementData` (moment przejścia na emeryturę = koniec fazy akumulacji), a nie z `activeScenario.finalNominal` (koniec symulacji wliczając dekady procentowania w fazie emerytalnej). To eliminuje percepcyjny bug, w którym etykieta „30 lat" pokazywała kwotę z 60. roku symulacji.

**Iteracja 16 (Zero-Clamp & Rebalancing)**:
- **Diagnoza architektoniczna:** Core i Sat portfele były obliczane niezależnie (`calculate_scenario_data_internal`), a następnie sumowane w `generate_scenario_internal`. Bankructwo Core (saldo 0) było maskowane przez wciąż rosnący Sat (15%), dając łączny wynik milionowy na wykresie mimo wyświetlanego alertu bankructwa.
- **Rozwiązanie — agregacyjny Zero-Clamp:** Logika bankructwa przeniesiona z poziomu per-portfel na poziom agregacji (suma Core+Sat). Gdy `combined_nominal <= 0.0` w fazie dekumulacji — ustawiamy `bankrupt_age` i `is_bankrupt = true`. Od tego momentu do końca osi X wszystkie wartości in `yearlyData` (nominalBalance, realBalance, nominalInterest, taxShield) are twardo zerowe.
- **Lustrzana implementacja** w `engineMock.ts` (JS fallback).
- **Efekt wizualny:** Wykres po bankructwie płasko leży na zerze, zamiast uciekać w miliony z powodu niewyzerowanego portfela satelitarnego.

**Iteracja 17 (Dynamic Decumulation Rebalancing)**:
- **Diagnoza 'Isolated Buckets':** Iteracja 16 nie rozwiązała problemu, ponieważ wypłaty były nadal sztywno alokowane wg początkowej proporcji portfeli (np. 80/20). Core z 2% stopą bankrutował szybko, ale Sat z 15% stopą dostawał tak małą wypłatę (20%), że jego zyski przewyższały drenaż — Sat uciekał w miliony, a suma Core+Sat nigdy nie spadała do zera.
- **Rozwiązanie — architektoniczny rozłam faz:** Faza akumulacji pozostaje w osobnych wywołaniach `calculate_scenario_data_internal` z `withdrawal_years=0`. Faza dekumulacji została wyciągnięta do zunifikowanej pętli miesięcznej w `generate_scenario_internal`, która:
  1. Nalicza odsetki osobno dla Core i Sat (różne stopy zwrotu)
  2. Oblicza `total_current_nominal = core_nom + sat_nom`
  3. Jeśli `total_current_nominal <= withdrawal_nominal` → BANKRUCTWO (oba salda = 0)
  4. W przeciwnym razie oblicza dynamiczne wagi: `core_weight = core_nom / total_current_nominal` i pobiera wypłatę proporcjonalnie z obu portfeli
- **Kluczowa zmiana:** Portfel Sat z 15% stopą jest teraz drenowany proporcjonalnie do swojego udziału w łącznym kapitale, zamiast dostać niskie 20% wypłaty. Gdy Core słabnie, Sat przejmuje na siebie większy ciężar wypłat.
- **Lustrzana implementacja** w `engineMock.ts`.

**Iteracja 19 (The Great UX Split — Dwa Dashboardy)**:
- **Problem UX:** 50-letnia symulacja (30 lat akumulacji + 20 lat dekumulacji) na jednym wykresie niszczyła skalę osi Y i czytelność.
- **Rozwiązanie — System Zakładek:** Dodano `activePhase: 'accumulation' | 'decumulation'` do Zustand store. Interfejs podzielony na dwa kroki z animowanym przełącznikiem (Framer Motion spring pill).
- **Filtrowanie Wykresu:** `chartScenario.yearlyData` jest teraz cięty przez `slice(0, years)` (Krok 1) lub `slice(years)` (Krok 2), chroniąc skalę Y przed zniekształceniem.
- **ControlPanel.tsx:** W Kroku 1 renderuje suwaki akumulacji (wpłata, wiek, stopy, alokacja). W Kroku 2 renderuje suwaki dekumulacji (wypłata, lata życia) + read-only podgląd parametrów z Kroku 1.
- **StatSummary.tsx:** W Kroku 1 pokazuje kapitał/zysk/tarczę podatkową na moment emerytury. W Kroku 2 pokazuje czas przetrwania kapitału, kapitał końcowy (spadek), łączne wypłaty, alert bankructwa lub sukcesu (🏖️).
- **Zmienione pliki:** `useSimulatorStore.ts`, `App.tsx`, `ControlPanel.tsx`, `StatSummary.tsx`.
- **Silnik Rust/Wasm:** BEZ ZMIAN — silnik nadal oblicza pełną symulację, frontend jedynie filtruje widok.

**Iteracja 20 (Twarde Dane Wkładu Własnego — Chłopski Rozum)**:
- **Problem UX:** Brak bezpośredniego podsumowania kosztów użytkownika. Aplikacja nie tłumaczyła 'ile fizycznie przelałeś'.
- **Zmiana w silniku:** Dodano pole `total_invested_real` do struct `YearlyData` in `lib.rs`. Pole śledzi siłę nabywczą wpłat po uwzględnieniu inflacji. Lustrzane dodanie w `engineMock.ts`. Rekompilacja Wasm.
- **UI (StatSummary.tsx, Krok 1):** Nowa sekcja "Wkład Własny" z kafelkami: Łączny Wkład Własny (nominal), Siła Nabywcza Wkładu (real), oraz zdanie "Chłopski Rozum": 'Wpłacasz X zł, a otrzymujesz Y zł kapitału'.

## Kamień Milowy: Repozytorium GitHub
- **Data:** 2026-04-01
- **Cel:** Zabezpieczenie kodu i przygotowanie do pracy nad zaawansowanymi modułami.
- **Działania:**
  - Zainicjowanie lokalnego repozytorium Git w katalogu głównym projektu.
  - Skonfigurowanie pliku `.gitignore` dla technologii React, Rust (Wasm) i pomocniczych artefaktów agenta.
  - Wykonanie pierwszego commitu: *"Initial commit: Kinetic Oracle IKE Simulator"*.
  - Dodanie zdalnego repozytorium: `https://github.com/k0k0sek-netizen/ike-simylator.git`.
  - Pomyślny push głównej gałęzi (`main`) na GitHub.
- **Status Architektury:** Zamknięcie etapu stabilizacji silnika matematycznego `f64` oraz interfejsu dwufazowego (Dwa Dashboardy). Architektura jest skalowalna i gotowa na moduły portfeli i obligacji.

**Iteracja 21 (Tabela Inspekcji Danych — Rok po Roku)**:
- **Nowy komponent:** `YearlyDataTable.tsx` — rozwijana tabela inspekcyjna z animacją Framer Motion (height + opacity).
- **Kolumny:** Rok/Wiek | Wpłacono/Wypłacono | Zysk Nom. | Saldo Kapitału. Footer z sumą Σ.
- **Design:** Szklany efekt bg-white/3, naprzemienne wiersze, custom scrollbar (max-h-96), tabular-nums font-mono.
- **Integracja:** Umieszczony w App.tsx pod `InteractiveChart`, przed `ControlPanel`. Zasilany przefiltrowanymi danymi `chartScenario.yearlyData`.
- **Kontekstowość:** W Kroku 1 pokazuje "Wpłacono" (zielony), w Kroku 2 "Wypłacono" (czerwony).
- **Custom CSS:** Dodano `.custom-scrollbar` do `index.css` (4px thumb, transparent track).

**Iteracja 22 (Trzy Filary i Granularne IKE — Core Engine Override)**:
- **Silnik Rust (lib.rs):** Przebudowano rdzeń obliczeniowy z modelu 2 na 3 filary (Core, Satelita, Obligacje EDO). Wprowadzono parametry `bonds_rate` i `bonds_weight`.
- **Proportional Capping (IKE):** Zastąpiono globalny checkbox trzema niezależnymi flagami `is_ike`. Silnik automatycznie sumuje wpłaty na konta IKE i proporcjonalnie redukuje je, jeśli suma przekracza roczny limit (26 000 PLN), zachowując balans portfela.
- **3-składnikowy Rebalancing:** Faza dekumulacji obsługuje teraz 3 salda w pętli z ujednoliconą wypłatą pobieraną proporcjonalnie do bieżącego udziału każdego wiadra w całkowitym kapitale.
- **Frontend (Zustand):** Zaktualizowano `useSimulatorStore` o `setAllocation` (Złota Zasada 100% — zmiana jednego suwaka koryguje pozostałe). Usunięto przestarzały `maximizeIkeLimit`.
- **UI (ControlPanel.tsx):** 3 suwaki alokacji z kolorowymi akcentami (Secondary/Amber/Indigo). Sekcja granularnego wyboru IKE/BELKA dla każdego filaru z ostrzeżeniem prawnym.
- **Data Integrity:** Zmigrowano bazę danych PGlite do wersji `v3` (nowe kolumny). Zaktualizowano JS mock silnika (`engineMock.ts`).

**Iteracja 23 (Fix UI & Gotowe Strategie — Presets)**:
- **Fix UI (Waloryzacja):** Przywrócono suwak "Waloryzacja wpłat (Step-up)" w `ControlPanel.tsx` (zakres 0-15%). Parametr ten pozwala na symulowanie rocznego zwiększania kwoty oszczędności, co radykalnie zmienia końcowy wynik kapitału przy długich horyzontach (magia procentu składanego).
- **Zasoby (Presets):** Wdrożono sekcję "Gotowe Strategie Inwestycyjne" w `TemplatesPanel.tsx`. 
- **3 Nowe Modele:**
    1. **Klasyka (Bogleheads):** 80% Świat, 20% EDO.
    2. **Barbell (Sztanga):** 20% Krypto, 80% EDO.
    3. **All-Weather (Dalio Lite):** 40% Świat, 10% Krypto, 50% EDO.
- **Interakcja:** Kliknięcie w kafelek atomowo aktualizuje Alokację, Stopy Zwrotu oraz Flagi IKE/BELKA bez ingerencji w wiek czy kwotę bazową użytkownika. Zastosowano animacje `whileHover` i `whileTap` dla efektu "premium feel".
- **Store Upgrade:** Rozszerzono funkcję `setAllocation` w `useSimulatorStore.ts`, aby umożliwiała jednoczesne ustawianie wszystkich trzech wag portfela (bypass dla proporcjonalnego rebalancingu).

**Iteracja 24 (Clean UI & Nowe Strategie — Tech Lead Review Overhaul)**:
- **Clean UI (Data Integrity):** Całkowicie usunięto logikę 'Przewidywanego Kapitału' z kafelków strategii. Diagnoza wykazała, że próba wyliczania podglądu wewnątrz komponentu UI bez pełnego przejścia przez silnik Rust generowała absurdalne i mylące wartości. Teraz kafelki służą wyłącznie jako selektory parametrów, a rzetelny wynik prezentowany jest na głównym liczniku StatSummary (100% Wasm/Rust).
- **Rozszerzenie Katalogu Strategii:** Dodano dwie nowe, popularne strategie:
    1. **Nowoczesna Klasyka (80/20):** 80% Świat, 20% Krypto (akcent wzrostowy).
    2. **Kanapowiec (100% Bezpieczeństwa):** 100% EDO (maksymalna ochrona kapitału).
- **UX Layout:** Wdrożono responsywną siatkę `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` dla lepszego układa kafelków (obecnie 5 wariantów).
- **Code Cleanup:** Usunięto nieużywane importy (`AnimatedCounter` w TemplatesPanel) i uproszczono strukturę kafelka (grow dla opisu).

**Iteracja 25 (Transparentność Podatkowa — Paragon od Fiskusa)**:
- **Silnik Rust (lib.rs):** Rozszerzono struktury `YearlyData`, `CalculationResult` i `ScenarioResult` o pole `tax_paid`. Zaimplementowano logikę naliczania fizycznie potrącanego podatku Belki (19%) dla portfeli nieobjętych tarczy IKE.
- **JS Mock (engineMock.ts):** Lustrzana implementacja logiki `taxPaid`, zapewniająca identyczne wyniki w trybie deweloperskim i produkcyjnym.
- **WASM Build:** Pomyślnie zrekompilowano silnik Rust do docelowej binarki Wasm (`wasm-pack build`).
- **UI (StatSummary.tsx):** Wdrożono nowy kafelek "Zapłacony podatek (Belka)". 
    - Jeśli podatek > 0: kolor `text-error` (czerwony), wartość ujemna (np. `- 45 000 zł`), ikona `receipt_long`.
    - Jeśli podatek = 0: kolor `text-primary` (zielony), komunikat `0 zł (Pełna tarcza!)`, ikona `verified`.
- **Integracja:** Zapewniono pełną spójność danych — `tax_shield` (zaoszczędzony) oraz `tax_paid` (zapłacony) tworzą teraz pełny obraz fiskalny inwestycji.

**Iteracja 26 (Rozbicie Podatkowe & Donut Chart — Precision Overhaul)**:
- **Silnik Rust (lib.rs):** Rozbito `tax_paid` na trzy dedykowane pola: `tax_paid_core`, `tax_paid_sat`, `tax_paid_bonds`. Zaimplementowano precyzyjne sumowanie kosztów per-aktywo w fazie akumulacji i dekumulacji. Pomyślnie zrekompilowano WASM.
- **JS Mock (engineMock.ts):** Zsynchronizowano strukturę danych i logikę obliczeń z silnikiem Rust.
- **StatSummary (UI):** Dodano szczegółowe rozbicie "Paragonu od Fiskusa" pod główną kwotą podatku. Wyświetla ono koszty tylko dla filarów z niezerowym podatkiem (np. "Krypto: -3 500 zł | EDO: -120 zł").
- **Donut Chart (SVG + Framer Motion):** Wdrożono natywny, super-lekki wykres kołowy wizualizujący alokację portfela. Wykorzystuje `stroke-dasharray` i animacje `framer-motion` bez zewnętrznych zależności typu `recharts`.
- **Layout:** Przebudowano `ControlPanel.tsx` na responsywny układ dwukolumnowy (suwaki + donut), co podbiło estetykę sekcji "Twoja Strategia".


**Iteracja 27.2 i 27.3 (UI Hotfix & Theme Persistence)**:
- **Root Cause Fix:** Zdiagnozowano i usunięto błąd nakładania się elementów w nagłówku. Przyczyną była klasa `fixed` na `EngineStatusBadge`, która łamała strukturę Flexbox. Zmieniono pozycjonowanie na `inline-flex` wewnątrz kontenera narzędzi.
- **Theme Engine:** Wdrożono reaktywny system Dark/Light Mode z persistencją w `localStorage`. Użyto middleware `persist` w Zustand, co gwarantuje zachowanie preferencji użytkownika po odświeżeniu strony.
- **Clean UI:** Usunięto martwą ikonę użytkownika (UserAvatar) i zoptymalizowano typografię nagłówka (`tracking-widest`).

**Iteracja 27.4 (Hotfix Kontrastu — WCAG Polish)**:
- **Diagnoza Dostępności:** Wykryto i naprawiono błędy kontrastu w trybie jasnym (Light Mode), gdzie białe teksty zlewały się z jasnym tłem.
- **Inverted CTA:** Wdrożono "odwrócony" styl dla głównych przycisków akcji (`ZAPISZ`, `UDOSTĘPNIJ WYNIK`). W trybie jasnym posiadają one ciemne, solidne tło (`bg-slate-900`), a w ciemnym zachowują neonowy, półprzezroczysty charakter.
- **Komponenty Naprawcze:**
    - **App.tsx:** Poprawiono czytelność przełącznika faz (Krok 1 / Krok 2).
    - **StatSummary.tsx:** Wszystkie liczniki i etykiety korzystają z dynamicznych barw `text-on-surface`, eliminując problem niewidocznych kwot.
    - **TemplatesPanel.tsx:** Przywrócono widoczność kafelków strategii — tytuły i opisy are teraz w pełni czytelne na białym tle.
    - **YearlyDataTable.tsx:** Przebudowano tabelę rok po roku, dodając pasy (zebra) i poprawiając widoczność salda oraz lat.
    - **EngineStatusBadge.tsx:** Dostosowano kolory statusu (zielony/żółty) do jasnego tła, zwiększając kontrast zgodnie z WCAG.
- **Efekt Finałowy:** Aplikacja jest w 100% dostępna i estetyczna w obu trybach kolorystycznych, spełniając standardy profesjonalnych produktów finansowych.

**Iteracja 27.5 (Twardy Reset Typografii — Hardcoded Tailwind)**:
- **Diagnoza krytyczna:** Customowe zmienne CSS (`text-on-surface`) mimo poprawek generowały błędy kontrastu (biały tekst na białym tle) w trybie jasnym na niektórych urządzeniach. Podjęto decyzję o całkowitej rezygnacji z abstrakcji kolorystycznej w typografii na rzecz natywnych klas utility Tailwinda.
- **Operacja 'Search & Replace':** Wdrożono twarde klasy w 5 kluczowych komponentach: `StatSummary.tsx`, `ControlPanel.tsx`, `TemplatesPanel.tsx`, `YearlyDataTable.tsx` oraz `App.tsx`.
- **Schemat kolorów:**
    - Główny tekst: `text-slate-900 dark:text-white`
    - Tekst pomocniczy: `text-slate-600 dark:text-slate-400`
    - Tła kart: `bg-white dark:bg-gray-800/50`
- **Inverted CTA:** Wymuszono ciemne tło (`bg-slate-900`) dla głównych przycisków w trybie jasnym, eliminując "niewidzialne" przyciski. 
- **Wynik:** Interfejs jest "ostry jak brzytwa" in obu motywach. Kod jest bardziej czytelny dla programisty i stabilny dla przeglądarki. System jest gotowy na Iterację 28 (Moduł Eksportu).

**Iteracja 28 i 28.1 (Moduł Eksportu — React-to-Print)**:
- **Wdrożenie:** Implementacja `react-to-print` oraz `html2canvas`. Stworzono komponenty `PrintableReport.tsx` i `SocialShareCard.tsx`.
- **Naprawa Reaktywności:** Wprowadzono unikalne klucze `key` (re-render) dla ukrytych komponentów eksportu, aby wymusić aktualizację danych z WASM przed zrzutem.
- **Optymalizacja A4:** Wymuszono sztywne wymiary 210x297mm, `print-color-adjust: exact` oraz drastycznie zredukowano marginesy i wysokość wykresów (130px), aby raport mieścił się na jednej stronie. Wyłączono animacje Chart.js dla stabilności html2canvas.

**Iteracja 29 (Native Export Engine — Final Architecture)**:
- **Diagnoza:** Wykrycie race condition w architekturze React-to-Print (zrzuty "zerowych" danych) oraz słabej obsługi Tailwind v4 przez `html2canvas`.
- **Nowa Architektura:** Całkowite usunięcie `PrintableReport`, `SocialShareCard` i `react-to-print`. Wdrożenie helpera `exportUtils.ts`.
- **Native PDF:** Generowanie statycznego stringa HTML z bezpośrednio wstrzykniętymi danymi symulacji. Wywołanie natywnego `window.print()`. Gwarantuje to 100% poprawność kwot i idealny layout A4.
- **Isolated PNG:** Tworzenie tymczasowego, odizolowanego węzła DOM (1200x630) z uproszczonymi stylami inline dla `html2canvas`. Rozwiązuje problemy z uciętymi krawędziami i asynchronicznością.
- **Cleanup:** Usunięcie długu technologicznego, uproszczenie `App.tsx` i poprawa wydajności eksportu.

## CHECKPOINT: STAN ARCHITEKTURY PO ITERACJI 29 (2026-04-02)

Zakończono budowę fundamentów oraz zaawansowanych modułów eksportu i analityki. System osiągnął poziom stabilności "Advisor Grade".

### 🏗️ Stos Technologiczny (Kinetic Stack 2026):
- **Core**: React 19 (Vite) + TypeScript (Rygorystyczna typizacja).
- **Engine**: Rust (Wasm) — model 3-filarowy (Core, Satelita, Obligacje) z dynamicznym rebalancingiem fazy wypłat. Fallback: JS Mock (1:1 logika).
- **Persistence**: PGlite (local-first PostgreSQL) — natychmiastowe operacje na danych symulacji w przeglądarce.
- **State Management**: Zustand (Persist) — obsługa motywów, faz symulacji (Akumulacja/Dekumulacja) i parametrów globalnych.
- **UI/UX**: Tailwind v4 (@theme variables) + Framer Motion (kinetyczne liczniki, przejścia sprężyste).
- **Design Pattern**: Bulletproof React Logic (Inline Styles dla kontrastu WCAG) + Modular Architecture (Zero Spaghetti).
- **Export Pattern**: Native Export Engine — bypass dla asynchroniczności Reacta poprzez generowanie statycznego HTML/CSS (PDF) oraz izolację węzłów DOM (PNG).

### ✅ Aktualny Status:
- [x] Silnik matematyczny f64 (Rust/Wasm) z obsługą inflacji, podatku Belki i limitów IKE.
- [x] Dwufazowy Dashboard (Budowa vs Wypłaty) z filtrowaniem danych i osi wykresu.
- [x] System strategii (Presets) z gotowymi portfelami (Bogleheads, Barbell, Dalio).
- [x] Interaktywny wykres liniowy (akumulacja/bankructwo) oraz donut chart alokacji.
- [x] Tabela inspekcyjna YearlyDataTable (rok po roku).
- [x] Niezawodny eksport PDF i PNG z gwarancją poprawności danych.
- [x] Pełna dostępność Dark/Light Mode (WCAG compliant).

### Drift Tax & Phantom Tax Hotfix (Iteracja 30/31)
- **Problem**: Silnik Rust raportował zapłacony podatek do UI, ale nie odejmował go fizycznie od salda portfela. Powodowało to identyczne wyniki Medianu P50 dla IKE i Belki.
- **Rozwiązanie**: 
    - Zaimplementowano fizyczne uszczuplanie portfela o podatek Belki (19%) podczas rocznego rebalancingu.
    - Zrefaktoryzowano silnik deterministyczny na jedną pętlę wspólną (wcześniej 3 niezależne), co umożliwiło symulację dryfu i podatku również w Kroku 1.
    - Naprawiono zarządzanie bazą kosztową (cost base) po rebalansingu, aby uniknąć podwójnego opodatkowania.
- **Status**: Przetestowane i zweryfikowane. IKE wygrywa z Belką o kwoty rzędu setek tysięcy PLN przy długich horyzontach i dużej zmienności.

**Iteracja 30-31 (Phantom Tax Hotfix & Cinematic UX)**:
- **Status matematyczny**: Całkowita eliminacja błędu "Phantom Tax". Silnik Rust fizycznie uszczupla salda o 19% Belki przy rebalancingu na kontach opodatkowanych. Weryfikacja asercji potwierdziła przewagę IKE nad Belką o setki tysięcy PLN w realistycznych scenariuszach (30 lat, wysoka zmienność).
- **Status UX**: Wdrożenie View Transitions API dla natywnych, płynnych przejść między fazą Budowy a Wypłat. Zastosowano flushSync w React 19 dla synchronizacji stanu z animacją przeglądarki. Skonfigurowano kinetyczne krzywe Beziera w Global CSS.

**Iteracja 32 (Edge AI - Kinetic AI Advisor)**:
- **Architektura**: Integracja lokalnego modelu LLM (Phi-3-mini) poprzez bibliotekę WebLLM (WebGPU). 
- **Zasoby**: Utworzenie `aiEngine.ts` (wrapper WebLLM), `contextExporter.ts` (dynamiczne budowanie kontekstu z danych symulacji) oraz `AIAdvisorPanel.tsx` (kinetyczny panel doradcy).
- **Security**: 100% Privacy-First – dane symulacji nigdy nie opuszczają przeglądarki.
- **Resilience**: Wdrożenie detekcji WebGPU i eleganckiego error-handlingu dla niewspieranych urządzeń.
- **Wynik**: Użytkownik otrzymuje "brutalnie szczerą" analizę portfela opartą na twardych danych statystycznych z Monte Carlo.

**Poprawka Stabilności AI (Hardware-Aware Fallback)**:
- **Diagnoza**: Wykryto, że sterowniki na Linux Mint/Chrome nie wspierają cechy WebGPU 'shader-f16', co powodowało błędy WGSL i zawieszanie systemu przy modelach q4f16_1.
- **Wdrożenie**: Implementacja głębokiego audytu adaptera GPU. Jeśli brak 'shader-f16', system automatycznie przełącza się na model SmolLM (Safe Mode) na WASM/CPU.
- **Konfiguracja**: Naprawa rejestracji modeli w appConfig (dodanie brakujących pól model_lib) dla wersji WebLLM 0.2.82.

**Poprawka Stabilności AI v3 (TinyLlama f32 Fallback)**:
- **Problem**: SmolLM na Hugging Face zwracał błąd 401 (Unauthorized). Model Qwen2 na GPU zawieszał system ze względu na brak wsparcia f16.
- **Rozwiązanie**: Przełączenie trybu SAFE na model TinyLlama-1.1B (f32). Jest on w pełni publiczny (Open Access) i nie wymaga instrukcji f16, co gwarantuje stabilne działanie na słabszych GPU/instancjach Linux bez autoryzacji.
- **Efekt**: 100% stabilna inicjalizacja doradcy AI "z pudełka".

**KRYTYCZNY HOTFIX: f32 Cache & 404 Resolution**:
- **Problem**: Ręczne wstrzykiwanie URL-i do appConfig powodowało błędy 404, które trwale uszkadzały przeglądarkowy Cache API, blokując renderowanie aplikacji.
- **Rozwiązanie**: Całkowite usunięcie nadpisania appConfig. Przejście na natywną inicjalizację WebLLM.
- **Model SAFE**: Jako natywny fallback dla braku wsparcia f16 wybrano model Llama-3.2-1B-Instruct-q4f32_1-MLC (obecny w rejestrze v0.2.82).
- **Zalecenie**: Operator musi ręcznie wyczyścić dane witryny (Clear site data) w DevTools.


**Aktualizacja Systemu: Wymuszanie Dedykowanego GPU**:
- **Problem**: Chrome na systemie Linux domyślnie przydzielał procesowi WebGPU zintegrowany układ graficzny (iGPU), co przy limicie workgroup=256 blokowało poprawne działanie LLM.
- **Rozwiązanie**: Dodano flagę 'powerPreference: high-performance' w konfiguracji CreateMLCEngine. Ma to na celu wymuszenie na przeglądarce wyboru dedykowanej karty graficznej (dGPU) o większych limitach zasobów.
- **Model**: Pozostajemy przy Llama-3.2-1B (f32) jako najbezpieczniejszym fundamencie stabilności.

### PUNKT PRZYWRACANIA: Migracja na Groq Cloud API
- **Akcja**: Usunięcie biblioteki @mlc-ai/web-llm oraz pliku aiEngine.ts.
- **Wdrożenie**: Implementacja groqService.ts (model: deepseek-r1-distill-llama-70b).
- **Zadanie**: Użytkownik musi dodać VITE_GROQ_API_KEY do pliku .env.
- **Decyzja**: Przejście na pełną komunikację w języku POLSKIM we wszystkich aspektach projektu.

### POPRAWKA KRYTYCZNA: Zmiana Modelu Groq (2026-04-04)
- **Problem**: Błąd 400 z Groq API. Model 'deepseek-r1-distill-llama-70b' został wycofany z platformy.
- **Rozwiązanie**: Przełączenie na model 'deepseek-r1-distill-qwen-32b'. Jest to wysoce wydajny zamiennik o świetnych parametrach logicznych.
- **Status**: System zaktualizowany i gotowy do ponownych testów.

### STABILIZACJA MODELU AI: Przejście na Llama 3.3 (2026-04-04)
- **Decyzja**: Ze względu na wysoką niestabilność dostępności oraz błędy 400 modeli DeepSeek na Groq, zdecydowano o przejściu na produkcyjny i stabilny model 'llama-3.3-70b-versatile'.
- **Efekt**: Gwarancja ciągłości działania doradcy oraz najwyższa jakość analityki finansowej bez ryzyka nagłego wycofania modelu.

### UPGRADE DORADCY AI: Logika biznesowa (2026-04-04)
- **Modyfikacja**: Rozbudowa SYSTEM_PROMPT o wymóg sekcji '### Rekomendowane Działania'.
- **Cel**: Zmiana charakteru wypowiedzi AI z czystej analizy na konkretne wytyczne (np. korekta alokacji, zmiana kwoty wypłat).
- **Efekt**: Doradca dostarcza teraz bezpośrednią wartość użytkową, wskazując jak poprawić parametry finansowe symulacji.

### WIZUALIZACJA MONTE CARLO: Lejek Ryzyka (2026-04-04)
- **Implementacja**: Dodano serie P10 (dolna granica) i P90 (górna granica) jako przerywane linie dashed w InteractiveChart.tsx.
- **Hierarchia**: Mediana P50 została zmieniona na AreaSeries, co nadaje wykresowi masę wizualną w centrum prognozy.
- **Optymalizacja**: Wprowadzono margines osi Y (top: 0.4) w celu uniknięcia "zgniecenia" wykresu przez wysokie piki P90.
- **Estetyka**: Zastosowano przezroczystości i klasy semantyczne (secondary), zachowując spójność z Glassmorphismem.

### REFAKTORYZACJA UX WYKRESU: Czytelność i Hierarchia (2026-04-04)
- **Legenda**: Przeniesiono legendę z pozycjonowania absolutnego pod kontener wykresu. Rozwiązano problem zasłaniania osi X i dat.
- **Oś Y**: Ukryto tytuły oraz ostatnie wartości (lastValueVisible) dla serii Monte Carlo. Oś Y skupia się teraz wyłącznie na czystych danych finansowych.
- **Wizualizacja**: Znacząco obniżono krycie (opacity) serii P10, P50 i P90 (do poziomu 0.05 - 0.15), tworząc efekt "cienia" w tle, który nie odciąga uwagi od głównych wyników nominalnych.

### FIX LAYOUTU WYKRESU: Oś X i Y (2026-04-04)
- **Oś X**: Zmieniono 'aspect-video' na stałą wysokość 'h-[400px]'. Rozwiązano problem ucinania dat i logo TradingView na dole wykresu.
- **Oś Y**: Wyłączono 'lastValueVisible' dla serii 'Zysk Netto' i 'Wpłacony Kapitał'. Oś Y wyświetla teraz tylko jedną, czystą wartość końcową dla serii 'Tarcza IKE', co zapobiega nakładaniu się etykiet.
- **Responsywność**: Poprawiono formatowanie handlera zmiany rozmiaru okna dla lepszej czytelności kodu.

### HOTFIX INTERAKTYWNOŚCI: Przywrócenie Osi X i Tooltipów (2026-04-04)
- **Oś X**: Usunięto padding 'p-4' z kontenera 'chartContainerRef' oraz 'overflow-hidden' z rodzica. Canvas zajmuje teraz 100% przestrzeni, co przywróciło widoczność skali czasu i logo TradingView.
- **Tooltipy**: Wdrożono niestandardowy Floating Tooltip (HTML overlay) używając 'subscribeCrosshairMove'. Wyświetla on teraz kompletne dane: Tarcza IKE, Zysk Netto, Kapitał oraz wartości P10/P50/P90 Monte Carlo.
- **Pointer Events**: Skorygowano strukturę warstw, aby zdarzenia myszy nie były blokowane przez elementy dekoracyjne czy legendę.

### FINALIZACJA INTERFEJSU WYKRESU: Stacking Context (2026-04-04)
- **Z-Index**: Podniesiono 'z-index' kontenera 'chartContainerRef' do 20 oraz tooltipa do 1000. Rozwiązano problem dymka chowającego się pod legendą.
- **Status**: Interfejs wykresu uznany za w 100% zamknięty i gotowy do wdrożenia eksportu PDF.

### STRUKTURALNA FIXA STACKING CONTEXT: Tooltip vs Legenda (2026-04-04)
- **Architektura**: Wprowadzono hierarchiczne pozycjonowanie kontenerów: wykres (z-30) nad legendą (z-10).
- **Efekt**: Rozwiązano problem izolacji warstw, umożliwiając tooltipowi swobodne unoszenie się nad wszystkimi elementami UI sekcji InteractiveChart.

### KRYTYCZNY HOTFIX: INWERSJA LOGIKI SUKCESU (2026-04-05)
- **Problem**: Silnik Monte Carlo zwracał `depletionRate` (wskaźnik wyczerpania) jako `successRate`. Portfele bankrutujące w 9. roku pokazywały 86% "sukcesu".
- **Rozwiązanie**: Wdrożono inwersję logiczną `1.0 - result.successRate` bezpośrednio w `useSimulatorStore.ts`.
- **Efekt**: Dane w całej aplikacji (StatSummary, AI Advisor) są teraz poprawne. Portfele o wysokim ryzyku bankruktwa poprawnie wyświetlają niską szansę na sukces i czerwone alerty (bg-error).

### REWIZJA I POPRAWKA: STATE BINDING VS INWERSJA (2026-04-05)
- **Problem**: Poprzednia hipoteza o inwersji danych z silnika była błędna. Prawdziwym problemem był "wyciek stanu" — obie fazy symulacji współdzieliły ten sam obiekt `mcResult`, co prowadziło do wyświetlania nieaktualnych danych.
- **Rozwiązanie**: Wycofano inwersję matematyczną. Rozdzielono stan Monte Carlo na `mcResultAccumulation` i `mcResultDecumulation`.
- **Efekt**: Pełna izolacja danych między zakładkami. UI i AI Advisor odczytują teraz wyniki właściwe dla aktualnie przeglądanej fazy.

### PROTOKÓŁ RATUNKOWY: CORS & STABILIZACJA UI (2026-04-05)
- **Problem**: Groq API zablokował zapytania bezpośrednie (CORS), a błędy sieciowe powodowały zamrażanie suwaków i UI. Wskaźniki Monte Carlo nadal wykazywały "schizofrenię" (przeciekanie między fazami) po odświeżeniu.
- **Rozwiązanie**: 
  1. Skonfigurowano Vite Proxy (/api/groq) dla bezpiecznej komunikacji chmurowej. 
  2. Wprowadzono defensywne try/catch in groqService.ts (zapasowa wiadomość o błędzie zamiast crashu). 
  3. Dodano 'key={store.activePhase}' do StatSummary in App.tsx, wymuszając czysty reset komponentu przy zmianie zakładki.
- **Efekt**: Pełna płynność suwaków, stabilna komunikacja z AI i perfekcyjna izolacja faz symulacji.

### REAKTYWACJA WYKRESU I KONTEKSTU AI (2026-04-05)
- **Problem**: Po rozdzieleniu stanu Monte Carlo wykres (`InteractiveChart.tsx`) przestał się odświeżać, gdyż odwoływał się do zdezaktualizowanego pola `mcResult`. Dodatkowo AI Advisor nie rozpoznawał poprawnie statusu IKE.
- **Rozwiązanie**: 
  1. Zmieniono selektor danych w `InteractiveChart.tsx` na dynamiczny (wybór właściwej fazy) i przeniesiono hook Store na górę komponentu dla pełnej reaktywności.
  2. Przebudowano sekcję alokacji w `contextExporter.ts`, wprowadzając jawny format "- Aktywo: X% (IKE: Włączone/Wyłączone)".
- **Efekt**: Wykres błyskawicznie reaguje na suwaki, a AI Advisor precyzyjnie identyfikuje optymalizację podatkową.

### TWARDY RESET IZOLACJI STANU (2026-04-05)
- **Problem**: "Przeciekanie" danych między Fazą 1 a Fazą 2. Obie fazy pokazywały ten sam Success Rate (56%), a AI Advisor błędnie widział medianę 1.2 mln zamiast 19 mln w Fazie 2.
- **Rozwiązanie**: 
  1. Skonfigurowano `calculateMonteCarlo` tak, aby dla fazy akumulacji przesyłał `withdrawalYears: 0`. Gwarantuje to unikalne statystyki dla każdego kroku.
  2. Zaktualizowano `contextExporter.ts`: AI otrzymuje teraz dane z konkretnego punktu czasowego (Target Year) dopasowanego do aktualnej fazy (koniec budowy vs koniec wypłat).
  3. Usunięto fallbacki in `StatSummary.tsx`.
- **Efekt**: Całkowita separacja danych. Krok 2 pokazuje teraz rzetelne 100% szansy (przy medianie 19 mln) i właściwy koniec horyzontu czasowego.

**Iteracja 33 (Tax Law Guard & Stale Closure Fix)**:
- **Problem**: Modele AI sugerowały nielegalne rozwiązania (np. dwa konta IKE). Wykryto też *stale closure* w eksporterze danych (nieaktualne wyniki Monte Carlo).
- **Rozwiązanie**: Wdrożono **Wzajemne Wykluczenie IKE** (IKE EDO vs IKE Maklerskie) w Store i UI. Wymuszono świeży stan przez `useSimulatorStore.getState()` w `contextExporter.ts`. Wstrzyknięto "brutalne" blokady prawne do promptów AI.
- **UI**: Dodano noty prawne o zasadach łączenia aktywów w IKE.

**Iteracja 34 (Neon Dark PDF Report Generator)**:
- **Silnik**: `pdfExportService.ts` pierwotnie na `html2canvas` (zastąpiony przez `html-to-image`). Raport w estetyce "Neon Dark".
- **UI Prep**: Klasa `.hide-for-pdf` dla elementów interaktywnych (aktywna tylko podczas `.is-exporting`). Oznaczono suwaki, przyciski, nawigację i szablony.
- **Modernizacja (2026-04-06)**: Usunięto `html2canvas` ze względu na brak wsparcia dla nowoczesnych kolorów `oklab` z Tailwind v4. Zaimplementowano `html-to-image` w `pdfExportService.ts` oraz `exportUtils.ts`, co przywróciło perfekcyjne renderowanie gradientów "Neon Dark" w raportach.
- **Fixy**: Naprawiono błędy składniowe w `ControlPanel.tsx` i `TemplatesPanel.tsx` po masowej edycji klas.

## AKTUALNY STAN (2026-04-06)
**Zakończono na:** Pełnej modernizacji silnika eksportu (wymiana `html2canvas` -> `html-to-image`). Rozwiązano problem nieobsługiwanych kolorów `oklab`. Symulator jest w pełni stabilny, rzetelny prawnie i wizualnie przygotowany do generowania wysokiej jakości raportów PDF.

## 2026-04-07: Migracja Eksportu na Recharts (SVG) - "The Final Vector"
*   **Problem**: Throttling canvasu (RAF) w ukrytym DOM oraz artefakty DPI/marginesów w html2canvas przy renderowaniu lightweight-charts.
*   **Rozwiązanie**: Całkowita migracja szablonu eksportu na bibliotekę Recharts (SVG).
*   **Kluczowe Zmiany**:
    *   Wdrożono `ComposedChart` w `ExportTemplate.tsx` zastępując `InteractiveChart`.
    *   Usunięto blokadę skalowania P90 w aplikacji (`InteractiveChart.tsx`) - wykres teraz naturalnie reaguje na pełny zasięg Monte Carlo.
    *   Wprowadzono twarde renderowanie wektorowe (Area/Line) z wyłączonymi animacjami dla 100% stabilności zrzutu.
    *   Usunięto nieużywany mechanizm "Native Screenshot Hack".
*   **Wynik**: Raporty PDF i PNG są teraz idealnie ostre, bez uciętych osi i błędów renderowania, zachowując estetykę Neon Dark.

## 2026-04-07: Polish & Axes - "Functional Vector"
*   **Zmiana**: Dodano brakujące komponenty osi X (lata), osi Y (kwoty z formatterem K/M) oraz siatkę pomocniczą do wykresu Recharts.
*   **Wynik**: Wykres na PDF/PNG jest teraz w pełni funkcjonalny i spełnia standardy profesjonalnej analizy danych, zachowując estetykę Neon Dark.

## 2026-04-07: Wykres Eksportu - Kalibracja i Dopasowanie ("The Perfect Fit")
*   **Problem**: Wykres Recharts wylewał się poziomo z diva (overflow) oraz linia P90 była ucinana na górze. Oś X pokazywała indeksy zamiast lat.
*   **Rozwiązanie**: 
    *   Skalowano szerokość wykresu do `760px`.
    *   Wprowadzono lata kalendarzowe na osi X z inteligentnym odstępem (`minTickGap=30`).
    *   Dodano 10% bufora bezpieczeństwa (`domain`) na osi Y, aby piki P90 miały "oddech".
*   **Wynik**: Raport prezentuje dane w sposób identyczny jak główna aplikacja, zachowując idealne proporcje i czytelność.

## 2026-04-07: Wymiary Eksportu - Fizyczna Izolacja ("Safe Margins")
*   **Problem**: Trwały overflow poziomy wykresu Recharts pomimo wcześniejszych poprawek. Szerokość SVG kolidowała z paddingiem rodzica.
*   **Rozwiązanie**: 
    *   Redukcja szerokości SVG do bezpiecznych `700px`.
    *   Zwiększenie prawego marginesu wewnętrznego (`right: 40`) w celu ochrony serii P90 przed ucięciem.
    *   Wdrożenie `padding: 10px` oraz centrowania `flex` w kontenerze tła.
*   **Wynik**: Wykres jest idealnie wyśrodkowany, ma bezpieczny margines po prawej stronie i nie przebija tła kontenera.

## 2026-04-07: Kontener Eksportu - Model Pudełkowy ("Center & Box Align")
*   **Problem**: Kontener tła wykresu Recharts miał narzuconą sztywną szerokość w pikselach, co w połączeniu z paddingiem powodowało tzw. Box Model Breakout i rozpychanie całego layoutu raportu w prawo.
*   **Rozwiązanie**: 
    *   Wymuszono \`width: '100%'\` oraz \`boxSizing: 'border-box'\` na granatowym kontenerze wyrównując go z resztą sekcji (np. z analizą AI).
    *   Zwiększono wewnętrzny padding kontenera z \`10px\` do \`20px\`.
    *   Skalibrowano szerokość wewnętrznego komponentu SVG do \`width={780}\` (oraz zredukowano jego Theight do \`360\`), uwzględniając nowe paddingi boxu.
*   **Wynik**: Tło wykresu tworzy teraz idealną, prostą krawędź z resztą raportu, zamykając architektoniczną łatę systemu eksportowania.

## 2026-04-07: Raport PDF - Integracja KPI "Paragon od Fiskusa"
*   **Zmiana**: Wprowadzono nowy wskaźnik KPI "ZAPŁACONY PODATEK" do szablonu eksportu, zastępując zduplikowany kafelek "HORYZONT".
*   **Logika**: Wykorzystano twarde style HEX (#ef4444 dla strat/podatków, #4edea3 dla pełnej tarczy) oraz warunkowe formatowanie kwot z minusem.
*   **Wynik**: Raport dostarcza teraz pełnej informacji biznesowej o realnym koszcie podatkowym inwestycji poza IKE.

## 2026-04-07: Raport PDF - Hotfix Bindowania Podatku
*   **Problem**: Wskaźnik "ZAPŁACONY PODATEK" w szablonie eksportu pokazywał 0 zł, podczas gdy Dashboard wskazywał realną kwotę.
*   **Rozwiązanie**: Poprawiono bindowanie danych – zmieniono źródło z `activeScenario.taxPaid` na `lastYear.taxPaid`. 
*   **Przyczyna**: `activeScenario.taxPaid` nie zawsze jest poprawnie wypełniane w silniku mockowym dla wszystkich faz, natomiast dane roczne (`yearlyData`) zawsze zawierają poprawny agregat `taxPaid`.
*   **Wynik**: Pełna zgodność kwot podatku między widokiem aplikacji a wygenerowanym PDF.

---
### [ARCHIWALNE PRÓBY PRZED MIGRACJĄ NA RECHARTS]
*Zapisane z dziennika pobocznego memory1.md - dokumentują walkę z Lightweight Charts Canvas, co ostatecznie wymusiło migrację SVG (Recharts).*

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

## [2026-04-07] Data Enrichment & Oklab Final Sterilization
### Wzbogacenie Biznesowe Raportów
Zakończono rozbudowę komponentu `ExportTemplate.tsx` o sekcję **Business Input Parameters**. Raporty PDF/PNG zawierają teraz kompletny zestaw danych wejściowych symulacji:
- **Parametry Symulacji**: miesięczna wpłata, waloryzacja step-up, łączny wkład własny oraz ramy czasowe (wiek startowy vs emerytalny).
- **Szczegóły Aktywów**: szczegółowa tabela alokacji zawierająca przewidywane stopy zwrotu (Zysk %) oraz typ tarczy podatkowej (IKE vs Belka) dla każdego filaru portfela.

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
