import { useSimulatorStore } from '../../store/useSimulatorStore';
import { AllocationDonut } from '../ui/AllocationDonut';
import { useMemo } from 'react';
import { 
  ComposedChart, 
  Area, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';

/**
 * ExportTemplate - Wersja ultra-sterylna (MIGRACJA SVG).
 * Używamy Recharts zamiast InteractiveChart, aby uniknąć błędów Canvas w html2canvas.
 */
export function ExportTemplate({ activeScenario }: { activeScenario: any }) {
  const store = useSimulatorStore();

  const isAccumulation = store.activePhase === 'accumulation';
  const years = Math.max(1, store.retirementAge - store.currentAge);
  
  const chartScenario = useMemo(() => {
    if (!activeScenario) return null;
    const allData = activeScenario.yearlyData || [];
    
    if (store.activePhase === 'accumulation') {
      return {
        ...activeScenario,
        yearlyData: allData.slice(0, years),
      };
    } else {
      return {
        ...activeScenario,
        yearlyData: allData.slice(years),
      };
    }
  }, [activeScenario, store.activePhase, years]);

  const lastYear = chartScenario?.yearlyData?.[chartScenario.yearlyData.length - 1];
  const finalNominal = lastYear?.nominalBalance || 0;
  const totalTaxShield = lastYear?.taxShield || 0;
  const totalInvested = lastYear?.totalInvestedNominal || 0;
  
  const mcResult = isAccumulation ? store.mcResultAccumulation : store.mcResultDecumulation;
  const successRate = mcResult ? (mcResult.successRate * 100).toFixed(0) : '---';

  const aiAnalysis = store.aiLastResponse || "Brak wygenerowanej analizy AI.";

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(val);

  // --- Data Mapping dla Recharts (Złączanie YearlyData z Monte Carlo) ---
  const chartData = useMemo(() => {
    if (!chartScenario?.yearlyData) return [];
    const currentYear = new Date().getFullYear();
    
    return chartScenario.yearlyData.map((d: any) => {
      const mcPoint = mcResult?.points?.find((p: any) => p.year === d.year);
      return {
        year: currentYear + d.year,
        tarcza: d.nominalBalance,
        zysk: d.totalInvestedNominal + d.netProfit,
        kapital: d.totalInvestedNominal,
        p90: mcPoint?.p90,
        p10: mcPoint?.p10,
        p50: mcPoint?.p50,
      };
    });
  }, [chartScenario, mcResult]);

  return (
    <div 
      id="export-template"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '1000px', // Szeroki arkusz A4
        padding: '60px',
        backgroundColor: '#0c1324',
        color: '#dce1fb',
        fontFamily: "'Space Grotesk', sans-serif",
        zIndex: -9999,
        opacity: 0.01,
        pointerEvents: 'none',
      }}
    >
      {/* NAGŁÓWEK */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #2e3447', paddingBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', letterSpacing: '2px', color: '#c0c1ff' }}>KINETIC_ORACLE</h1>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#908fa0', textTransform: 'uppercase' }}>
            Raport Symulacji Emerytalnej | {isAccumulation ? 'BUDOWA KAPITAŁU' : 'FAZA WYPŁAT'}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#908fa0' }}>Data: {new Date().toLocaleDateString('pl-PL')}</p>
          <div style={{ padding: '4px 12px', backgroundColor: '#191f31', borderRadius: '4px', marginTop: '5px', border: '1px solid #23293c' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#4edea3' }}>Silnik: {store.engineType}</span>
          </div>
        </div>
      </div>

      {/* KPI GŁÓWNE */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '20px' }}>
        {(() => {
          const taxPaid = activeScenario?.taxPaid || 0;
          const taxColor = taxPaid > 0 ? '#ef4444' : '#4edea3';
          const taxValue = taxPaid > 0 ? `- ${formatCurrency(taxPaid)}` : '0 zł';

          return [
            { label: 'KAPITAŁ KOŃCOWY', value: formatCurrency(finalNominal), color: '#ffffff' },
            { label: 'TARCZA PODATKOWA', value: formatCurrency(totalTaxShield), color: '#b721ff' },
            { label: 'SUKCES (MC)', value: `${successRate}%`, color: '#4edea3' },
            { label: 'ZAPŁACONY PODATEK', value: taxValue, color: taxColor },
          ].map((stat, i) => (
            <div key={i} style={{ backgroundColor: '#191f31', padding: '20px', borderRadius: '12px', border: '1px solid #23293c' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '10px', color: '#908fa0', fontWeight: 'bold' }}>{stat.label}</p>
              <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: stat.color }}>{stat.value}</p>
            </div>
          ));
        })()}
      </div>

      {/* PARAMETRY SYMULACJI */}
      <div style={{ backgroundColor: '#151b2d', padding: '15px 25px', borderRadius: '12px', border: '1px solid #23293c', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '10px', color: '#908fa0', display: 'block', marginBottom: '2px' }}>MIESIĘCZNA WPŁATA</span>
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffffff' }}>{formatCurrency(store.monthlyContribution)}</span>
        </div>
        <div style={{ height: '30px', width: '1px', backgroundColor: '#2e3447' }} />
        <div>
          <span style={{ fontSize: '10px', color: '#908fa0', display: 'block', marginBottom: '2px' }}>WKŁAD WŁASNY TOTAL</span>
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffffff' }}>{formatCurrency(totalInvested)}</span>
        </div>
        <div style={{ height: '30px', width: '1px', backgroundColor: '#2e3447' }} />
        <div>
          <span style={{ fontSize: '10px', color: '#908fa0', display: 'block', marginBottom: '2px' }}>RAMY CZASOWE</span>
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffffff' }}>{store.currentAge} ➔ {store.retirementAge} lat</span>
        </div>
        <div style={{ height: '30px', width: '1px', backgroundColor: '#2e3447' }} />
        <div>
          <span style={{ fontSize: '10px', color: '#908fa0', display: 'block', marginBottom: '2px' }}>INFLACJA (CEL)</span>
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffb2b9' }}>{store.inflationRate}%</span>
        </div>
      </div>

      {/* WYKRES LINIOWY (MIGRACJA NA RECHARTS / SVG) */}
      <div style={{ backgroundColor: '#151b2d', padding: '30px', borderRadius: '16px', border: '1px solid #23293c', marginBottom: '30px' }}>
        <p style={{ margin: '0 0 20px 0', fontSize: '14px', fontWeight: 'bold', color: '#908fa0', letterSpacing: '1px' }}>
          PROGNOZA MAJĄTKU (MONTE CARLO)
        </p>
        <div style={{ height: '400px', width: '100%', boxSizing: 'border-box', borderRadius: '12px', backgroundColor: '#070d1f', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', padding: '20px' }}>
          {chartData.length > 0 && (
            <ComposedChart width={780} height={360} data={chartData} margin={{ top: 20, right: 40, bottom: 20, left: 10 }}>
              <CartesianGrid vertical={false} stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis 
                dataKey="year" 
                stroke="#475569" 
                tick={{ fill: '#94a3b8', fontSize: 10 }} 
                tickMargin={10}
                axisLine={{ stroke: '#2e3447' }}
                interval="preserveStartEnd"
                minTickGap={30}
              />
              <YAxis 
                stroke="#475569" 
                tick={{ fill: '#94a3b8', fontSize: 10 }} 
                tickFormatter={(value) => {
                  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                  return value;
                }}
                width={70}
                axisLine={{ stroke: '#2e3447' }}
                tickLine={false}
                domain={[0, (dataMax: number) => Math.floor(dataMax * 1.1)]}
              />
              
              {/* Obszary Wypełnienia (Area) */}
              <Area 
                type="monotone" 
                dataKey="tarcza" 
                stroke="#b721ff" 
                fill="#b721ff" 
                fillOpacity={0.2} 
                strokeWidth={2}
                isAnimationActive={false} 
              />
              <Area 
                type="monotone" 
                dataKey="zysk" 
                stroke="#4edea3" 
                fill="#4edea3" 
                fillOpacity={0.2} 
                strokeWidth={2}
                isAnimationActive={false} 
              />
              <Area 
                type="monotone" 
                dataKey="kapital" 
                stroke="#64748b" 
                fill="#64748b" 
                fillOpacity={0.2} 
                strokeWidth={2}
                isAnimationActive={false} 
              />

              {/* Linie Monte Carlo (Funnel) */}
              <Line 
                type="monotone" 
                dataKey="p90" 
                stroke="#123528" 
                strokeDasharray="4 4" 
                strokeWidth={1} 
                dot={false} 
                isAnimationActive={false} 
              />
              <Line 
                type="monotone" 
                dataKey="p10" 
                stroke="#123528" 
                strokeDasharray="4 4" 
                strokeWidth={1} 
                dot={false} 
                isAnimationActive={false} 
              />
              <Line 
                type="monotone" 
                dataKey="p50" 
                stroke="#1a4a37" 
                strokeWidth={2} 
                dot={false} 
                isAnimationActive={false} 
              />
            </ComposedChart>
          )}
        </div>
        
        {/* STERYLNA LEGENDA (Data Enrichment) */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '20px' }}>
          {[
            { label: 'Tarcza IKE', color: '#b721ff' },
            { label: 'Zysk Netto', color: '#4edea3' },
            { label: 'Wpłacony Kapitał', color: '#64748b' },
            { label: 'Mediana MC', color: '#1a4a37' },
            { label: 'Zakres P10-P90', color: '#123528', isDashed: true },
          ].map((item, id) => (
            <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                width: '12px', 
                height: '12px', 
                borderRadius: item.isDashed ? '2px' : '50%', 
                backgroundColor: item.color,
                border: item.isDashed ? '1px dashed #4edea3' : 'none'
              }} />
              <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#908fa0', textTransform: 'uppercase' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ALOKACJA (Side by Side) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '30px', marginBottom: '30px', backgroundColor: '#151b2d', padding: '30px', borderRadius: '16px', border: '1px solid #23293c' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p style={{ marginBottom: '20px', fontSize: '12px', fontWeight: 'bold', color: '#908fa0', alignSelf: 'flex-start' }}>ALOKACJA PORTFELA</p>
          <AllocationDonut 
            core={store.customCoreWeight} 
            sat={store.customSatWeight} 
            bonds={store.customBondsWeight} 
            size={180}
            strokeWidth={30}
          />
        </div>
        <div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginTop: '40px' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#908fa0', borderBottom: '1px solid #23293c' }}>
                <th style={{ paddingBottom: '10px', fontWeight: 'normal' }}>AKTYWO</th>
                <th style={{ paddingBottom: '10px', fontWeight: 'normal', textAlign: 'center' }}>%</th>
                <th style={{ paddingBottom: '10px', fontWeight: 'normal', textAlign: 'center' }}>ZYSK</th>
                <th style={{ paddingBottom: '10px', fontWeight: 'normal', textAlign: 'right' }}>TARCZA</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Świat', val: store.customCoreWeight, rate: store.coreRate, isIke: store.isCoreIke, color: '#10b981' },
                { label: 'Krypto', val: store.customSatWeight, rate: store.satRate, isIke: store.isSatIke, color: '#f59e0b' },
                { label: 'Obligacje', val: store.customBondsWeight, rate: store.bondsRate, isIke: store.isBondsIke, color: '#818cf8' },
              ].map((item, id) => (
                <tr key={id} style={{ borderBottom: '1px solid #191f31' }}>
                  <td style={{ padding: '12px 0', fontWeight: 'bold', color: item.color }}>● {item.label}</td>
                  <td style={{ padding: '12px 0', textAlign: 'center', color: '#ffffff' }}>{item.val}%</td>
                  <td style={{ padding: '12px 0', textAlign: 'center', color: '#4edea3' }}>{item.rate}%</td>
                  <td style={{ padding: '12px 0', textAlign: 'right', color: item.isIke ? '#b721ff' : '#908fa0' }}>
                    {item.isIke ? 'IKE' : 'BELKA'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ANALIZA AI */}
      <div style={{ backgroundColor: '#191f31', padding: '35px', borderRadius: '16px', border: '1px solid #c0c1ff33', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
           <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#c0c1ff', boxShadow: '0 0 10px #c0c1ff66' }}></div>
           <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#c0c1ff', letterSpacing: '1px' }}>KINETIC AI ADVISOR ANALYSIS</h2>
        </div>
        <div style={{ fontSize: '14px', lineHeight: '1.7', color: '#dce1fb', whiteSpace: 'pre-wrap', fontFamily: "'Inter', sans-serif" }}>
          {aiAnalysis}
        </div>
      </div>

      {/* STOPKA */}
      <div style={{ marginTop: 'auto', textAlign: 'center', borderTop: '1px solid #2e3447', paddingTop: '20px' }}>
        <p style={{ fontSize: '10px', color: '#908fa0', margin: 0, letterSpacing: '0.5px' }}>
          © Kinetic Oracle IKE | Raport generowany algorytmicznie. Nie stanowi doradztwa inwestycyjnego.
        </p>
      </div>
    </div>
  );
}
