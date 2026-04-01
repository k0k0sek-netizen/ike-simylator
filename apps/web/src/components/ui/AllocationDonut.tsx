import { motion } from 'framer-motion';

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

  // Obliczanie kątów i przesunięć dla każdego segmentu
  // Suma musi być 100%, ale dla bezpieczeństwa dzielimy przez sumę
  const total = core + sat + bonds || 1;
  const segments = [
    { value: core, color: '#10b981', label: 'Świat' },    // emerald-500 (secondary)
    { value: sat, color: '#f59e0b', label: 'Krypto' },   // amber-500
    { value: bonds, color: '#818cf8', label: 'EDO' },     // indigo-400
  ];

  let currentOffset = 0;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90 drop-shadow-xl">
        {/* Tło (szary okrąg) */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
        />
        
        {segments.map((seg, i) => {
          const percentage = (seg.value / total) * 100;
          const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
          const strokeDashoffset = -currentOffset;
          
          currentOffset += (percentage / 100) * circumference;

          if (percentage <= 0) return null;

          return (
            <motion.circle
              key={i}
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ type: 'spring', stiffness: 60, damping: 15 }}
              strokeLinecap="butt"
              className="transition-all duration-500"
            />
          );
        })}
      </svg>

      {/* Środek Donuta — Suma 100% */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[10px] uppercase font-label text-outline/50 tracking-tighter">Portfel</span>
        <span className="text-xl font-headline font-black text-white tracking-tighter">100%</span>
      </div>
    </div>
  );
}
