# PLAN DZIAŁANIA I ZADANIA

## CEL GŁÓWNY NA DZIŚ
Rozbudowa analityki danych (CSV) oraz kinetycznego interfejsu UX (Neon Shadows), a następnie Pivot w stronę Modułu Kreatora Portfela (Portfolio Builder).

## W TRAKCIE (IN PROGRESS)
- [ ] **Moduł Kreatora Portfela (Portfolio Builder)**: Integrowanie słownika instrumentów finansowych.
- [ ] **Eksport surowych danych YearlyDataTable do CSV.**

## ZROBIONE (DONE)
- [x] Iteracja 6-29: Fundamenty, PGlite, Wasm Engine, 3-filary, Export PDF/PNG v1.
- [x] Iteracja 30-34: Cinematic UX, AI Advisor, Monte Carlo Visualization.
- [x] **Iteracja 35: Recharts SVG Export Migration (THE FINAL VECTOR)**:
    - [x] Implementacja `ExportTemplate.tsx` w 100% SVG (Recharts).
    - [x] Kalibracja Box Modelu, marginesów i buforów osi Y.
    - [x] Integracja KPI "ZAPŁACONY PODATEK" (Paragon od Fiskusa).
    - [x] Hotfix bindowania danych finansowych (1:1 z Dashboardem).
    - [x] Czyszczenie martwego kodu w `InteractiveChart.tsx`.

## DO ZROBIENIA (TODO)
- [ ] **Eksport surowych danych YearlyDataTable do CSV.**
- [ ] **Dynamic UX:** Neon Shadows reagujące na stopy zwrotu (Dynamic Backgrounds).
- [ ] **Cloud Sync:** Integracja z Supabase (Autoryzacja i trzymanie scenariuszy w chmurze).
- [ ] **Benchmark Comparison:** Porównanie portfela z rynkowymi standardami.

**Status**: Ready-to-Launch (Faza Eksportu PDF/PNG ZAKOŃCZONA).

---

### ARTYKUŁY ZREALIZOWANE (Historie):
- [x] **Stabilizacja Eksportu oklab (2026-04-07)**:
  - [x] Implementacja architektury Off-screen Template (izolacja renderowania).
  - [x] Eliminacja błędów `parseColorStop` poprzez "Nuclear Purge" (HEX inline).
  - [x] Statyczny, wektorowy raport PDF w standardzie Neon Dark.
  - [x] Wzbogacenie raportów o parametry biznesowe i szczegóły aktywów.

**Status**: Ready-to-Launch.
