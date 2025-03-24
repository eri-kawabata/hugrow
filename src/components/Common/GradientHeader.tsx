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
    <div className="w-full mx-auto">
      <div 
        className="px-6 py-6 rounded-[24px] shadow-lg relative overflow-hidden mx-auto mb-6 h-24 max-w-5xl"
        style={gradientStyle}
      >
        {/* 背景のパターン */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: `${Math.random() * 12 + 6}px`,
                height: `${Math.random() * 12 + 6}px`,
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
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className="absolute w-0.5 h-0.5 bg-white rounded-full animate-twinkle"
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
        
        <h1 className="text-3xl font-bold text-white text-center drop-shadow-lg animate-fade-in-up px-4">
          {title}
        </h1>
      </div>
    </div>
  );
}; 