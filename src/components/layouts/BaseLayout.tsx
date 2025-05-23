import React, { useCallback, memo, useState, useEffect } from 'react';
import { LogOut, User, ChevronDown, Shield, Menu, X } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import AiDoctor from '../Common/AiDoctor';
import { AiDoctorProvider } from '../../contexts/AiDoctorContext';
import Logo from '../Logo';

type BaseLayoutProps = {
  children?: React.ReactNode;
  hideHeader?: boolean;
};

type HeaderProps = {
  username: string | null | undefined;
  onModeChange?: (mode: 'parent' | 'child') => void;
  onLogout: () => void;
};

const Header = memo(({ username, onModeChange, onLogout }: HeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const [childName, setChildName] = useState<string | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(
    localStorage.getItem('selectedChildId') || localStorage.getItem('selectedChildProfileId')
  );
  
  // 現在のモードを判定
  const isParentMode = pathname.includes('/parent');
  
  // localStorageの変更を監視
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'selectedChildId' || e.key === 'selectedChildProfileId') {
        const newChildId = e.newValue || localStorage.getItem('selectedChildId') || localStorage.getItem('selectedChildProfileId');
        console.log('BaseLayout - 子供ID変更検知:', e.key, newChildId);
        setSelectedChildId(newChildId);
        
        // 子供IDが変更されたら子供の名前を再取得
        if (newChildId) {
          fetchChildName(newChildId);
        }
      }
      if (e.key === 'childName') {
        console.log('BaseLayout - childName変更検知:', e.newValue);
        setChildName(e.newValue);
      }
    };

    // カスタムイベントの監視
    const handleChildChange = () => {
      const newChildId = localStorage.getItem('selectedChildId') || localStorage.getItem('selectedChildProfileId');
      const newChildName = localStorage.getItem('childName');
      console.log('BaseLayout - selectedChildChanged イベント検知:', newChildId, newChildName);
      setSelectedChildId(newChildId);
      if (newChildName) {
        setChildName(newChildName);
      } else if (newChildId) {
        fetchChildName(newChildId);
      }
    };
    
    // 子供プロフィール更新イベントの監視
    const handleChildProfileUpdated = (e: CustomEvent) => {
      console.log('BaseLayout - childProfileUpdated イベント検知:', e.detail);
      if (e.detail && e.detail.childName) {
        setChildName(e.detail.childName);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('selectedChildChanged', handleChildChange);
    window.addEventListener('childProfileUpdated', handleChildProfileUpdated as EventListener);

    // 初期値を設定
    const initialChildId = localStorage.getItem('selectedChildId') || localStorage.getItem('selectedChildProfileId');
    if (initialChildId && initialChildId !== selectedChildId) {
      console.log('BaseLayout - 初期値設定:', initialChildId);
      setSelectedChildId(initialChildId);
      fetchChildName(initialChildId);
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('selectedChildChanged', handleChildChange);
      window.removeEventListener('childProfileUpdated', handleChildProfileUpdated as EventListener);
    };
  }, []);
  
  // 子供の名前を取得する関数
  const fetchChildName = async (childId: string) => {
    try {
      // まずlocalStorageから子供の名前を取得
      const savedChildName = localStorage.getItem('childName');
      if (savedChildName) {
        console.log('BaseLayout - localStorageから子供の名前を取得:', savedChildName);
        setChildName(savedChildName);
        return;
      }
      
      console.log('BaseLayout - 子供IDから名前を取得:', childId);
      const { data: childProfile, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', childId)
        .eq('role', 'child')
        .maybeSingle();
        
      if (error) {
        console.error('BaseLayout - 子供プロフィール取得エラー:', error);
        return;
      }
        
      if (childProfile && childProfile.username) {
        console.log('BaseLayout - 子供プロフィールから名前を取得:', childProfile.username);
        setChildName(childProfile.username);
        localStorage.setItem('childName', childProfile.username);
        return;
      }
    } catch (error) {
      console.error('BaseLayout - 子供名前取得エラー:', error);
    }
  };
  
  // 子供モードの場合、子供の名前を取得
  useEffect(() => {
    if (!isParentMode && selectedChildId) {
      fetchChildName(selectedChildId);
    }
  }, [isParentMode, selectedChildId]);
  
  // 表示する名前を決定
  const displayName = isParentMode ? username : childName || username;
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link 
              to={isParentMode ? "/parent/dashboard" : "/child/home"}
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <Logo width={150} height="auto" className="mr-1" />
            </Link>
            {displayName && (
              <div className="hidden sm:flex items-center gap-2 py-1 px-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-full">
                <span className="text-gray-600">ようこそ、</span>
                <span className="font-medium text-indigo-700">{displayName}</span>
                <span className="text-gray-600">さん</span>
              </div>
            )}
          </div>

          {/* デスクトップメニュー */}
          <div className="hidden md:flex items-center gap-3">
            {onModeChange && (
              <div className="relative">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center gap-2 py-2 px-4 rounded-full text-gray-600 hover:bg-gray-50 transition-colors border border-gray-200"
                >
                  <div className={`p-1 rounded-full ${isParentMode ? 'bg-indigo-100' : 'bg-amber-100'}`}>
                    <User className={`h-4 w-4 ${isParentMode ? 'text-indigo-600' : 'text-amber-600'}`} />
                  </div>
                  <span>{isParentMode ? '保護者モード' : '子供モード'}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                {isOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-100">
                    <button
                      onClick={() => {
                        onModeChange('parent');
                        setIsOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left flex items-center gap-2 ${isParentMode ? 'text-indigo-600 font-medium bg-indigo-50' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      <Shield className="h-4 w-4" />
                      保護者モード
                    </button>
                    <button
                      onClick={() => {
                        onModeChange('child');
                        setIsOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left flex items-center gap-2 ${!isParentMode ? 'text-amber-600 font-medium bg-amber-50' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      <User className="h-4 w-4" />
                      子供モード
                    </button>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={onLogout}
              className="flex items-center gap-2 py-2 px-4 rounded-full text-gray-600 hover:bg-gray-50 transition-colors border border-gray-200"
            >
              <LogOut className="h-4 w-4" />
              <span>ログアウト</span>
            </button>
          </div>

          {/* モバイルメニューボタン */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-full text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* モバイルメニュー */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-gray-100">
            {displayName && (
              <div className="flex items-center gap-2 py-2 px-3 mb-3">
                <span className="text-gray-600">ようこそ、</span>
                <span className="font-medium text-indigo-700">{displayName}</span>
                <span className="text-gray-600">さん</span>
              </div>
            )}
            {onModeChange && (
              <div className="space-y-1 mb-3">
                <button
                  onClick={() => {
                    onModeChange('parent');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left flex items-center gap-2 rounded-lg ${isParentMode ? 'text-indigo-600 font-medium bg-indigo-50' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <Shield className="h-4 w-4" />
                  保護者モード
                </button>
                <button
                  onClick={() => {
                    onModeChange('child');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left flex items-center gap-2 rounded-lg ${!isParentMode ? 'text-amber-600 font-medium bg-amber-50' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <User className="h-4 w-4" />
                  子供モード
                </button>
              </div>
            )}
            <button
              onClick={() => {
                onLogout();
                setIsMobileMenuOpen(false);
              }}
              className="w-full px-4 py-2 text-left flex items-center gap-2 text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              <LogOut className="h-4 w-4" />
              <span>ログアウト</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export const BaseLayout: React.FC<BaseLayoutProps> = ({ children, hideHeader }) => {
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();
  const location = useLocation();
  
  // デバッグ用にパスをより詳細に表示
  console.log('BaseLayout - 詳細パス情報:', {
    pathname: location.pathname,
    search: location.search,
    hash: location.hash,
    key: location.key
  });
  
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
    if (mode === 'parent') {
      navigate('/parent/dashboard');
      toast.success('保護者モードに切り替えました');
    } else {
      // 子供モードに切り替える場合、子供選択画面に遷移
      navigate('/select-child');
      toast.success('子供選択画面に移動しました');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-transparent">
      <div className="flex flex-col min-h-screen">
        {!hideHeader && (
          <Header 
            username={profile?.username} 
            onModeChange={handleModeChange} 
            onLogout={handleLogout} 
          />
        )}
        <main className="flex-1 relative z-0">
          {children}
        </main>
        {/* 常にAiDoctorを表示 */}
        <AiDoctorProvider>
          <AiDoctor />
        </AiDoctorProvider>
      </div>
    </div>
  );
}; 