import React, { useState, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, RotateCcw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import toast from 'react-hot-toast';

const InputField = memo(({ 
  id, 
  label, 
  type, 
  value, 
  onChange, 
  placeholder, 
  disabled,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  disabled?: boolean;
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
      placeholder={placeholder}
      disabled={disabled}
    />
  </div>
));

InputField.displayName = 'InputField';

const ResetButton = memo(({ loading, disabled }: { loading: boolean; disabled: boolean }) => (
  <button
    type="submit"
    disabled={loading || disabled}
    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
  >
    {loading ? (
      <>
        <Loader2 className="animate-spin h-5 w-5" />
        <span>送信中...</span>
      </>
    ) : (
      <>
        <RotateCcw className="h-5 w-5" />
        <span>パスワードをリセット</span>
      </>
    )}
  </button>
));

ResetButton.displayName = 'ResetButton';

export function PasswordReset() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPassword, loading: authLoading } = useSupabaseAuth();

  const isLoading = loading || authLoading;

  const handleReset = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast.error('メールアドレスを入力してください');
      return;
    }

    try {
      setLoading(true);
      
      // Supabase認証フックを使用してパスワードリセット
      const { success, error } = await resetPassword(trimmedEmail);
      
      if (!success) {
        throw new Error(error || 'パスワードリセットに失敗しました');
      }

      setSent(true);
      toast.success('パスワードリセットメールを送信しました');
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(error.message || 'パスワードリセットに失敗しました');
    } finally {
      setLoading(false);
    }
  }, [email, resetPassword]);

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">メールを送信しました</h2>
        <p className="text-gray-600">
          パスワードリセットの手順を記載したメールを送信しました。<br />
          メールの指示に従ってパスワードを再設定してください。
        </p>
        <Link
          to="/auth/login"
          className="inline-block text-sm text-indigo-600 hover:text-indigo-500"
        >
          ログイン画面に戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">パスワードをリセット</h1>
            <p className="text-gray-600">
              登録したメールアドレスを入力してください。<br />
              パスワードリセットのメールをお送りします。
            </p>
          </div>

          <form onSubmit={handleReset} className="space-y-6">
            <InputField
              id="email"
              label="メールアドレス"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              disabled={isLoading}
            />

            <ResetButton loading={isLoading} disabled={!email.trim()} />
          </form>

          <div className="mt-6 text-center">
            <Link 
              to="/auth/login"
              className="text-sm text-indigo-600 hover:text-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={(e) => isLoading && e.preventDefault()}
            >
              ログイン画面に戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 