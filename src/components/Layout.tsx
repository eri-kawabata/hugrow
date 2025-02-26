import React, { useState, useEffect } from 'react';
import { Home, PlusSquare, BarChart2, LogOut, Heart, Users, BookOpen, Image, User } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

type Profile = {
  username: string | null;
  role: 'parent' | 'child';
};

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isParentMode, setIsParentMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    checkParentMode();
  }, []);

  const checkParentMode = async () => {
    if (!supabase) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/');
        return;
      }

      // プロフィールを取得
      const { data: parentProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'parent')
        .maybeSingle();

      const isParent = !!parentProfile;
      setIsParentMode(isParent);

      // 現在のモードに応じたプロフィールを取得
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('username, role')
        .eq('user_id', user.id)
        .eq('role', isParent ? 'parent' : 'child')
        .maybeSingle();

      setProfile(currentProfile);
    } catch (error) {
      console.error('Error checking parent mode:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    toast.success('ログアウトしました');
    navigate('/');
  };

  const handleModeChange = async (checked: boolean) => {
    if (!supabase) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (checked) {
        // 親モードに切り替え - プロフィールが存在しない場合のみ作成
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .eq('role', 'parent')
          .maybeSingle();

        if (!existingProfile) {
          const { error } = await supabase
            .from('profiles')
            .insert({
              user_id: user.id,
              role: 'parent',
              updated_at: new Date().toISOString()
            });

          if (error) throw error;
        }

        setIsParentMode(true);
        navigate('/report');
      } else {
        // 子供モードに切り替え - 親プロフィールを削除
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('user_id', user.id)
          .eq('role', 'parent');

        if (error) throw error;
        setIsParentMode(false);
        if (['/report', '/works', '/parent/profile'].includes(location.pathname)) {
          navigate('/home');
        }
      }

      // プロフィールを再取得
      const { data: newProfile } = await supabase
        .from('profiles')
        .select('username, role')
        .eq('user_id', user.id)
        .eq('role', checked ? 'parent' : 'child')
        .maybeSingle();

      setProfile(newProfile);
    } catch (error) {
      console.error('Error updating mode:', error);
      toast.error('モードの切り替えに失敗しました');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={isParentMode ? '/report' : '/home'} className="text-2xl font-bold text-indigo-600">
              Hugrow
            </Link>
            {!isParentMode && profile?.username && (
              <span className="text-gray-600">
                ようこそ、<span className="font-medium">{profile.username}</span>さん
              </span>
            )}
          </div>
          <div className="flex items-center space-x-6">
            {/* Parent Mode Toggle */}
            <div className="flex items-center space-x-2">
              <Users className={`h-5 w-5 ${isParentMode ? 'text-indigo-600' : 'text-gray-400'}`} />
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isParentMode}
                  onChange={(e) => handleModeChange(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                <span className="ms-2 text-sm font-medium text-gray-600">
                  {isParentMode ? '保護者モード' : '子どもモード'}
                </span>
              </label>
            </div>
            {isParentMode && (
              <Link
                to="/parent/profile"
                className={`text-gray-500 hover:text-gray-700 flex items-center space-x-1 ${
                  isActive('/parent/profile') ? 'text-indigo-600' : ''
                }`}
              >
                <User className="h-5 w-5" />
                <span>プロフィール</span>
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700 flex items-center space-x-1"
            >
              <LogOut className="h-5 w-5" />
              <span>ログアウト</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer Navigation */}
      <footer className="fixed bottom-0 w-full bg-white border-t border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="h-16 flex items-center justify-around">
            {isParentMode ? (
              <>
                <li>
                  <Link
                    to="/report"
                    className={`flex flex-col items-center space-y-1 ${
                      isActive('/report') ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <BarChart2 className="h-6 w-6" />
                    <span className="text-xs">レポート</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/works"
                    className={`flex flex-col items-center space-y-1 ${
                      isActive('/works') ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Image className="h-6 w-6" />
                    <span className="text-xs">作品一覧</span>
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    to="/home"
                    className={`flex flex-col items-center space-y-1 ${
                      isActive('/home') ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Home className="h-6 w-6" />
                    <span className="text-xs">ホーム</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/learning"
                    className={`flex flex-col items-center space-y-1 ${
                      isActive('/learning') ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <BookOpen className="h-6 w-6" />
                    <span className="text-xs">学習</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/works/new"
                    className={`flex flex-col items-center space-y-1 ${
                      isActive('/works/new') ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <PlusSquare className="h-6 w-6" />
                    <span className="text-xs">作品投稿</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/works"
                    className={`flex flex-col items-center space-y-1 ${
                      isActive('/works') ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Image className="h-6 w-6" />
                    <span className="text-xs">作品一覧</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/sel-quest"
                    className={`flex flex-col items-center space-y-1 ${
                      isActive('/sel-quest') ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Heart className="h-6 w-6" />
                    <span className="text-xs">きもち</span>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </footer>
    </div>
  );
}