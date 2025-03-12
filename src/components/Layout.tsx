import React, { useState, useEffect } from 'react';
import { Home, PlusSquare, BarChart2, LogOut, Heart, Users, BookOpen, Image, User } from 'lucide-react';
import { Link, useLocation, useNavigate, Outlet, Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

type Profile = {
  username: string | null;
  role: 'parent' | 'child';
};

type LayoutProps = {
  children: React.ReactNode | ((props: { isParentMode: boolean }) => React.ReactNode);
};

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isParentMode, setIsParentMode] = useState(() => {
    // ローカルストレージから保護者モードの状態を復元
    const saved = localStorage.getItem('parentMode');
    return saved ? JSON.parse(saved) : false;
  });
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
        navigate('/auth/login');
        return;
      }

      // プロフィールを取得
      const { data: parentProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'parent')
        .maybeSingle();

      // 親プロフィールが存在する場合のみ保護者モードを有効にできる
      if (!parentProfile && isParentMode) {
        setIsParentMode(false);
        localStorage.setItem('parentMode', 'false');
      }

      // 現在のモードに応じたプロフィールを取得
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('username, role')
        .eq('user_id', user.id)
        .eq('role', isParentMode ? 'parent' : 'child')
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
    navigate('/auth/login');
  };

  const handleModeChange = async (checked: boolean) => {
    if (!supabase) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (checked) {
        // 親プロフィールの存在確認
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .eq('role', 'parent')
          .maybeSingle();

        if (!existingProfile) {
          toast.error('保護者モードの権限がありません');
          return;
        }

        setIsParentMode(true);
        localStorage.setItem('parentMode', 'true');
        navigate('/parent/dashboard');
      } else {
        setIsParentMode(false);
        localStorage.setItem('parentMode', 'false');
        navigate('/child/home');
      }

      // プロフィールを再取得
      const { data: newProfile } = await supabase
        .from('profiles')
        .select('username, role')
        .eq('user_id', user.id)
        .eq('role', checked ? 'parent' : 'child')
        .maybeSingle();

      setProfile(newProfile);
      
      // 子供モードに切り替えた時に、localStorage に子供の名前を保存
      if (!checked && newProfile) {
        localStorage.setItem('childName', newProfile.username || '');
      }
    } catch (error) {
      console.error('Error updating mode:', error);
      toast.error('モードの切り替えに失敗しました');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link 
                to={isParentMode ? '/parent/dashboard' : '/child/home'} 
                className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
              >
                Hugrow
              </Link>
              {!isParentMode && profile?.username && (
                <div className="hidden sm:flex items-center gap-2 py-1 px-3 bg-indigo-50 rounded-full">
                  <span className="text-gray-600">ようこそ、</span>
                  <span className="font-medium text-indigo-700">{profile.username}</span>
                  <span className="text-gray-600">さん</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-6">
              {/* Parent Mode Toggle */}
              <div className="flex items-center space-x-3 bg-gray-50 py-2 px-4 rounded-full">
                <Users className={`h-5 w-5 ${isParentMode ? 'text-indigo-600' : 'text-gray-400'}`} />
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isParentMode}
                    onChange={(e) => handleModeChange(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  <span className="ms-2 text-sm font-medium text-gray-700">
                    {isParentMode ? '保護者モード' : '子どもモード'}
                  </span>
                </label>
              </div>
              {isParentMode && (
                <Link
                  to="/parent/profile"
                  className={`hidden sm:flex items-center gap-2 py-2 px-4 rounded-full transition-colors ${
                    isActive('/parent/profile')
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <User className="h-5 w-5" />
                  <span>プロフィール</span>
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-2 py-2 px-4 rounded-full text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>ログアウト</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-24">
        <Outlet />
      </main>

      {/* Footer Navigation */}
      <footer className="fixed bottom-0 w-full bg-white border-t border-gray-100 shadow-lg">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="h-16 flex items-center justify-around">
            {isParentMode ? (
              <>
                <li>
                  <Link
                    to="/parent/dashboard"
                    className={`flex flex-col items-center space-y-1 ${
                      isActive('/parent/dashboard') ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <BarChart2 className="h-6 w-6" />
                    <span className="text-xs">ダッシュボード</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/parent/analytics/sel"
                    className={`flex flex-col items-center space-y-1 ${
                      isActive('/parent/analytics/sel') ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Heart className="h-6 w-6" />
                    <span className="text-xs">感情分析</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/parent/works"
                    className={`flex flex-col items-center space-y-1 ${
                      isActive('/parent/works') ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Image className="h-6 w-6" />
                    <span className="text-xs">作品一覧</span>
                  </Link>
                </li>
                {/* Mobile only buttons */}
                <li className="sm:hidden">
                  <Link
                    to="/parent/profile"
                    className={`flex flex-col items-center space-y-1 ${
                      isActive('/parent/profile') ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <User className="h-6 w-6" />
                    <span className="text-xs">プロフィール</span>
                  </Link>
                </li>
                <li className="sm:hidden">
                  <button
                    onClick={handleLogout}
                    className="flex flex-col items-center space-y-1 text-gray-500 hover:text-gray-700"
                  >
                    <LogOut className="h-6 w-6" />
                    <span className="text-xs">ログアウト</span>
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    to="/child/home"
                    className={`flex flex-col items-center space-y-1 ${
                      isActive('/child/home') ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Home className="h-6 w-6" />
                    <span className="text-xs">ホーム</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/child/learning"
                    className={`flex flex-col items-center space-y-1 ${
                      isActive('/child/learning') ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <BookOpen className="h-6 w-6" />
                    <span className="text-xs">学習</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/child/works/new"
                    className={`flex flex-col items-center space-y-1 ${
                      isActive('/child/works/new') ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <PlusSquare className="h-6 w-6" />
                    <span className="text-xs">作品投稿</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/child/works"
                    className={`flex flex-col items-center space-y-1 ${
                      isActive('/child/works') ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Image className="h-6 w-6" />
                    <span className="text-xs">作品一覧</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/child/sel-quest"
                    className={`flex flex-col items-center space-y-1 ${
                      isActive('/child/sel-quest') ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
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

      {loading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
        </div>
      )}
    </div>
  );
}