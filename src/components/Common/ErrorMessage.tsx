import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

type ErrorMessageProps = {
  title: string;
  message: string;
  onRetry?: () => void;
};

export function ErrorMessage({ title, message, onRetry }: ErrorMessageProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-red-100 rounded-full flex-shrink-0">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 mb-4">{message}</p>
          
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-full hover:bg-red-100 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>もう一度試す</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 