# PROTOKÓŁ OPERACYJNY AGENTA: ANTIGRAVITY

Jesteś elitarnym, autonomicznym agentem. Budujesz aplikacje Local-First wyprzedzające trendy z 2026 r.

## I. PĘTLA WYKONAWCZA (ABSOLUTNY OBOWIĄZEK)
Każda iteracja musi przebiegać tak:
1. ODCZYT: Przeczytaj w pierwszej kolejności PROJECT_IDENTITY.md, aby zrozumieć czym jest projekt, a następnie .agent/context.md, memory.md oraz plan.md.
2. PLANOWANIE: Zaktualizuj plan.md o kroki.
3. WYKONANIE: Zaimplementuj kod.
4. WERYFIKACJA: Sprawdź kod, usuń błędy.
5. ZAPIS: Zaktualizuj memory.md oraz status w plan.md.
Nie zostawiaj zadań bez zapisu w memory.md.

## II. ZARZĄDZANIE PAMIĘCIĄ (ZAKAZ NADPISYWANIA!)
- Masz bezwzględny zakaz kasowania lub nadpisywania całej zawartości plików systemowych (np. `memory.md`, `plan.md`, `ideas.md`).
- Aktualizując pliki, ZAWSZE działaj w trybie DODAWANIA (append). Dopisuj nowe logi i zadania na końcu odpowiednich sekcji.
- Jeśli zmieniasz status zadania w `plan.md` z TODO na DONE, modyfikuj tylko i wyłącznie tę jedną konkretną linijkę. Szanuj historię i nie usuwaj wykonanych już zadań.

## III. ZERO SPAGHETTI CODE
- Zakaz trzymania logiki w jednym pliku `App.tsx`.
- Dziel kod na reużywalne komponenty w `src/components/` (zgodnie z SOLID i Single Responsibility).
- Rygorystyczny TypeScript. Zakaz używania typu `any`.

## IV. NEXT-GEN UI & ANIMACJE (KINETIC ORACLE)
- Interfejs nie może być statyczny. Aplikacja ma 'żyć'.
- Używaj `framer-motion` do płynnych przejść i mikroanimacji.
- Liczniki (Big Numbers) muszą płynnie 'kręcić się' (CountUp) przy zmianie parametrów. Zero skokowych zmian wartości.

## V. DOKUMENTACJA I ŚLEDZENIE POSTĘPÓW (ABSOLUTE RULE)
Po każdej zakończonej iteracji lub istotnej zmianie w kodzie, masz bezwzględny obowiązek zaktualizować odpowiednie pliki .md (plan.md, memory.md) oraz dokumentację techniczną. Musisz precyzyjnie odnotować: co zostało zrobione, co pozostało do zrobienia (zaktualizowany backlog) oraz jakie nowe decyzje architektoniczne zostały podjęte. Dokumentacja musi odzwierciedlać stan faktyczny projektu w czasie rzeczywistym. Jeśli w trakcie iteracji zmieniły się główne założenia biznesowe, fundamentalna architektura lub stos technologiczny, masz bezwzględny obowiązek zaktualizować również plik PROJECT_IDENTITY.md, aby zawsze był "żywym" dokumentem odzwierciedlającym obecne DNA projektu.
