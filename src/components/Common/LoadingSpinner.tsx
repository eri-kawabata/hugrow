import React from 'react';

type LoadingSpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
  color?: 'white' | 'indigo';
  fullHeight?: boolean;
  message?: string;
};

export function LoadingSpinner({ 
  size = 'md', 
  color = 'indigo', 
  fullHeight = false,
  message
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const colorClasses = {
    white: 'text-white',
    indigo: 'text-indigo-600',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${fullHeight ? 'h-full min-h-[200px]' : ''}`}>
      <div className="relative">
        {/* 背景の円 */}
        <div className={`${sizeClasses[size]} rounded-full opacity-20 ${color === 'white' ? 'bg-white' : 'bg-indigo-200'}`}></div>
        
        {/* スピナーのアニメーション */}
        <div className="absolute inset-0">
          <svg 
            className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`} 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            ></circle>
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      </div>
      
      {message && (
        <p className={`mt-3 text-sm ${colorClasses[color]}`}>{message}</p>
      )}
    </div>
  );
} 