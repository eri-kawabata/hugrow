import React, { useState, useCallback, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, UserPlus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
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

const SignUpButton = memo(({ loading, disabled }: { loading: boolean; disabled: boolean }) => (
  <button
    type="submit"
    disabled={loading || disabled}
    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
  >
    {loading ? (
      <>
        <Loader2 className="animate-spin h-5 w-5" />
        <span>登録中...</span>
      </>
    ) : (
      <>
        <UserPlus className="h-5 w-5" />
        <span>新規登録</span>
      </>
    )}
  </button>
));

SignUpButton.displayName = 'SignUpButton';

export function SignUp() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'parent' | 'child'>('parent');

  const handleSignUp = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedUsername = username.trim();

    if (!trimmedEmail || !trimmedPassword || !trimmedUsername) {
      toast.error('すべての項目を入力してください');
      return;
    }

    try {
      setLoading(true);

      // ユーザー登録
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('ユーザー登録に失敗しました');

      // プロフィール作成
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            user_id: authData.user.id,
            username: trimmedUsername,
            role: role,
          },
        ]);

      if (profileError) throw profileError;

      toast.success('アカウントを作成しました');
      navigate('/auth/login');
    } catch (error: any) {
      console.error('SignUp error:', error);
      toast.error(error.message || 'アカウントの作成に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [email, password, username, role, navigate]);

  const isFormValid = email.trim() && password.trim().length >= 6 && username.trim();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">アカウント作成</h1>
            <p className="text-gray-600">必要な情報を入力してください</p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-6">
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

            <InputField
              id="username"
              label="ユーザー名"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ユーザー名"
              disabled={loading}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                アカウントの種類
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="parent"
                    checked={role === 'parent'}
                    onChange={(e) => setRole(e.target.value as 'parent')}
                    className="mr-2"
                    disabled={loading}
                  />
                  <span>保護者</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="child"
                    checked={role === 'child'}
                    onChange={(e) => setRole(e.target.value as 'child')}
                    className="mr-2"
                    disabled={loading}
                  />
                  <span>子ども</span>
                </label>
              </div>
            </div>

            <SignUpButton loading={loading} disabled={!isFormValid} />
          </form>

          <div className="mt-6 text-center">
            <Link 
              to="/auth/login"
              className="text-sm text-indigo-600 hover:text-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={(e) => loading && e.preventDefault()}
            >
              すでにアカウントをお持ちの方はこちら
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}