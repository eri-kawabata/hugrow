import React, { memo } from 'react';

type EmptyStateProps = {
  title: string;
  message: string;
  className?: string;
};

export const EmptyState = memo(({
  title,
  message,
  className = '',
}: EmptyStateProps) => (
  <div className={`text-center py-12 ${className}`}>
    <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
    <p className="mt-2 text-gray-600">{message}</p>
  </div>
));

EmptyState.displayName = 'EmptyState'; 