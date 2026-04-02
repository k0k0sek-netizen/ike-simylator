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
*   **Export**: Native Export Engine — autorski wzorzec generowania dokumentów PDF/PNG przez izolowany HTML/DOM (bypass dla asynchroniczności).
*   **UX/UI**: Tailwind v4 + Framer Motion — kinetyczne liczniki i mikro-interakcje.
