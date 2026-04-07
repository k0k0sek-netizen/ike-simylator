/**
 * AllocationDonut - Wersja ultra-sterylna (Opcja Nuklearna).
 * Usuwamy framer-motion oraz wszystkie klasy Tailwind powiązane z kolorami,
 * aby uniknąć błędów parsera html2canvas (brak obsługi oklab w v4).
 */
interface AllocationDonutProps {
  core: number;
  sat: number;
  bonds: number;
  size?: number;
  strokeWidth?: number;
}

export function AllocationDonut({ core, sat, bonds, size = 160, strokeWidth = 24 }: AllocationDonutProps) {
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Kolory HEX zamiast klas Tailwind
  const total = core + sat + bonds || 1;
  const segments = [
    { value: core, color: '#10b981', label: 'Świat' },    // emerald-500
    { value: sat, color: '#f59e0b', label: 'Krypto' },   // amber-500
    { value: bonds, color: '#818cf8', label: 'EDO' },     // indigo-400
  ];

  let currentOffset = 0;

  return (
    <div 
      style={{ 
        position: 'relative', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        width: `${size}px`,
        height: `${size}px`
      }}
    >
      <svg 
        width={size} 
        height={size} 
        style={{ 
          transform: 'rotate(-90deg)',
          filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.3))'
        }}
      >
        {/* Tło okręgu (Ciemny odcień tła) */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke="#1a1f2e"
          strokeWidth={strokeWidth}
        />
        
        {segments.map((seg, i) => {
          const percentage = (seg.value / total) * 100;
          const length = (percentage / 100) * circumference;
          const strokeDasharray = `${length} ${circumference}`;
          const strokeDashoffset = -currentOffset;
          
          currentOffset += length;

          if (percentage <= 0) return null;

          return (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="butt"
            />
          );
        })}
      </svg>

      {/* Środek Donuta — Suma 100% */}
      <div 
        style={{ 
          position: 'absolute', 
          inset: 0, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          pointerEvents: 'none'
        }}
      >
        <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#908fa0', letterSpacing: '-0.025em' }}>Portfel</span>
        <span style={{ fontSize: '20px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.025em' }}>100%</span>
      </div>
    </div>
  );
}
