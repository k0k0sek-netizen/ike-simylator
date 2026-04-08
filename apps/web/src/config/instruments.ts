export interface Instrument {
  id: string;
  ticker: string;
  name: string;
  category: string;
  expectedCagr: number;
  volatility: number;
  isIkeEligible: boolean;
  description: string;
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
    description: 'Najpopularniejszy na świecie ETF pokrywający akcje globalne. Podstawa portfela indeksowego (tzw. "Boglehead"). Średnie ryzyko, zdywersyfikowany.'
  },
  {
    id: 'sxr8',
    ticker: 'SXR8.DE',
    name: 'S&P 500',
    category: 'Core',
    expectedCagr: 10.5,
    volatility: 15,
    isIkeEligible: true,
    description: 'ETF śledzący 500 największych amerykańskich spółek. Agresywniejszy niż ogólnoświatowy, często podstawa napędowa agresywnych zysków w portfelu. Wygrany ostatniej dekady.'
  },
  {
    id: 'sxrv',
    ticker: 'SXRV.DE',
    name: 'Nasdaq 100',
    category: 'Tech',
    expectedCagr: 15.0,
    volatility: 22,
    isIkeEligible: true,
    description: 'ETF ładujący 100 największych spółek technologicznych (Apple, Nvidia, Microsoft). Gigantyczny zwrot, ekstremalne tąpnięcia na "Bessie". Traktuj to ostrożnie (tzw. satelita).'
  },
  {
    id: 'qdv5',
    ticker: 'QDV5.DE',
    name: 'MSCI India',
    category: 'Rynki Wschodzące',
    expectedCagr: 12.0,
    volatility: 25,
    isIkeEligible: true,
    description: 'Gospodarka rozwijająca się. Oczekiwane mocne wzrosty, gigantyczna niepewność regulacyjna. Skoncentruj to wyłącznie w kilkuprocentowej części wariackiej portfela.'
  },
  {
    id: 'vbtc',
    ticker: 'VBTC.DE',
    name: 'Bitcoin ETN',
    category: 'Krypto',
    expectedCagr: 25.0,
    volatility: 60,
    isIkeEligible: true,
    description: 'Fizyczny pokryty w 100% Bitcoin z giełdy niemieckiej Xetra. Ekstremalne ryzyko, potężna asymetria. Dodaj jako 1-5% zabezpieczenie i obserwuj fajerwerki.'
  },
  {
    id: 'edo',
    ticker: 'EDO',
    name: 'Obligacje Skarbowe 10y',
    category: 'Bezpiecznik',
    expectedCagr: 6.0,
    volatility: 2,
    isIkeEligible: true,
    description: 'Bezpiecznik od Skarbu Państwa na wypadek absolutnej paniki na rynkach. Stabilnie pobija inflację, nie ulega tąpnięciom w czasach "Bessy". Prawny azyl.'
  }
];
