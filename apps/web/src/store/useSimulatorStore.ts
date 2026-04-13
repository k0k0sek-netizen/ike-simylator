import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AVAILABLE_INSTRUMENTS } from '../config/instruments';

export interface MonteCarloPoint {
  year: number;
  p10: number;
  p50: number;
  p90: number;
}

export interface MonteCarloSummary {
  points: MonteCarloPoint[];
  successRate: number;
  taxPaidP50: number;
  taxShieldP50: number;
}

export interface PortfolioItem {
  instrumentId: string;
  weight: number;
  isIke?: boolean;
}


export type AppTab = 'simulator' | 'builder' | 'history' | 'settings';

export interface SimulatorState {
  activeTab: AppTab;
  customPortfolio: PortfolioItem[];
  monthlyContribution: number;
  currentAge: number;
  retirementAge: number;
  inflationRate: number;
  annualStepUp: number;
  coreRate: number;
  satRate: number;
  bondsRate: number;
  customCoreWeight: number;
  customSatWeight: number;
  customBondsWeight: number;
  isCoreIke: boolean;
  isSatIke: boolean;
  isBondsIke: boolean;
  monthlyWithdrawal: number;
  withdrawalYears: number;
  activePhase: 'accumulation' | 'decumulation';
  loadedScenarioId: number | null;
  isManagerOpen: boolean;
  isDarkMode: boolean;
  engineType: 'WASM' | 'JS_MOCK' | 'LOADING';
  
  // --- Monte Carlo Data ---
  coreVolatility: number;
  satVolatility: number;
  bondsVolatility: number;
  rebalancingStrategy: number; // 0: None, 1: Annual
  mcResultAccumulation: MonteCarloSummary | null;
  mcResultDecumulation: MonteCarloSummary | null;

  // --- Stan Doradcy AI ---
  aiStatus: 'idle' | 'ready' | 'generating' | 'error';
  aiLastResponse: string | null;
  aiError: string | null;

  setCustomPortfolio: (items: PortfolioItem[]) => void;
  setActiveTab: (tab: AppTab) => void;
  setMonthlyContribution: (val: number) => void;
  setCurrentAge: (val: number) => void;
  setRetirementAge: (val: number) => void;
  setInflationRate: (val: number) => void;
  setAnnualStepUp: (val: number) => void;
  setCoreRate: (val: number) => void;
  setSatRate: (val: number) => void;
  setBondsRate: (val: number) => void;
  setAllocation: (core?: number, sat?: number, bonds?: number) => void;
  setIsCoreIke: (val: boolean) => void;
  setIsSatIke: (val: boolean) => void;
  setIsBondsIke: (val: boolean) => void;
  setMonthlyWithdrawal: (val: number) => void;
  setWithdrawalYears: (val: number) => void;
  setActivePhase: (val: 'accumulation' | 'decumulation') => void;
  setManagerOpen: (val: boolean) => void;
  loadScenario: (data: any) => void;
  toggleDarkMode: () => void;
  setEngineType: (type: 'WASM' | 'JS_MOCK' | 'LOADING') => void;
  setVolatility: (core: number, sat: number, bonds: number) => void;
  setRebalancingStrategy: (val: number) => void;
  calculateMonteCarlo: () => Promise<void>;
  
  // --- Akcje Doradcy AI ---
  initAI: () => Promise<void>;
  calculateAIAdvice: () => Promise<void>;
  setAIStatus: (status: SimulatorState['aiStatus']) => void;
}

