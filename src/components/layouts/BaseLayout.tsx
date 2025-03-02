import React, { useCallback, memo, useState } from 'react';
import { LogOut, User, ChevronDown } from 'lucide-react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

type BaseLayoutProps = {
  children: React.ReactNode;
};

type HeaderProps = {
  username: string | null | undefined;
  onModeChange?: (mode: 'parent' | 'child') => void;
  onLogout: () => void;
};

const Header = memo(({ username, onModeChange, onLogout }: HeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link 
              to="/" 
              className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
              Hugrow
            </Link>
            {username && (
              <div className="hidden sm:flex items-center gap-2 py-1 px-3 bg-indigo-50 rounded-full">
                <span className="text-gray-600">ようこそ、</span>
                <span className="font-medium text-indigo-700">{username}</span>
                <span className="text-gray-600">さん</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {onModeChange && (
              <div className="relative">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center gap-2 py-2 px-4 rounded-full text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span>子供モード</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                {isOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                    <button
                      onClick={() => {
                        onModeChange('parent');
                        setIsOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50"
                    >
                      保護者モード
                    </button>
                    <button
                      onClick={() => {
                        onModeChange('child');
                        setIsOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50"
                    >
                      子供モード
                    </button>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={onLogout}
              className="flex items-center gap-2 py-2 px-4 rounded-full text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>ログアウト</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export const BaseLayout: React.FC<BaseLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      toast.success('ログアウトしました');
      navigate('/auth/login');
    } catch (error) {
      toast.error('ログアウトに失敗しました');
      console.error('Logout error:', error);
    }
  }, [signOut, navigate]);

  const handleModeChange = useCallback((mode: 'parent' | 'child') => {
    navigate(mode === 'parent' ? '/parent/dashboard' : '/child/home');
    toast.success(`${mode === 'parent' ? '保護者' : '子供'}モードに切り替えました`);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#f8fbfd]">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Link to="/" className="text-[#5d7799] text-xl font-bold">
                Hugrow
              </Link>
              <div className="text-sm text-gray-500">
                ようこそ、{profile?.username || 'ゲスト'} さん
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}; 