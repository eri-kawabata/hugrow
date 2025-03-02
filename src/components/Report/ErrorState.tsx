import { AlertTriangle } from 'lucide-react';

export interface ErrorStateProps {
  message?: string;
  error?: Error;
  onRetry?: () => void | Promise<void>;
}

export function ErrorState({ message, error, onRetry }: ErrorStateProps) {
  const errorMessage = message || error?.message || '予期せぬエラーが発生しました';

  return (
    <div className="text-center py-12">
      <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h2 className="text-lg font-medium text-gray-900 mb-2">
        エラーが発生しました
      </h2>
      <p className="text-gray-600 mb-6">{errorMessage}</p>
      {onRetry && (
        <button
          onClick={() => {
            void onRetry();
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          再試行
        </button>
      )}
    </div>
  );
} 