import React from 'react';

type EmptyStateProps = {
  title: string;
  message: string;
  className?: string;
  children?: React.ReactNode;
};

export function EmptyState({ title, message, className = '', children }: EmptyStateProps) {
  return (
    <div className={`text-center ${className}`}>
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 mb-4">
        <svg
          className="w-8 h-8 text-indigo-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{message}</p>
      {children}
    </div>
  );
} 