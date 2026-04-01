import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

export const CHART_COLORS = {
  primary: '#2563eb', // Blue-600
  secondary: '#10b981', // Emerald-500
  accent: '#f59e0b', // Amber-500
  error: '#ef4444', // Red-500
  grid: '#f1f5f9',
  text: '#475569',
  textLight: '#94a3b8',
};
