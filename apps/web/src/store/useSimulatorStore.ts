import { create } from 'zustand';

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
}

export const useSimulatorStore = create<SimulatorState>((set) => ({
  monthlyContribution: 500,
  currentAge: 30,
  retirementAge: 60,
  inflationRate: 3.5,
  annualStepUp: 0,
  coreRate: 7, // Realne 7% (nomin: 10.5%)
  satRate: 15,
  bondsRate: 1.5, // EDO
  customCoreWeight: 70,
  customSatWeight: 20,
  customBondsWeight: 10,
  isCoreIke: true,
  isSatIke: true,
  isBondsIke: false,
  monthlyWithdrawal: 4000,
  withdrawalYears: 30,
  activePhase: 'accumulation',

  setMonthlyContribution: (val) => set({ monthlyContribution: val }),
  setCurrentAge: (val) => set({ currentAge: val }),
  setRetirementAge: (val) => set({ retirementAge: val }),
  setInflationRate: (val) => set({ inflationRate: val }),
  setAnnualStepUp: (val) => set({ annualStepUp: val }),
  setCoreRate: (val) => set({ coreRate: val }),
  setSatRate: (val) => set({ satRate: val }),
  setBondsRate: (val) => set({ bondsRate: val }),
  
  setAllocation: (core, sat, bonds) => set((state) => {
    // Jeśli podano wszystkie 3, ustawiamy je bezpośrednio (np. dla szablonów)
    if (core !== undefined && sat !== undefined && bonds !== undefined) {
      return {
        customCoreWeight: core,
        customSatWeight: sat,
        customBondsWeight: bonds
      };
    }

    // Proporcjonalna korekta pozostałych suwaków (pojedyncza zmiana)
    if (core !== undefined) {
      const remaining = 100 - core;
      const oldSum = state.customSatWeight + state.customBondsWeight;
      if (oldSum === 0) {
          return { customCoreWeight: core, customSatWeight: remaining / 2, customBondsWeight: remaining / 2 };
      }
      const newSat = Math.round((state.customSatWeight / oldSum) * remaining);
      return {
        customCoreWeight: core,
        customSatWeight: newSat,
        customBondsWeight: 100 - core - newSat
      };
    }
    if (sat !== undefined) {
      const remaining = 100 - sat;
      const oldSum = state.customCoreWeight + state.customBondsWeight;
      if (oldSum === 0) {
          return { customSatWeight: sat, customCoreWeight: remaining / 2, customBondsWeight: remaining / 2 };
      }
      const newCore = Math.round((state.customCoreWeight / oldSum) * remaining);
      return {
        customSatWeight: sat,
        customCoreWeight: newCore,
        customBondsWeight: 100 - sat - newCore
      };
    }
    if (bonds !== undefined) {
      const remaining = 100 - bonds;
      const oldSum = state.customCoreWeight + state.customSatWeight;
      if (oldSum === 0) {
          return { customBondsWeight: bonds, customCoreWeight: remaining / 2, customSatWeight: remaining / 2 };
      }
      const newCore = Math.round((state.customCoreWeight / oldSum) * remaining);
      return {
        customBondsWeight: bonds,
        customCoreWeight: newCore,
        customSatWeight: 100 - bonds - newCore
      };
    }
    return state;
  }),

  setIsCoreIke: (val) => set({ isCoreIke: val }),
  setIsSatIke: (val) => set({ isSatIke: val }),
  setIsBondsIke: (val) => set({ isBondsIke: val }),
  setMonthlyWithdrawal: (val) => set({ monthlyWithdrawal: val }),
  setWithdrawalYears: (val) => set({ withdrawalYears: val }),
  setActivePhase: (val) => set({ activePhase: val }),
}));
