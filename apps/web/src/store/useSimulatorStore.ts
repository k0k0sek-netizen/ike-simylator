import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MonteCarloPoint {
  year: number;
  p10: number;
  p50: number;
  p90: number;
}

export interface MonteCarloSummary {
  points: MonteCarloPoint[];
  successRate: number;
}

export interface SimulatorState {
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
  mcResult: MonteCarloSummary | null;

  // --- AI Advisor State ---
  aiStatus: 'idle' | 'loading' | 'ready' | 'generating' | 'error';
  aiProgress: number;
  aiLastResponse: string | null;
  aiError: string | null;

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
  
  // --- AI Advisor Actions ---
  initAI: () => Promise<void>;
  calculateAIAdvice: () => Promise<void>;
  setAIStatus: (status: SimulatorState['aiStatus']) => void;
  setAIProgress: (progress: number) => void;
}

export const useSimulatorStore = create<SimulatorState>()(
  persist(
    (set, get) => ({
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
      mcResult: null,

      aiStatus: 'idle',
      aiProgress: 0,
      aiLastResponse: null,
      aiError: null,

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

      setIsCoreIke: (val) => set({ isCoreIke: val }),
      setIsSatIke: (val) => set({ isSatIke: val }),
      setIsBondsIke: (val) => set({ isBondsIke: val }),
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
          
          const params = {
            monthlyContribution: state.monthlyContribution,
            currentAge: state.currentAge,
            retirementAge: state.retirementAge,
            inflationRate: state.inflationRate,
            annualStepUp: state.annualStepUp,
            coreRate: state.coreRate,
            satRate: state.satRate,
            bondsRate: state.bondsRate,
            isCoreIke: state.isCoreIke,
            isSatIke: state.isSatIke,
            isBondsIke: state.isBondsIke,
            monthlyWithdrawal: state.monthlyWithdrawal,
            withdrawalYears: state.withdrawalYears,
            coreVolatility: state.coreVolatility,
            satVolatility: state.satVolatility,
            bondsVolatility: state.bondsVolatility,
            iterations: 1000,
            rebalancingStrategy: state.rebalancingStrategy,
          };

          // @ts-ignore
          const result = await engine.generateMonteCarloData(params, state.customCoreWeight, state.customSatWeight);
          set({ mcResult: result });
          
          // Automatyczne odświeżenie porady AI po przeliczeniu Monte Carlo, jeśli AI jest gotowe
          const currentState = get();
          if (currentState.aiStatus === 'ready') {
            currentState.calculateAIAdvice();
          }
        } catch (error) {
          console.error("🟢 Monte Carlo Engine Error:", error);
        }
      },

      setAIStatus: (status) => set({ aiStatus: status }),
      setAIProgress: (progress) => set({ aiProgress: progress }),

      initAI: async () => {
        const { initWebLLM } = await import('../lib/aiEngine');
        await initWebLLM();
      },

      calculateAIAdvice: async () => {
        const state = get();
        if (state.aiStatus !== 'ready' && state.aiStatus !== 'generating') return;
        
        set({ aiStatus: 'generating', aiError: null });
        
        try {
          const { generateAdvice } = await import('../lib/aiEngine');
          const { exportSimulationContext } = await import('../utils/contextExporter');
          
          const context = exportSimulationContext(state);
          const advice = await generateAdvice(context);
          
          set({ aiLastResponse: advice, aiStatus: 'ready' });
        } catch (err: any) {
          set({ aiStatus: 'error', aiError: err.message });
        }
      },
    }),
    {
      name: 'kinetic-oracle-storage',
      partialize: (state) => {
        const { engineType, mcResult, aiStatus, aiProgress, aiLastResponse, aiError, ...rest } = state;
        return rest;
      }
    }
  )
);
