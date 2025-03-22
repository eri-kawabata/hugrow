import React from 'react';
import { motion } from 'framer-motion';

type GlowCardProps = {
  children: React.ReactNode;
  gradientColors: {
    from: string;
    via?: string;
    to: string;
  };
  className?: string;
  onClick?: () => void;
};

export function GlowCard({ children, gradientColors, className = '', onClick }: GlowCardProps) {
  const { from, via, to } = gradientColors;
  const gradientStyle = via
    ? `linear-gradient(135deg, ${from}, ${via}, ${to})`
    : `linear-gradient(135deg, ${from}, ${to})`;

  return (
    <motion.div
      className={`relative rounded-2xl overflow-hidden bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}
      onClick={onClick}
      whileHover={{ 
        scale: 1.02,
        y: -4
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {/* グラデーションの背景オーバーレイ */}
      <div
        className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-300"
        style={{ background: gradientStyle }}
      />

      {/* グロー効果 */}
      <div
        className="absolute inset-0 opacity-30 blur-2xl group-hover:opacity-40 transition-opacity duration-300"
        style={{ background: gradientStyle }}
      />

      {/* コンテンツ */}
      <div className="relative group">
        {children}
      </div>

      {/* キラキラ効果 */}
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.4),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      />

      {/* 光の反射効果 */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      />
    </motion.div>
  );
} 