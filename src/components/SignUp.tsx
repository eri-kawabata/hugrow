import React, { useState } from 'react';
import { Loader2, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

export function SignUp() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [parentName, setParentName] = useState('');
  const [childName, setChildName] = useState('');
  const [parentBirthdate, setParentBirthdate] = useState('');
  const [childBirthdate, setChildBirthdate] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      toast.error('Supabaseの設定が必要です');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('パスワードが一致しません');
      return;
    }

    if (!parentName.trim() || !childName.trim()) {
      toast.error('保護者名と子供の名前を入力してください');
      return;
    }

    if (!parentBirthdate || !childBirthdate) {
      toast.error('誕生日を入力してください');
      return;
    }

    try {
      setLoading(true);
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;
      if (!user) throw new Error('ユーザー登録に失敗しました');

      // プロフィールの作成を1つのトランザクションとして扱う
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            user_id: user.id,
            username: parentName.trim(),
            role: 'parent',
            birthdate: parentBirthdate
          },
          {
            user_id: user.id,
            username: childName.trim(),
            role: 'child',
            birthdate: childBirthdate
          }
        ]);

      if (profileError) throw profileError;

      toast.success('アカウントを作成しました！');
      navigate('/home');
    } catch (error) {
      console.error('Error:', error);
      toast.error('アカウント作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">アカウント作成</h1>
            <p className="text-gray-600">Hugrowへようこそ！</p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-6">
            <div>
              <label htmlFor="parentName" className="block text-sm font-medium text-gray-700 mb-1">
                保護者名
              </label>
              <input
                id="parentName"
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="保護者の名前"
                required
              />
            </div>

            <div>
              <label htmlFor="parentBirthdate" className="block text-sm font-medium text-gray-700 mb-1">
                保護者の誕生日
              </label>
              <input
                id="parentBirthdate"
                type="date"
                value={parentBirthdate}
                onChange={(e) => setParentBirthdate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="childName" className="block text-sm font-medium text-gray-700 mb-1">
                子供の名前
              </label>
              <input
                id="childName"
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="子供の名前"
                required
              />
            </div>

            <div>
              <label htmlFor="childBirthdate" className="block text-sm font-medium text-gray-700 mb-1">
                子供の誕生日
              </label>
              <input
                id="childBirthdate"
                type="date"
                value={childBirthdate}
                onChange={(e) => setChildBirthdate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="example@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                パスワード
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                パスワード（確認）
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <>
                  <UserPlus className="h-5 w-5" />
                  <span>アカウントを作成</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-indigo-600 hover:text-indigo-500">
              すでにアカウントをお持ちの方はこちら
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}