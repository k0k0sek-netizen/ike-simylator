import { forwardRef } from 'react';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import { QRCodeSVG } from 'qrcode.react';
import { useSimulatorStore } from '../../store/useSimulatorStore';
import '../../utils/chartSetup';

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    maximumFractionDigits: 0
  }).format(val || 0);
};

interface PrintableReportProps {
  scenario: any;
}

export const PrintableReport = forwardRef<HTMLDivElement, PrintableReportProps>(({ scenario }, ref) => {
  const store = useSimulatorStore();

  if (!scenario) return null;

  const years = Math.max(1, store.retirementAge - store.currentAge);
  
  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 8, font: { size: 8 }, padding: 4 } },
      tooltip: { enabled: false },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 6 } } },
      y: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 6 } } },
    }
  };

  const donutData = {
    labels: ['Akcje Świat', 'Satelita/Krypto', 'Obligacje EDO'],
    datasets: [{
      data: [store.customCoreWeight, store.customSatWeight, store.customBondsWeight],
      backgroundColor: ['#2563eb', '#f59e0b', '#10b981'],
      borderWidth: 0,
    }]
  };

  const lineData = {
    labels: scenario.yearlyData.map((d: any) => `Rok ${d.year}`),
    datasets: [
      {
        label: 'Wartość Portfela',
        data: scenario.yearlyData.map((d: any) => d.nominalBalance),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
      },
      {
        label: 'Suma Wpłat',
        data: scenario.yearlyData.map((d: any) => d.totalInvestedNominal),
        borderColor: '#94a3b8',
        borderDash: [5, 5],
        fill: false,
        pointRadius: 0,
      }
    ]
  };

  const taxShieldValue = scenario.taxShield || 0;
  const taxData = {
    labels: ['Bez IKE (Zwykłe)', 'Z Kinetic Oracle (IKE)'],
    datasets: [
      {
        label: 'Zysk na rękę',
        data: [scenario.netProfit - (taxShieldValue * 0.19), scenario.netProfit],
        backgroundColor: ['#94a3b8', '#10b981'],
        borderRadius: 4,
      },
      {
        label: 'Podatek Belki',
        data: [taxShieldValue * 0.19 + 500, 0],
        backgroundColor: '#ef4444',
        borderRadius: 4,
      }
    ]
  };

  return (
    <div 
      ref={ref} 
      className="bg-white text-slate-900 p-[10mm] w-[210mm] h-[297mm] mx-auto overflow-hidden"
      id="printable-report"
      style={{ 
        fontFamily: "'Inter', sans-serif",
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact'
      }}
    >
      <header className="border-b-2 border-blue-600 pb-3 mb-4 flex justify-between items-end">
        <div>
          <h1 className="text-xl font-black tracking-tighter text-slate-900 mb-0.5 leading-none uppercase">Twój Finansowy Autopilot</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[8px]">Raport Inwestycyjny Kinetic Oracle: {scenario.title || 'Własny'}</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-black text-blue-600 leading-none">{formatCurrency(scenario.finalNominal)}</div>
          <div className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Kapitał po {years} latach</div>
        </div>
      </header>

      <section className="mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
        <p className="text-[11px] leading-relaxed text-slate-700 italic font-medium">
          "Prawdziwe bogactwo buduje się nie dzięki spekulacji, ale dzięki systematyczności i optymalizacji. Ten raport to mapa Twojej drogi do wolności od podatku Belki."
        </p>
      </section>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="border border-slate-100 p-3 rounded-xl bg-white">
          <h3 className="text-[10px] font-bold mb-2 flex items-center gap-2 uppercase tracking-wide"><span>⚖️</span> 1. Architektura Portfela</h3>
          <div className="h-[130px]">
            <Doughnut data={donutData} options={{ ...chartOptions, cutout: '70%' }} />
          </div>
          <div className="mt-2 space-y-0.5">
            <div className="flex justify-between text-[9px] font-bold"><span className="text-blue-600">Rdzeń (VWCE)</span><span>{store.customCoreWeight}%</span></div>
            <div className="flex justify-between text-[9px] font-bold"><span className="text-amber-500">Satelita (AGR)</span><span>{store.customSatWeight}%</span></div>
            <div className="flex justify-between text-[9px] font-bold"><span className="text-emerald-500">Obligacje (EDO)</span><span>{store.customBondsWeight}%</span></div>
          </div>
        </div>

        <div className="border border-slate-100 p-3 rounded-xl bg-white">
          <h3 className="text-[10px] font-bold mb-2 flex items-center gap-2 uppercase tracking-wide"><span>🛡️</span> 2. Tarcza IKE vs Belka</h3>
          <div className="h-[130px]">
            <Bar data={taxData} options={{ ...chartOptions, indexAxis: 'y', scales: { x: { stacked: true, display: false }, y: { stacked: true, grid: { display: false }, ticks: { font: { size: 6 } } } } }} />
          </div>
          <div className="mt-2 bg-emerald-50 p-2 rounded-lg border border-emerald-100 text-center">
            <p className="text-[8px] text-emerald-800 font-bold uppercase tracking-wider mb-0.5">Zaoszczędzony Podatek:</p>
            <p className="text-lg font-black text-emerald-600 leading-none">{formatCurrency(taxShieldValue)}</p>
          </div>
        </div>
      </div>

      <section className="mb-4 border border-slate-100 p-3 rounded-2xl bg-white">
        <h3 className="text-[10px] font-bold mb-1 flex items-center gap-2 uppercase tracking-wide"><span>🌱</span> 3. Potęga Wytrwałości (Procent Składany)</h3>
        <p className="text-slate-400 text-[8px] mb-2 font-medium">Wizualizacja lawiny odsetek. Wpływ dodatnich stóp procentowych w czasie.</p>
        <div className="h-[150px]">
          <Line data={lineData} options={chartOptions} />
        </div>
      </section>

      <section className="mb-4 bg-slate-900 text-white p-4 rounded-2xl overflow-hidden">
        <h3 className="text-[10px] font-bold mb-3 flex items-center gap-2 text-white uppercase tracking-wider"><span>⚙️</span> 4. Twój Miesięczny Proces Inwestora</h3>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <div className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center text-[9px] font-bold mb-1 mx-auto">1</div>
            <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Wypłata</p>
            <p className="text-[7px] text-slate-300">Księgowanie.</p>
          </div>
          <div>
            <div className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center text-[9px] font-bold mb-1 mx-auto">2</div>
            <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Przelew</p>
            <p className="text-[7px] text-slate-300">Zlecenie stałe.</p>
          </div>
          <div>
            <div className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center text-[9px] font-bold mb-1 mx-auto">3</div>
            <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Zakupy</p>
            <p className="text-[7px] text-slate-300">ETF / Obligacje.</p>
          </div>
          <div>
            <div className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center text-[9px] font-bold mb-1 mx-auto">4</div>
            <p className="text-[8px] font-bold uppercase tracking-widest text-slate-300 mb-0.5">Spokój</p>
            <p className="text-[7px] text-slate-400">Pasywność.</p>
          </div>
        </div>
      </section>

      <footer className="mt-auto pt-3 border-t border-slate-100 flex justify-between items-center">
        <div className="max-w-[75%]">
          <p className="text-[10px] font-bold text-slate-800 mb-0.5">Zbuduj swój własny plan finansowy i uniknij podatku Belki.</p>
          <p className="text-[8px] text-slate-400 leading-tight font-medium">Kinetic Oracle: Zaawansowany silnik symulacji IKE/IKZE zasilany Wasm. Raport ma charakter edukacyjny i nie jest rekomendacją inwestycyjną.</p>
          <p className="text-blue-600 font-bold text-[9px] mt-1.5 uppercase tracking-widest">https://kinetic-oracle.app</p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="p-1 border border-slate-100 rounded bg-white">
            <QRCodeSVG value="https://kinetic-oracle.app" size={45} />
          </div>
          <span className="text-[6px] font-bold uppercase tracking-tighter text-slate-400 text-center">Skanuj i sprawdź</span>
        </div>
      </footer>
    </div>
  );
});

PrintableReport.displayName = 'PrintableReport';
