import { captureException } from '@sentry/react';
import toast from 'react-hot-toast';

interface ErrorConfig {
  silent?: boolean;
  retry?: boolean;
  fallback?: () => void;
  userMessage?: string;
}

export function handleError(error: unknown, config = {}) {
  // エラーをSentryに送信
  captureException(error);

  // エラーメッセージを表示
  const message = error instanceof Error ? error.message : '予期せぬエラーが発生しました';
  toast.error(message);

  // コンソールにエラーを出力
  console.error('Error:', error);
}

// カスタムエラークラス
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
} 