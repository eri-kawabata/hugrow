import React from 'react';

interface GradientHeaderProps {
  title: string;
  gradientColors?: {
    from: string;
    via: string;
    to: string;
  };
}

export const GradientHeader: React.FC<GradientHeaderProps> = ({ 
  title,
  gradientColors = {
    from: '#8ec5d6',
    via: '#f7c5c2',
    to: '#f5f6bf'
  }
}) => {
  const gradientStyle = {
    backgroundImage: `linear-gradient(to right, ${gradientColors.from}, ${gradientColors.via}, ${gradientColors.to})`
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div 
        className="px-8 py-14 rounded-[32px] shadow-lg relative overflow-hidden mx-6 mb-16"
        style={gradientStyle}
      >
        {/* 背景のパターン */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: `${Math.random() * 16 + 8}px`,
                height: `${Math.random() * 16 + 8}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.5,
                transform: `scale(${Math.random() * 0.5 + 0.5})`
              }}
            />
          ))}
        </div>
        
        {/* キラキラエフェクト */}
        <div className="absolute inset-0">
          {[...Array(25)].map((_, i) => (
            <div 
              key={i} 
              className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${1.5 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-b from-white/0 to-white/20"></div>
        
        <div className="relative z-10 max-w-lg mx-auto">
          <h1 className="text-4xl font-bold text-white text-center drop-shadow-lg animate-fade-in-up px-4">
            {title}
          </h1>
        </div>
      </div>
    </div>
  );
}; 