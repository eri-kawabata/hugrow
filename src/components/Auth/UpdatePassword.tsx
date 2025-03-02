import React, { useState, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Key } from 'lucide-react';
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

const UpdateButton = memo(({ loading, disabled }: { loading: boolean; disabled: boolean }) => (
  <button
    type="submit"
    disabled={loading || disabled}
    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
  >
    {loading ? (
      <>
        <Loader2 className="animate-spin h-5 w-5" />
        <span>更新中...</span>
      </>
    ) : (
      <>
        <Key className="h-5 w-5" />
        <span>パスワードを更新</span>
      </>
    )}
  </button>
));

UpdateButton.displayName = 'UpdateButton';

export function UpdatePassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (!trimmedPassword || !trimmedConfirmPassword) {
      toast.error('すべての項目を入力してください');
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      toast.error('パスワードが一致しません');
      return;
    }

    if (trimmedPassword.length < 6) {
      toast.error('パスワードは6文字以上で入力してください');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        password: trimmedPassword
      });

      if (error) throw error;

      toast.success('パスワードを更新しました');
      navigate('/auth/login');
    } catch (error: any) {
      console.error('Password update error:', error);
      toast.error(error.message || 'パスワードの更新に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [password, confirmPassword, navigate]);

  const isFormValid = password.trim() && 
    confirmPassword.trim() && 
    password.trim().length >= 6 &&
    password === confirmPassword;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">新しいパスワード</h1>
            <p className="text-gray-600">新しいパスワードを入力してください</p>
          </div>

          <form onSubmit={handleUpdate} className="space-y-6">
            <InputField
              id="password"
              label="新しいパスワード"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              disabled={loading}
            />

            <InputField
              id="confirmPassword"
              label="パスワードの確認"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              disabled={loading}
            />

            <UpdateButton loading={loading} disabled={!isFormValid} />
          </form>
        </div>
      </div>
    </div>
  );
} 