import { AlertCircle, RefreshCw } from 'lucide-react';
import { Layout } from './Layout';

interface Props {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'エラーが発生しました', onRetry }: Props) {
  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <RefreshCw className="h-4 w-4" />
              再試行
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
} 