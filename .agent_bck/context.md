# KONTEKST PROJEKTU (Kinetic Oracle IKE Simulator)

## 📌 1. Absolutne Priorytety Architektoniczne
* **(Zero Spaghetti Code)**: Rozbudowany interfejs w pliku `App.tsx` jest zakazany. Komponenty UI muszą znajdować się w modularnej strukturze `src/components/`, aby utrzymanie kodu było przyjemnością. Przestrzegaj Single Responsibility Principle. Wymagane jest rygorystyczne używanie TypeScript'u, pisanie mniejszych, eleganckich interfejsów (np. `StatCard.tsx`, `ControlPanel.tsx`). Należy unikać nadmiarowości stanów. Zrozum i używaj `Zustand` do spinania danych, unikając *Prop-Drillingu*.

## 🌟 2. Wizja UX/UI i Design
* **(Wizja Kinetic/Next-Gen)**: Interakcja to rdzeń tej aplikacji finansowej z 2026 roku.
Interfejs musi sprawiać wrażenie "żywego" oprogramowania. Zmiana parametrów, wejście w widoki czy odświeżenia mają obowiązek animować się *płynnie i miękko*, a nie "przeskakiwać". 
Zaleca się mocne oparcie na bibliotece np. `framer-motion` do spinania kinetyki interakcji.
Każda gigantyczna liczba i wygenerowana wartość w locie musi reagować w formie kręciołki (CountUp/Down). Widoki winno się odświeżać przy wykorzystaniu *View Transitions API*. Tło wykorzystuje szklistość (*glassmorphism*) i animowane gradienty (Neon Shadows) do podbijania jakości wizualnych. 

Zadaniem Agenta jest ścisłe, kategoryczne pilnowanie tych dyrektyw przed napisaniem lub zmianą każdego skryptu w bieżącym projekcie.
