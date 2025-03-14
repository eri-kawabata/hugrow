import React, { useState, useCallback, memo } from 'react';
import { Loader2, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import toast from 'react-hot-toast';

const InputField = memo(({ 
  id, 
  label, 
  type, 
  value, 
  onChange, 
  placeholder, 
  required = true,
  minLength,
  disabled,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required?: boolean;
  minLength?: number;
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
      required={required}
      minLength={minLength}
      disabled={disabled}
    />
  </div>
));

InputField.displayName = 'InputField';

const LoginButton = memo(({ loading, disabled }: { loading: boolean; disabled: boolean }) => (
  <button
    type="submit"
    disabled={loading || disabled}
    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
  >
    {loading ? (
      <>
        <Loader2 className="animate-spin h-5 w-5" />
        <span>ログイン中...</span>
      </>
    ) : (
      <>
        <LogIn className="h-5 w-5" />
        <span>ログイン</span>
      </>
    )}
  </button>
));

LoginButton.displayName = 'LoginButton';

export function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn: legacySignIn, loading: legacyLoading } = useAuth();
  const { signIn: supabaseSignIn, loading: supabaseLoading } = useSupabaseAuth();
  const navigate = useNavigate();
  
  const loading = legacyLoading || supabaseLoading;

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      toast.error('メールアドレスとパスワードを入力してください');
      return;
    }

    try {
      // Supabase認証を試みる
      const result = await supabaseSignIn(trimmedEmail, trimmedPassword);
      
      if (result.success) {
        // 成功した場合はダッシュボードへリダイレクト
        navigate('/parent/dashboard');
        return;
      }
      
      // Supabase認証に失敗した場合は既存の認証を試みる
      await legacySignIn(trimmedEmail, trimmedPassword);
    } catch (error) {
      console.error('認証エラー:', error);
      toast.error('ログインに失敗しました。メールアドレスとパスワードを確認してください。');
    }
  }, [email, password, supabaseSignIn, legacySignIn, navigate]);

  const isFormValid = email.trim() && password.trim().length >= 6;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Hugrow</h1>
            <p className="text-gray-600">子どもの創造性を育む学習プラットフォーム</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <InputField
              id="email"
              label="メールアドレス"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              disabled={loading}
            />

            <InputField
              id="password"
              label="パスワード"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              disabled={loading}
            />

            <LoginButton loading={loading} disabled={!isFormValid} />
          </form>

          <div className="mt-6 text-center space-y-4">
            <Link 
              to="/auth/signup" 
              className="block text-sm text-indigo-600 hover:text-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={(e) => loading && e.preventDefault()}
            >
              アカウントをお持ちでない方はこちら
            </Link>

            <Link 
              to="/auth/reset-password"
              className="block text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={(e) => loading && e.preventDefault()}
            >
              パスワードをお忘れの方はこちら
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}