import { createContext, useContext, useEffect, useState, useCallback, startTransition } from 'react';
import { useNavigate, Outlet, Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useSession } from './useSession';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '@/components/Common/LoadingSpinner';

// 定数定義
const INITIALIZATION_TIMEOUT = 3000; // 3秒のタイムアウト
const SYNC_CHANNEL = 'auth_sync_channel';
const SYNC_EVENT = 'auth_sync_event';

// 認証が不要なパス
const PUBLIC_PATHS = [
  '/auth/login',
  '/auth/signup',
  '/auth/reset-password',
  '/auth/update-password'
];

type User = {
  id: string;
  email: string;
};

type Profile = {
  id: string;
  user_id: string;
  username: string;
  role: 'parent' | 'child';
  created_at?: string;
  updated_at?: string;
};

type AuthError = {
  message: string;
  code?: string;
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  sessionExpiresAt: Date | null;
};

type SyncMessage = {
  type: 'signIn' | 'signOut';
  timestamp: number;
  tabId: string;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// タブIDの生成
const generateTabId = () => {
  return Math.random().toString(36).substring(2, 15);
};

export function AuthProvider() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [initializationFailed, setInitializationFailed] = useState(false);
  const { session, expiresAt, refreshSession } = useSession();
  const [tabId] = useState(generateTabId());
  const [broadcastChannel, setBroadcastChannel] = useState<BroadcastChannel | null>(null);

  const handleError = useCallback((error: unknown) => {
    const authError = error as AuthError;
    let errorMessage = 'ログインに失敗しました';
    
    if (authError.code === 'auth/invalid-email') {
      errorMessage = 'メールアドレスの形式が正しくありません';
    } else if (authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password') {
      errorMessage = 'メールアドレスまたはパスワードが間違っています';
    }
    
    toast.error(errorMessage);
    console.error('認証エラー:', error);
  }, []);

  // 認証状態の更新
  const updateAuthState = useCallback((user: User | null, profile: Profile | null, isAuth: boolean) => {
    startTransition(() => {
      setUser(user);
      setProfile(profile);
      setIsAuthenticated(isAuth);
    });
  }, []);

  // プロフィールの取得
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('プロフィール取得エラー:', error);
        return null;
      }
      return profile;
    } catch (error) {
      console.error('プロフィール取得エラー:', error);
      return null;
    }
  }, []);

  // 他のタブへの通知
  const notifyTabs = useCallback((type: SyncMessage['type']) => {
    if (broadcastChannel) {
      const message: SyncMessage = {
        type,
        timestamp: Date.now(),
        tabId,
      };
      broadcastChannel.postMessage(message);
    }
  }, [broadcastChannel, tabId]);

  // サインイン
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) throw error;

      if (data.user) {
        const profile = await fetchProfile(data.user.id);
        if (profile) {
          updateAuthState(data.user, profile, true);
          notifyTabs('signIn');
          toast.success('ログインしました');
          navigate(profile.role === 'parent' ? '/parent/dashboard' : '/child/home', { replace: true });
        } else {
          throw new Error('プロフィールの取得に失敗しました');
        }
      }
    } catch (error) {
      handleError(error);
      updateAuthState(null, null, false);
    } finally {
      setLoading(false);
    }
  }, [navigate, fetchProfile, handleError, updateAuthState, notifyTabs]);

  // サインアウト
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      updateAuthState(null, null, false);
      notifyTabs('signOut');
      toast.success('ログアウトしました');
      navigate('/auth/login', { replace: true });
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [navigate, handleError, updateAuthState, notifyTabs]);

  // BroadcastChannelの初期化
  useEffect(() => {
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel(SYNC_CHANNEL);
      setBroadcastChannel(channel);

      const handleMessage = (event: MessageEvent<SyncMessage>) => {
        const message = event.data;
        if (message.tabId !== tabId) {
          if (message.type === 'signOut') {
            updateAuthState(null, null, false);
            navigate('/auth/login', { replace: true });
          } else if (message.type === 'signIn') {
            refreshSession();
          }
        }
      };

      channel.addEventListener('message', handleMessage);
      return () => {
        channel.removeEventListener('message', handleMessage);
        channel.close();
      };
    }
  }, [tabId, navigate, updateAuthState, refreshSession]);

  // 認証の初期化
  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        timeoutId = setTimeout(() => {
          if (mounted && initializing) {
            console.warn('認証の初期化がタイムアウトしました');
            if (mounted) {
              setInitializationFailed(true);
              setInitializing(false);
              updateAuthState(null, null, false);
            }
          }
        }, INITIALIZATION_TIMEOUT);

        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          if (profile && mounted) {
            updateAuthState(session.user, profile, true);
          } else {
            updateAuthState(null, null, false);
          }
        } else if (mounted) {
          updateAuthState(null, null, false);
        }
      } catch (error) {
        console.error('認証の初期化エラー:', error);
        if (mounted) {
          setInitializationFailed(true);
          updateAuthState(null, null, false);
        }
      } finally {
        clearTimeout(timeoutId);
        if (mounted) {
          setInitializing(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [session, fetchProfile, updateAuthState]);

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (initializationFailed) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">認証の初期化に失敗しました</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    signOut,
    isAuthenticated,
    sessionExpiresAt: expiresAt,
  };

  // 現在のパスが認証不要なパスかどうかをチェック
  const isPublicPath = PUBLIC_PATHS.includes(location.pathname);

  // 認証が必要なパスで未認証の場合はログインページへリダイレクト
  if (!isAuthenticated && !isPublicPath) {
    return <Navigate to="/auth/login" replace />;
  }

  // 認証済みで認証ページにアクセスした場合は適切なダッシュボードへリダイレクト
  if (isAuthenticated && isPublicPath) {
    const redirectPath = profile?.role === 'parent' ? '/parent/dashboard' : '/child/home';
    return <Navigate to={redirectPath} replace />;
  }

  return (
    <AuthContext.Provider value={value}>
      <Outlet />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthは AuthProvider 内で使用する必要があります');
  }
  return context;
} 