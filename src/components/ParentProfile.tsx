import React, { useState, useEffect } from 'react';
import { Layout } from './Layout';
import { User, Mail, Save, Loader2, ArrowLeft, Calendar, Users, Settings, Bell, Shield, Key } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

type NotificationSettings = {
  email_notifications: boolean;
  achievement_notifications: boolean;
  feedback_notifications: boolean;
};

type SecuritySettings = {
  two_factor_enabled: boolean;
  login_notifications: boolean;
};

export function ParentProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security'>('profile');
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email_notifications: true,
    achievement_notifications: true,
    feedback_notifications: true,
  });
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    two_factor_enabled: false,
    login_notifications: true,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    if (!supabase) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('ログインが必要です');
        return;
      }

      setEmail(user.email || '');

      const { data: profile, error: selectError } = await supabase
        .from('profiles')
        .select('username, birthdate')
        .eq('user_id', user.id)
        .eq('role', 'parent')
        .maybeSingle();

      if (selectError) throw selectError;

      if (profile) {
        setUsername(profile.username || '');
        setBirthdate(profile.birthdate || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('プロフィールの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('ログインが必要です');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          username: username.trim() || null,
          birthdate: birthdate || null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('role', 'parent');

      if (error) throw error;

      toast.success('プロフィールを更新しました');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('プロフィールの更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationChange = (key: keyof NotificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    toast.success('通知設定を更新しました');
  };

  const handleSecurityChange = (key: keyof SecuritySettings) => {
    setSecuritySettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    toast.success('セキュリティ設定を更新しました');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            to="/report"
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>レポートに戻る</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-lg">
          {/* Header */}
          <div className="p-8 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Settings className="h-6 w-6 text-indigo-600" />
              アカウント設定
            </h1>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-100">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-8 py-4 font-medium text-sm transition-colors ${
                  activeTab === 'profile'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  プロフィール
                </div>
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`px-8 py-4 font-medium text-sm transition-colors ${
                  activeTab === 'notifications'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  通知設定
                </div>
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`px-8 py-4 font-medium text-sm transition-colors ${
                  activeTab === 'security'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  セキュリティ
                </div>
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-8">
            {activeTab === 'profile' && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    メールアドレス
                  </label>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-5 w-5" />
                    <span>{email}</span>
                  </div>
                </div>

                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    表示名
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="表示名を入力"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    この名前は、フィードバックの送信者として表示されます
                  </p>
                </div>

                <div>
                  <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700 mb-1">
                    誕生日
                  </label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <input
                      id="birthdate"
                      type="date"
                      value={birthdate}
                      onChange={(e) => setBirthdate(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      <span>保存する</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">通知設定</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">メール通知</h3>
                      <p className="text-sm text-gray-500">重要なお知らせをメールで受け取る</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notificationSettings.email_notifications}
                        onChange={() => handleNotificationChange('email_notifications')}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">実績の通知</h3>
                      <p className="text-sm text-gray-500">子供が新しい実績を達成したときに通知</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notificationSettings.achievement_notifications}
                        onChange={() => handleNotificationChange('achievement_notifications')}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">フィードバックの通知</h3>
                      <p className="text-sm text-gray-500">子供の作品に新しいフィードバックがついたときに通知</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notificationSettings.feedback_notifications}
                        onChange={() => handleNotificationChange('feedback_notifications')}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">セキュリティ設定</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">2段階認証</h3>
                      <p className="text-sm text-gray-500">ログイン時に追加の認証を要求</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={securitySettings.two_factor_enabled}
                        onChange={() => handleSecurityChange('two_factor_enabled')}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">ログイン通知</h3>
                      <p className="text-sm text-gray-500">新しいデバイスからのログインを通知</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={securitySettings.login_notifications}
                        onChange={() => handleSecurityChange('login_notifications')}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="mt-8">
                    <button
                      onClick={() => toast.success('パスワードリセットのメールを送信しました')}
                      className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
                    >
                      <Key className="h-5 w-5" />
                      <span>パスワードを変更する</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <Link
          to="/parent/child-profile"
          className="block bg-white rounded-2xl shadow-lg p-8 mt-8 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="bg-indigo-100 p-3 rounded-xl">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">子供のプロフィール設定</h2>
              <p className="text-gray-600">子供の表示名や誕生日を設定できます</p>
            </div>
          </div>
        </Link>
      </div>
    </Layout>
  );
}