export const useSimulatorStore = create<SimulatorState>()(
  persist(
    (set, get) => ({
      activeTab: 'simulator',
      customPortfolio: [
        { instrumentId: 'vwce', weight: 80, isIke: true },
        { instrumentId: 'edo', weight: 20, isIke: false }
      ],
      monthlyContribution: 500,
      currentAge: 30,
      retirementAge: 60,
      inflationRate: 3.5,
      annualStepUp: 0,
      coreRate: 7, 
      satRate: 15,
      bondsRate: 1.5,
      customCoreWeight: 70,
      customSatWeight: 20,
      customBondsWeight: 10,
      isCoreIke: true,
      isSatIke: true,
      isBondsIke: false,
      monthlyWithdrawal: 4000,
      withdrawalYears: 30,
      activePhase: 'accumulation',
      loadedScenarioId: null,
      isManagerOpen: false,
      isDarkMode: true,
      engineType: 'LOADING',
      
      coreVolatility: 15,
      satVolatility: 60,
      bondsVolatility: 3,
      rebalancingStrategy: 1,
      mcResultAccumulation: null,
      mcResultDecumulation: null,

      aiStatus: 'idle',
      aiLastResponse: null,
      aiError: null,

      setCustomPortfolio: (items) => set({ customPortfolio: items }),
      setActiveTab: (val) => set({ activeTab: val }),
      setMonthlyContribution: (val) => set({ monthlyContribution: val }),
      setCurrentAge: (val) => set({ currentAge: val }),
      setRetirementAge: (val) => set({ retirementAge: val }),
      setInflationRate: (val) => set({ inflationRate: val }),
      setAnnualStepUp: (val) => set({ annualStepUp: val }),
      setCoreRate: (val) => set({ coreRate: val }),
      setSatRate: (val) => set({ satRate: val }),
      setBondsRate: (val) => set({ bondsRate: val }),
      
      setAllocation: (core, sat, bonds) => set((state) => {
        if (core !== undefined && sat !== undefined && bonds !== undefined) {
          return { customCoreWeight: core, customSatWeight: sat, customBondsWeight: bonds };
        }
        if (core !== undefined) {
          const remaining = 100 - core;
          const oldSum = state.customSatWeight + state.customBondsWeight;
          if (oldSum === 0) return { customCoreWeight: core, customSatWeight: remaining / 2, customBondsWeight: remaining / 2 };
          const newSat = Math.round((state.customSatWeight / oldSum) * remaining);
          return { customCoreWeight: core, customSatWeight: newSat, customBondsWeight: 100 - core - newSat };
        }
        if (sat !== undefined) {
          const remaining = 100 - sat;
          const oldSum = state.customCoreWeight + state.customBondsWeight;
          if (oldSum === 0) return { customSatWeight: sat, customCoreWeight: remaining / 2, customBondsWeight: remaining / 2 };
          const newCore = Math.round((state.customCoreWeight / oldSum) * remaining);
          return { customSatWeight: sat, customCoreWeight: newCore, customBondsWeight: 100 - sat - newCore };
        }
        if (bonds !== undefined) {
          const remaining = 100 - bonds;
          const oldSum = state.customCoreWeight + state.customSatWeight;
          if (oldSum === 0) return { customBondsWeight: bonds, customCoreWeight: remaining / 2, customSatWeight: remaining / 2 };
          const newCore = Math.round((state.customCoreWeight / oldSum) * remaining);
          return { customBondsWeight: bonds, customCoreWeight: newCore, customSatWeight: 100 - bonds - newCore };
        }
        return state;
      }),

      setIsCoreIke: (val) => set((state) => ({ 
        isCoreIke: val,
        // Jeśli włączamy IKE dla rdzenia, musimy wyłączyć IKE dla obligacji EDO (unikalność IKE)
        isBondsIke: val ? false : state.isBondsIke
      })),
      setIsSatIke: (val) => set((state) => ({ 
        isSatIke: val,
        // Jeśli włączamy IKE dla satelity, musimy wyłączyć IKE dla obligacji EDO
        isBondsIke: val ? false : state.isBondsIke
      })),
      setIsBondsIke: (val) => set((state) => ({ 
        isBondsIke: val,
        // Jeśli włączamy IKE dla obligacji EDO, musimy wyłączyć IKE dla akcji i krypto
        isCoreIke: val ? false : state.isCoreIke,
        isSatIke: val ? false : state.isSatIke
      })),
      setMonthlyWithdrawal: (val) => set({ monthlyWithdrawal: val }),
      setWithdrawalYears: (val) => set({ withdrawalYears: val }),
      setActivePhase: (val) => set({ activePhase: val }),
      setManagerOpen: (val) => set({ isManagerOpen: val }),
      loadScenario: (data) => set({
        monthlyContribution: data.monthlyContribution || data.monthly_contribution,
        currentAge: data.currentAge || data.current_age,
        retirementAge: data.retirementAge || data.retirement_age,
        inflationRate: data.inflationRate || data.inflation_rate,
        annualStepUp: data.annualStepUp || data.annual_step_up,
        customPortfolio: data.customPortfolio || get().customPortfolio,
        coreRate: data.coreRate || data.core_rate,
        satRate: data.satRate || data.sat_rate,
        bondsRate: data.bondsRate || data.bonds_rate,
        customCoreWeight: data.customCoreWeight || data.custom_core_weight,
        customSatWeight: data.customSatWeight || data.custom_sat_weight,
        customBondsWeight: data.customBondsWeight || data.custom_bonds_weight,
        isCoreIke: data.isCoreIke || data.is_core_ike,
        isSatIke: data.isSatIke || data.is_sat_ike,
        isBondsIke: data.isBondsIke || data.is_bonds_ike,
        loadedScenarioId: data.id,
      }),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setEngineType: (type) => set({ engineType: type }),
      
      setVolatility: (core, sat, bonds) => set({ 
        coreVolatility: core, 
        satVolatility: sat, 
        bondsVolatility: bonds 
      }),
      
      setRebalancingStrategy: (val) => set({ rebalancingStrategy: val }),

      calculateMonteCarlo: async () => {
        const state = get();
        if (state.engineType !== 'WASM') return;

        try {
          const engine = await import('engine');
          // @ts-ignore - generateMonteCarloData dynamically added in Iteration 30
          if (!engine.generateMonteCarloData) return;
          const adapterParams = getDerivedWasmParams(state);
          
          const params = {
            monthlyContribution: state.monthlyContribution,
            currentAge: state.currentAge,
            retirementAge: state.retirementAge,
            inflationRate: state.inflationRate,
            annualStepUp: state.annualStepUp,
            coreRate: adapterParams.coreRate,
            satRate: adapterParams.satRate,
            bondsRate: adapterParams.bondsRate,
            isCoreIke: adapterParams.isCoreIke,
            isSatIke: adapterParams.isSatIke,
            isBondsIke: adapterParams.isBondsIke,
            monthlyWithdrawal: state.activePhase === 'accumulation' ? 0 : state.monthlyWithdrawal,
            withdrawalYears: state.activePhase === 'accumulation' ? 0 : state.withdrawalYears,
            coreVolatility: adapterParams.coreVolatility,
            satVolatility: adapterParams.satVolatility,
            bondsVolatility: adapterParams.bondsVolatility,
            iterations: 1000,
            rebalancingStrategy: state.rebalancingStrategy,
          };

          // @ts-ignore
          const result = await engine.generateMonteCarloData(params, adapterParams.coreWeight, adapterParams.satWeight);
          
          // --- Twarda Izolacja Stanu (Hard State Isolation) ---
          // Jeśli jesteśmy w fazie akumulacji, interesuje nas wyłącznie szansa na zebranie kapitału.
          // Jeśli w fazie dekumulacji, interesuje nas szansa na przeżycie portfela (niezależna od fazy 1).
          if (state.activePhase === 'accumulation') {
            set({ 
              mcResultAccumulation: result,
              // Nie czyścimy dekumulacji, ale zaznaczamy, że jest nieaktualna
            });
          } else {
            set({ 
              mcResultDecumulation: result,
            });
          }
          
          /* 
          // Automatyczne odświeżenie porady AI po przeliczeniu Monte Carlo zostaje wyłączone (API Guard)
          // Wyzwalanie następuje wyłącznie na żądanie użytkownika w AIAdvisorPanel.tsx
          const currentState = get();
          if (currentState.aiStatus === 'ready') {
            currentState.calculateAIAdvice();
          }
          */
        } catch (error) {
          console.error("🟢 Monte Carlo Engine Error:", error);
        }
      },

      setAIStatus: (status) => set({ aiStatus: status }),

      /**
       * Inicjalizuje AI — w przypadku Groq sprawdza dostępność klucza API.
       */
      initAI: async () => {
        const apiKey = import.meta.env.VITE_GROQ_API_KEY;
        if (!apiKey) {
          set({ aiStatus: 'error', aiError: 'Brak klucza API Groq (VITE_GROQ_API_KEY)' });
        } else {
          set({ aiStatus: 'ready' });
        }
      },

      /**
       * Wysyła zapytanie do Groq API i pobiera analizę portfela.
       */
      calculateAIAdvice: async () => {
        const state = get();
        // Pozwalamy na generowanie tylko jeśli mamy status ready lub error (retry)
        if (state.aiStatus === 'generating') return;
        
        set({ aiStatus: 'generating', aiError: null });
        
        try {
          const { getGroqAIAdvice } = await import('../lib/groqService');
          const { exportSimulationContext } = await import('../utils/contextExporter');
          
          const context = exportSimulationContext();
          const advice = await getGroqAIAdvice(context);
          
          set({ aiLastResponse: advice, aiStatus: 'ready' });
        } catch (err: any) {
          set({ aiStatus: 'error', aiError: err.message });
        }
      },
    }),
    {
      name: 'kinetic-wealth-storage',
      partialize: (state) => {
        const { engineType, activeTab, mcResultAccumulation, mcResultDecumulation, aiStatus, aiLastResponse, aiError, ...rest } = state;
        return rest;
      }
    }
  )
);

