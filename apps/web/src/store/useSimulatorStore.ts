import { create } from 'zustand';

export interface SimulatorState {
  monthlyContribution: number;
  currentAge: number;
  retirementAge: number;
  maximizeIkeLimit: boolean;
  inflationRate: number;
  annualStepUp: number;
  coreRate: number;
  satRate: number;
  customCorePct: number;
  monthlyWithdrawal: number;
  withdrawalYears: number;
  activePhase: 'accumulation' | 'decumulation';
  
  setMonthlyContribution: (val: number) => void;
  setCurrentAge: (val: number) => void;
  setRetirementAge: (val: number) => void;
  setMaximizeIkeLimit: (val: boolean) => void;
  setInflationRate: (val: number) => void;
  setAnnualStepUp: (val: number) => void;
  setCoreRate: (val: number) => void;
  setSatRate: (val: number) => void;
  setCustomCorePct: (val: number) => void;
  setMonthlyWithdrawal: (val: number) => void;
  setWithdrawalYears: (val: number) => void;
  setActivePhase: (val: 'accumulation' | 'decumulation') => void;
}

export const useSimulatorStore = create<SimulatorState>((set) => ({
  monthlyContribution: 500,
  currentAge: 30,
  retirementAge: 60,
  maximizeIkeLimit: false,
  inflationRate: 3.5,
  annualStepUp: 0,
  coreRate: 2,
  satRate: 15,
  customCorePct: 80,
  monthlyWithdrawal: 4000,
  withdrawalYears: 30,
  activePhase: 'accumulation',

  setMonthlyContribution: (val) => set({ monthlyContribution: val }),
  setCurrentAge: (val) => set({ currentAge: val }),
  setRetirementAge: (val) => set({ retirementAge: val }),
  setMaximizeIkeLimit: (val) => set({ maximizeIkeLimit: val }),
  setInflationRate: (val) => set({ inflationRate: val }),
  setAnnualStepUp: (val) => set({ annualStepUp: val }),
  setCoreRate: (val) => set({ coreRate: val }),
  setSatRate: (val) => set({ satRate: val }),
  setCustomCorePct: (val) => set({ customCorePct: val }),
  setMonthlyWithdrawal: (val) => set({ monthlyWithdrawal: val }),
  setWithdrawalYears: (val) => set({ withdrawalYears: val }),
  setActivePhase: (val) => set({ activePhase: val }),
}));
