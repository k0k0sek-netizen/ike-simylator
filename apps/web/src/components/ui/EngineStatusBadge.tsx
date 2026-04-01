import { motion } from 'framer-motion';

interface EngineStatusBadgeProps {
  engineType: 'WASM' | 'JS_MOCK' | 'LOADING';
}

export function EngineStatusBadge({ engineType }: EngineStatusBadgeProps) {
  if (engineType === 'LOADING') return null;

  const isWasm = engineType === 'WASM';
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isWasm ? { opacity: 1, scale: 1, boxShadow: ["0 0 0px 0px rgba(74, 222, 128, 0.4)", "0 0 10px 3px rgba(74, 222, 128, 0.2)", "0 0 0px 0px rgba(74, 222, 128, 0.4)"] } : { opacity: 1, scale: 1 }}
      transition={{ boxShadow: { repeat: Infinity, duration: 2, ease: "easeInOut" } }}
      className={`relative flex items-center gap-2 px-3 py-1 rounded-full border backdrop-blur-md transition-all duration-500 whitespace-nowrap ${
        isWasm 
          ? 'bg-green-500/10 border-green-500/30 text-green-400' 
          : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
      }`}
    >
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
          isWasm ? 'bg-green-400' : 'bg-yellow-400'
        }`}></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${
          isWasm ? 'bg-green-500' : 'bg-yellow-500'
        }`}></span>
      </span>
      <span className="text-[10px] font-headline font-bold uppercase tracking-widest">
        {isWasm ? '🟢 Wasm Engine' : '🟡 JS Fallback'}
      </span>
    </motion.div>
  );
}
