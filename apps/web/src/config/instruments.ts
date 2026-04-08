export interface Instrument {
  id: string;
  ticker: string;
  name: string;
  category: string;
  expectedCagr: number;
  volatility: number;
  isIkeEligible: boolean;
}

export const AVAILABLE_INSTRUMENTS: Instrument[] = [
  {
    id: 'vwce',
    ticker: 'VWCE.DE',
    name: 'Vanguard All-World',
    category: 'Baza',
    expectedCagr: 8.5,
    volatility: 15,
    isIkeEligible: true,
  },
  {
    id: 'sxr8',
    ticker: 'SXR8.DE',
    name: 'S&P 500',
    category: 'Core',
    expectedCagr: 10.5,
    volatility: 15,
    isIkeEligible: true,
  },
  {
    id: 'sxrv',
    ticker: 'SXRV.DE',
    name: 'Nasdaq 100',
    category: 'Tech',
    expectedCagr: 15.0,
    volatility: 22,
    isIkeEligible: true,
  },
  {
    id: 'qdv5',
    ticker: 'QDV5.DE',
    name: 'MSCI India',
    category: 'Rynki Wschodzące',
    expectedCagr: 12.0,
    volatility: 25,
    isIkeEligible: true,
  },
  {
    id: 'vbtc',
    ticker: 'VBTC.DE',
    name: 'Bitcoin ETN',
    category: 'Krypto',
    expectedCagr: 25.0,
    volatility: 60,
    isIkeEligible: false,
  },
  {
    id: 'edo',
    ticker: 'EDO',
    name: 'Obligacje Skarbowe 10y',
    category: 'Bezpiecznik',
    expectedCagr: 6.0,
    volatility: 2,
    isIkeEligible: false, // EDO same w sobie w IKE stanowią dedykowane konto "IKE-Obligacje", co tworzy odzielną pulę limitową i często wyklucza inwestycje giełdowe na klasycznym IKE (wymóg 1 IKE per os.). Dla logiki klasycznego symulatora: traktujemy to odrębnie.
  }
];
