# PROJECT IDENTITY: Kinetic Oracle

## 🎯 1. Cel Główny
**Kinetic Oracle** to zaawansowany, kinetyczny symulator emerytalny IKE/IKZE. Aplikacja działa w 100% lokalnie w przeglądarce (**Local-First**), oferując użytkownikom prywatność, zerowe opóźnienia i profesjonalne narzędzia analityczne znane z terminali finansowych.

## 👥 2. Grupa Docelowa
Projekt jest dedykowany dla **świadomych inwestorów**, którzy optymalizują obciążenia podatkowe i planują długoterminowe budowanie bogactwa. Użytkownik Kinetic Oracle szuka precyzji matematycznej, estetyki premium oraz narzędzi do bezpiecznego prognozowania fazy rentierskiej.

## ⚙️ 3. Mechanika Biznesowa (DNA Projektu)
*   **Faza Akumulacji**: Budowa kapitału poprzez miesięczne wpłaty, waloryzację (Annual Step-Up) i procent składany.
*   **Faza Dekumulacji**: Symulacja wypłat na emeryturze z wyliczaniem bezpiecznej stopy wypłaty (SWR) i monitorowaniem bankructwa kapitału.
*   **Tarcze Podatkowe**: Precyzyjne modelowanie zysków z IKE (zwolnienie z 19% podatku Belki) w porównaniu do kont opodatkowanych.
*   **Limity IKE/IKZE**: Automatyczne pilnowanie ustawowych limitów wpłat rocznych (z uwzględnieniem proporcjonalnego rebalancingu).
*   **3 Filary Alokacji**: Podział portfela na Core (Światowy rynek), Satelitę (Aktywa ryzykowne) oraz Obligacje (np. EDO).
*   **Dynamic Rebalancing**: Inteligentne pobieranie wypłat w fazie rentierskiej, utrzymujące balans portfela mimo różnej zmienności aktywów.

## 🏗️ 4. Kluczowa Architektura (Tech Stack)
*   **Frontend**: React 19 (Vite) + TypeScript — nowoczesne, modularne UI.
*   **Engine**: Rust (Wasm) — wydajny silnik matematyczny `f64` działający w piaskownicy przeglądarki.
*   **Persistence**: PGlite — lokalna instancja PostgreSQL do zapisywania scenariuszy i portfeli.
*   **State Management**: Zustand — reaktywne zarządzanie parametrami symulacji i fazami.
*   **Export**: SVG Vector Engine — autorski silnik renderowania raportów z rygorystycznym użyciem twardych kodów HEX, eliminujący błędy parserów CSS i zapewniający wysoką wierność PDF/PNG.
*   **UX/UI**: Tailwind v4 + Framer Motion — kinetyczne liczniki i mikro-interakcje.
*   **Wasm-React Bridge**: Agregacyjna optymalizacja payloadu statystycznego (percentyle P10/50/90 liczone po stronie Rust) dla płynnej wizualizacji probabilistycznej (Area Charts).

---
### AKTUALIZACJA ARCHITEKTURY: Migracja Groq Cloud AI (2026-04-04)
- **Zmiana**: Rezygnacja z lokalnego silnika WebLLM (Edge AI) na rzecz wysokowydajnego API Groq.
- **Powód**: Problemy ze stabilnością GPU na maszynach klienckich oraz chęć zapewnienia "Premium UX" przez model DeepSeek-R1-70B.
- **Prywatność**: Dane symulacji są anonimizowane przed wysyłką. Brak zbierania danych osobowych.
- **Komunikacja**: Od tego momentu pełna komunikacja systemowa oraz kod źródłowy obsługiwane są w języku POLSKIM.
