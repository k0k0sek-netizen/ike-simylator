/**
 * AllocationDonut - Wersja ultra-sterylna (Opcja Nuklearna).
 * Usuwamy framer-motion oraz wszystkie klasy Tailwind powiązane z kolorami,
 * aby uniknąć błędów parsera html-to-image (brak obsługi oklab w formacie eksportu SVG/obiektów).
 */
interface AllocationDonutProps {
  segments: { value: number; color: string; label: string }[];
  size?: number;
  strokeWidth?: number;
}

export function AllocationDonut({ segments, size = 160, strokeWidth = 24 }: AllocationDonutProps) {
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Obliczamy sumę
  const total = segments.reduce((sum, seg) => sum + seg.value, 0) || 1;

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
