import { useEffect, useRef } from 'react';
import { createChart, ColorType, AreaSeries } from 'lightweight-charts';

export function InteractiveChart({ activeScenario, wasmReady }: { activeScenario: any, wasmReady: boolean }) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (chartContainerRef.current) {
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor: '#908fa0',
        },
        grid: {
          vertLines: { color: 'rgba(70, 69, 84, 0.1)' },
          horzLines: { color: 'rgba(70, 69, 84, 0.1)' },
        },
        width: chartContainerRef.current.clientWidth,
        height: chartContainerRef.current.clientHeight,
        rightPriceScale: { 
          borderVisible: false, 
          visible: true,      // Włącz skale cenowe na osi Y
          autoScale: true,
          scaleMargins: {
            top: 0.2,         // Margines z góry, żeby tooltipy się nie ucinały
            bottom: 0.1,
          }
        },
        timeScale: { 
          borderVisible: false, 
          fixLeftEdge: true, 
          fixRightEdge: true,
          timeVisible: true
        },
      });
      
      const taxShieldSeries = chart.addSeries(AreaSeries, {
        lineColor: '#b721ff',
        topColor: 'rgba(183, 33, 255, 0.4)',
        bottomColor: 'rgba(183, 33, 255, 0.05)',
        lineWidth: 2,
        priceFormat: { type: 'volume' }
      });
      
      const netProfitSeries = chart.addSeries(AreaSeries, {
        lineColor: '#4edea3',
        topColor: 'rgba(78, 222, 163, 0.5)',
        bottomColor: 'rgba(78, 222, 163, 0.1)',
        lineWidth: 2,
        priceFormat: { type: 'volume' }
      });
      
      const baseSeries = chart.addSeries(AreaSeries, {
        lineColor: '#64748b',
        topColor: 'rgba(100, 116, 139, 0.3)',
        bottomColor: 'rgba(100, 116, 139, 0.05)',
        lineWidth: 2,
      });

      chartRef.current = { chart, taxShieldSeries, netProfitSeries, baseSeries };

      const handleResize = () => {
        if(chartContainerRef.current && chartRef.current) {
            chartRef.current.chart.applyOptions({ width: chartContainerRef.current.clientWidth });
        }
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        chart.remove();
      };
    }
  }, [wasmReady]);

  useEffect(() => {
    if (chartRef.current && activeScenario) {
      const { taxShieldSeries, netProfitSeries, baseSeries } = chartRef.current;
      const currentYear = new Date().getFullYear();
      
      const taxShieldData = activeScenario.yearlyData.map((d: any) => ({
        time: `${currentYear + d.year}-01-01`,
        value: d.nominalBalance
      }));

      const netProfitData = activeScenario.yearlyData.map((d: any) => ({
        time: `${currentYear + d.year}-01-01`,
        value: d.totalInvestedNominal + d.netProfit
      }));
      
      const baseData = activeScenario.yearlyData.map((d: any) => ({
        time: `${currentYear + d.year}-01-01`,
        value: d.totalInvestedNominal
      }));

      taxShieldSeries.setData(taxShieldData);
      netProfitSeries.setData(netProfitData);
      baseSeries.setData(baseData);
      chartRef.current.chart.timeScale().fitContent();
    }
  }, [activeScenario]);

  return (
    <section className="relative w-full aspect-video bg-surface-container-lowest rounded-2xl group hover:shadow-[0_0_30px_rgba(78,222,163,0.1)] transition-all duration-500">
      <div className="absolute inset-0 bg-linear-to-t from-secondary/5 to-transparent rounded-2xl pointer-events-none"></div>
      
      <div ref={chartContainerRef} className="absolute inset-0 w-full h-full p-4 drop-shadow-[0_0_15px_rgba(78,222,163,0.3)]" style={{ zIndex: 1 }} />
      
      <div className="absolute bottom-4 left-4 flex gap-4" style={{ zIndex: 2 }}>
        <div className="flex items-center gap-1.5 backdrop-blur-md bg-black/5 dark:bg-black/20 px-2 py-1 rounded-full border border-slate-200 dark:border-transparent">
          <span className="w-2 h-2 rounded-full bg-[#b721ff] shadow-[0_0_5px_#b721ff]"></span>
          <span className="text-[10px] font-label text-slate-900 dark:text-white tracking-widest uppercase font-bold">Tarcza IKE</span>
        </div>
        <div className="flex items-center gap-1.5 backdrop-blur-md bg-black/5 dark:bg-black/20 px-2 py-1 rounded-full border border-slate-200 dark:border-transparent">
          <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_5px_#4edea3]"></span>
          <span className="text-[10px] font-label text-slate-900 dark:text-white tracking-widest uppercase font-bold">Zysk Netto</span>
        </div>
        <div className="flex items-center gap-1.5 backdrop-blur-md bg-black/5 dark:bg-black/20 px-2 py-1 rounded-full border border-slate-200 dark:border-transparent">
          <span className="w-2 h-2 rounded-full bg-slate-500 shadow-[0_0_5px_#64748b]"></span>
          <span className="text-[10px] font-label text-slate-900 dark:text-white tracking-widest uppercase font-bold">Wpłacony Kapitał</span>
        </div>
      </div>
    </section>
  );
}
