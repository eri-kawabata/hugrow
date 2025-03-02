import React, { memo } from 'react';

type LoadingSpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
  color?: 'white' | 'indigo';
  fullHeight?: boolean;
};

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

const colorClasses = {
  white: 'text-white',
  indigo: 'text-indigo-600',
};

export const LoadingSpinner = memo(({
  size = 'md',
  color = 'indigo',
  fullHeight = true,
}: LoadingSpinnerProps) => (
  <div className={fullHeight ? 'h-full flex items-center justify-center' : ''}>
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
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  </div>
));

LoadingSpinner.displayName = 'LoadingSpinner'; 