/**
 * Adapter Translacyjny (Selector).
 * Tłumaczy dynamiczny koszyk instrumentów na twarde zmienne, na których opiera się jądro WASM (3 Wiadra).
 */
export const getDerivedWasmParams = (state: SimulatorState) => {
  let coreWeight = 0, satWeight = 0, bondsWeight = 0;
  let coreCw = 0, satCw = 0, bondsCw = 0; // expectedCagr * weight
  let coreVw = 0, satVw = 0, bondsVw = 0; // volatility * weight
  let hasCoreIke = false, hasSatIke = false, hasBondsIke = false;

  state.customPortfolio.forEach(item => {
    const inst = AVAILABLE_INSTRUMENTS.find(i => i.id === item.instrumentId);
    if (!inst) return;

    if (inst.category === 'Baza' || inst.category === 'Core') {
      coreWeight += item.weight;
      coreCw += inst.expectedCagr * item.weight;
      coreVw += inst.volatility * item.weight;
      if (item.isIke) hasCoreIke = true;
    } else if (inst.category === 'Bezpiecznik') {
      bondsWeight += item.weight;
      bondsCw += inst.expectedCagr * item.weight;
      bondsVw += inst.volatility * item.weight;
      if (item.isIke) hasBondsIke = true;
    } else {
      // reszta: Tech, Krypto, Emerging
      satWeight += item.weight;
      satCw += inst.expectedCagr * item.weight;
      satVw += inst.volatility * item.weight;
      if (item.isIke) hasSatIke = true;
    }
  });

  return {
    coreWeight,
    satWeight,
    bondsWeight,
    coreRate: coreWeight > 0 ? (coreCw / coreWeight) || 0 : 0,
    satRate: satWeight > 0 ? (satCw / satWeight) || 0 : 0,
    bondsRate: bondsWeight > 0 ? (bondsCw / bondsWeight) || 0 : 0,
    coreVolatility: coreWeight > 0 ? (coreVw / coreWeight) || 0 : 0,
    satVolatility: satWeight > 0 ? (satVw / satWeight) || 0 : 0,
    bondsVolatility: bondsWeight > 0 ? (bondsVw / bondsWeight) || 0 : 0,
    isCoreIke: hasCoreIke,
    isSatIke: hasSatIke,
    isBondsIke: hasBondsIke,
  };
};
