import { useEffect, useRef } from 'react';
import { createChart, ColorType, AreaSeries, LineStyle, LineSeries } from 'lightweight-charts';
import { useSimulatorStore } from '../../store/useSimulatorStore';

export function InteractiveChart({ 
  activeScenario, 
  wasmReady, 
  isExport = false 
}: { 
  activeScenario: any, 
  wasmReady: boolean,
  isExport?: boolean
}) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const store = useSimulatorStore();

  useEffect(() => {
    if (chartContainerRef.current) {
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor: '#908fa0',
        },
        handleScroll: !isExport,
        handleScale: !isExport,
        crosshair: {
          vertLine: { visible: !isExport },
          horzLine: { visible: !isExport },
        },
        grid: {
          vertLines: { color: 'rgba(70, 69, 84, 0.1)' },
          horzLines: { color: 'rgba(70, 69, 84, 0.1)' },
        },
        width: isExport ? 820 : chartContainerRef.current.clientWidth,
        height: isExport ? 400 : chartContainerRef.current.clientHeight,
        rightPriceScale: { 
          borderVisible: false, 
          visible: true,      // Skala osi Y
          autoScale: true,
          scaleMargins: {
            top: 0.05,        // Tight margin for maximum coverage
            bottom: 0.05,
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
        topColor: isExport ? '#3d0a55' : 'rgba(183, 33, 255, 0.4)',
        bottomColor: isExport ? '#0c1324' : 'rgba(183, 33, 255, 0.05)',
        lineWidth: 2,
        lastValueVisible: true, // Zostawiamy tę etykietę jako główny wynik portfela
        priceFormat: { type: 'volume' }
      });
      
      const netProfitSeries = chart.addSeries(AreaSeries, {
        lineColor: '#4edea3',
        topColor: isExport ? '#1a4a37' : 'rgba(78, 222, 163, 0.5)',
        bottomColor: isExport ? '#0c1324' : 'rgba(78, 222, 163, 0.1)',
        lineWidth: 2,
        lastValueVisible: false, // Ukrywamy, aby nie nakładało się na Tarczę IKE
        priceFormat: { type: 'volume' }
      });
      
      const baseSeries = chart.addSeries(AreaSeries, {
        lineColor: '#64748b',
        topColor: isExport ? '#212936' : 'rgba(100, 116, 139, 0.3)',
        bottomColor: isExport ? '#0c1324' : 'rgba(100, 116, 139, 0.05)',
        lineWidth: 2,
        lastValueVisible: false, // Sam kapitał nie musi mieć etykiety na osi Y
      });

      // --- Seria Monte Carlo (Lejek Prawdopodobieństwa - Subtelne Tło) ---
      const mcUpperSeries = chart.addSeries(LineSeries, {
        color: isExport ? '#123528' : 'rgba(78, 222, 163, 0.15)', // Twardy HEX dla eksportu
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        lastValueVisible: false,           // Ukrywamy wartość na osi Y
        priceFormat: { type: 'volume' },
      });

      const mcLowerSeries = chart.addSeries(LineSeries, {
        color: isExport ? '#123528' : 'rgba(78, 222, 163, 0.15)',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        lastValueVisible: false,
        priceFormat: { type: 'volume' },
      });

      const mcMedianSeries = chart.addSeries(AreaSeries, {
        lineColor: isExport ? '#4edea3' : 'rgba(78, 222, 163, 0.3)',
        topColor: isExport ? '#0e2b20' : 'rgba(78, 222, 163, 0.15)',
        bottomColor: isExport ? '#0c1324' : 'rgba(78, 222, 163, 0.05)',
        lineWidth: 2,
        lineStyle: LineStyle.Solid,
        lastValueVisible: false,
        priceFormat: { type: 'volume' },
      });

      chartRef.current = { 
        chart, 
        taxShieldSeries, 
        netProfitSeries, 
        baseSeries, 
        mcUpperSeries, 
        mcLowerSeries, 
        mcMedianSeries 
      };

      // --- Obsługa Tooltipa (Floating UI) ---
      const container = chartContainerRef.current;
      let tooltip: HTMLDivElement | null = null;
      
      if (!isExport) {
        tooltip = document.createElement('div');
        tooltip.style.display = 'none';
        tooltip.style.position = 'absolute';
        tooltip.style.zIndex = '50';
        tooltip.style.pointerEvents = 'none';
        container.appendChild(tooltip);
      }

      chart.subscribeCrosshairMove((param) => {
        if (!tooltip || isExport || 
            param.point === undefined || 
            !param.time || 
            param.point.x < 0 || 
            param.point.x > chartContainerRef.current!.clientWidth || 
            param.point.y < 0 || 
            param.point.y > chartContainerRef.current!.clientHeight) {
          if (tooltip) tooltip.style.display = 'none';
          return;
        }

        const dateStr = param.time as string;
        const data = param.seriesData;
        
        const vTarcza = (data.get(taxShieldSeries) as any)?.value || 0;
        const vZysk = (data.get(netProfitSeries) as any)?.value || 0;
        const vKapital = (data.get(baseSeries) as any)?.value || 0;
        const vP90 = (data.get(mcUpperSeries) as any)?.value || 0;
        const vP10 = (data.get(mcLowerSeries) as any)?.value || 0;
        const vP50 = (data.get(mcMedianSeries) as any)?.value || 0;

        tooltip.style.display = 'block';
        tooltip.innerHTML = `
          <div class="backdrop-blur-xl bg-black/80 p-3 rounded-xl border border-white/20 shadow-2xl text-[11px] min-w-[180px]">
            <div class="text-white/60 mb-2 font-bold tracking-tighter uppercase">${dateStr.split('-')[0]} rok</div>
            <div class="space-y-1">
              <div class="flex justify-between items-center text-[#b721ff] font-black">
                <span>TARCZA IKE:</span>
                <span>${vTarcza.toLocaleString()} zł</span>
              </div>
              <div class="flex justify-between items-center text-secondary">
                <span>ZYSK NETTO:</span>
                <span>${vZysk.toLocaleString()} zł</span>
              </div>
              <div class="flex justify-between items-center text-slate-400">
                <span>KAPITAŁ:</span>
                <span>${vKapital.toLocaleString()} zł</span>
              </div>
              <div class="h-px bg-white/10 my-1"></div>
              <div class="flex justify-between items-center text-secondary/60 text-[9px]">
                <span>P90 (OPT):</span>
                <span>${vP90.toLocaleString()} zł</span>
              </div>
              <div class="flex justify-between items-center text-secondary/60 text-[9px]">
                <span>P50 (MED):</span>
                <span>${vP50.toLocaleString()} zł</span>
              </div>
              <div class="flex justify-between items-center text-secondary/60 text-[9px]">
                <span>P10 (PES):</span>
                <span>${vP10.toLocaleString()} zł</span>
              </div>
            </div>
          </div>
        `;

        const y = param.point.y;
        const left = param.point.x + 20;
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${y}px`;
      });

      const handleResize = () => {
        if (chartContainerRef.current && chartRef.current && !isExport) {
          chartRef.current.chart.applyOptions({ 
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight 
          });
        }
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (tooltip && container.contains(tooltip)) {
          container.removeChild(tooltip);
        }
        chart.remove();
      };
    }
  }, [wasmReady]);

  useEffect(() => {
    const store = useSimulatorStore.getState();
    if (chartRef.current && activeScenario) {
      const { 
        taxShieldSeries, 
        netProfitSeries, 
        baseSeries, 
        mcUpperSeries, 
        mcLowerSeries, 
        mcMedianSeries 
      } = chartRef.current;
      const currentYear = new Date().getFullYear();
      const currentMcResult = store.activePhase === 'accumulation' ? store.mcResultAccumulation : store.mcResultDecumulation;
      
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

      // --- Przetwarzanie i wizualizacja danych Monte Carlo ---
      if (currentMcResult && currentMcResult.points) {
        const years = activeScenario.yearlyData.map((d: any) => d.year);
        const startYearOffset = years[0];
        const endYearOffset = years[years.length - 1];

        // Filtrowanie punktów MC dopasowane do aktualnej osi czasu scenariusza
        const filteredMcPoints = currentMcResult.points.filter((p: any) => 
          p.year >= startYearOffset && p.year <= endYearOffset
        );

        // Mapowanie punktów na format Lightweight Charts
        const mcUpperData = filteredMcPoints.map((p: any) => ({
          time: `${currentYear + p.year}-01-01`,
          value: p.p90
        }));

        const mcLowerData = filteredMcPoints.map((p: any) => ({
          time: `${currentYear + p.year}-01-01`,
          value: p.p10
        }));

        const mcMedianData = filteredMcPoints.map((p: any) => ({
          time: `${currentYear + p.year}-01-01`,
          value: p.p50
        }));

        mcUpperSeries.setData(mcUpperData);
        mcLowerSeries.setData(mcLowerData);
        mcMedianSeries.setData(mcMedianData);
      } else {
        // Czyścimy serie jeśli brak danych MC
        mcUpperSeries.setData([]);
        mcLowerSeries.setData([]);
        mcMedianSeries.setData([]);
      }

      chartRef.current.chart.timeScale().fitContent();
    }
  }, [activeScenario, store.mcResultAccumulation, store.mcResultDecumulation, store.activePhase]);

  return (
    <section className="flex flex-col gap-4 mt-8 mb-4">
      {/* Kontener wykresu z wymuszonym kontekstem warstw z-30, aby Tooltip był nad legendą */}
      <div className={`relative z-30 w-full h-[400px] ${!isExport ? 'bg-surface-container-lowest rounded-2xl group hover:shadow-[0_0_30px_rgba(78,222,163,0.05)] transition-all duration-500' : ''}`} style={{ viewTransitionName: isExport ? 'none' : 'main-chart', backgroundColor: isExport ? '#070d1f' : undefined, borderRadius: isExport ? '16px' : undefined }}>
        {!isExport && <div className="absolute inset-0 bg-linear-to-t from-secondary/5 to-transparent rounded-2xl pointer-events-none"></div>}
        <div ref={chartContainerRef} className="absolute inset-0 w-full h-full" />
      </div>

      {!isExport && (
        <div className="relative z-10 flex flex-wrap gap-4 px-2 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex items-center gap-1.5 backdrop-blur-md bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#b721ff] shadow-[0_0_8px_#b721ff]"></span>
            <span className="text-[10px] font-label text-slate-900 dark:text-white/80 tracking-widest uppercase font-black">Tarcza IKE</span>
          </div>
          <div className="flex items-center gap-1.5 backdrop-blur-md bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary shadow-[0_0_8px_#4edea3]"></span>
            <span className="text-[10px] font-label text-slate-900 dark:text-white/80 tracking-widest uppercase font-black">Zysk Netto</span>
          </div>
          <div className="flex items-center gap-1.5 backdrop-blur-md bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500 shadow-[0_0_8px_#64748b]"></span>
            <span className="text-[10px] font-label text-slate-900 dark:text-white/80 tracking-widest uppercase font-black">Wpłacony Kapitał</span>
          </div>
          <div className="flex items-center gap-1.5 backdrop-blur-md bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full border-2 border-secondary/40 border-dashed"></span>
            <span className="text-[10px] font-label text-slate-900 dark:text-white/80 tracking-widest uppercase font-black">Zakres P10-P90</span>
          </div>
          <div className="flex items-center gap-1.5 backdrop-blur-md bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary/30 border border-secondary/50"></span>
            <span className="text-[10px] font-label text-slate-900 dark:text-white/80 tracking-widest uppercase font-black">Mediana MC</span>
          </div>
        </div>
      )}
    </section>
  );
}
