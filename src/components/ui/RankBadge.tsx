import React from 'react';
import { motion } from 'framer-motion';

interface RankBadgeProps {
  rank: number;
}

export function RankBadge({ rank }: RankBadgeProps) {
  if (rank < 1 || rank > 3) return null;

  const config = {
    1: {
      gradient: "from-yellow-300 via-yellow-400 to-yellow-600",
      text: "text-yellow-950",
      border: "border-yellow-200",
      shadow: "shadow-[0_0_20px_rgba(250,204,21,0.6)]",
      icon: "👑",
      label: "1st",
    },
    2: {
      gradient: "from-slate-200 via-slate-300 to-slate-400",
      text: "text-slate-900",
      border: "border-white",
      shadow: "shadow-[0_0_20px_rgba(203,213,225,0.6)]",
      icon: "🥈",
      label: "2nd",
    },
    3: {
      gradient: "from-orange-300 via-orange-500 to-orange-700",
      text: "text-orange-950",
      border: "border-orange-200",
      shadow: "shadow-[0_0_20px_rgba(249,115,22,0.6)]",
      icon: "🥉",
      label: "3rd",
    },
  }[rank as 1 | 2 | 3];

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.5 + (rank * 0.1) }}
      className={`absolute -top-3 -right-3 sm:-top-5 sm:-right-5 w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border-4 z-20 font-black bg-gradient-to-br ${config.gradient} ${config.text} ${config.border} ${config.shadow}`}
      style={{
        animation: "rankFloat 3s ease-in-out infinite",
        animationDelay: `${rank * 0.2}s`,
      }}
    >
      <style>{`
        @keyframes rankFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-6px) scale(1.05); }
        }
        @keyframes rankShine {
          0% { left: -100%; opacity: 0; }
          10% { opacity: 1; }
          20% { left: 100%; opacity: 0; }
          100% { left: 100%; opacity: 0; }
        }
      `}</style>
      
      {/* Shine effect */}
      <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
        <div 
          className="absolute top-0 bottom-0 w-1/2 bg-white/60 blur-[2px] skew-x-[-20deg]"
          style={{
            animation: "rankShine 4s infinite",
            animationDelay: `${rank * 0.5}s`
          }}
        />
      </div>
      
      <span className="relative z-10 text-lg sm:text-2xl filter drop-shadow-md">
        {config.icon}
      </span>
      
      {/* Mini rank label */}
      <div className="absolute -bottom-2 bg-foreground text-background text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full border-2 border-background tracking-wider">
        {config.label}
      </div>
    </motion.div>
  );
}
