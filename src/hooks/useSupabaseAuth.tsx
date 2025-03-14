import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

// 認証コンテキストの型定義
type SupabaseAuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (password: string) => Promise<{ success: boolean; error?: string }>;
};

// コンテキストの作成
const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined);

// プロバイダーコンポーネント
export const SupabaseAuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // セッションの初期化と監視
  useEffect(() => {
    // 現在のセッションを取得
    const getInitialSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('セッション取得エラー:', error);
          return;
        }
        
        setSession(data.session);
        setUser(data.session?.user || null);
        setIsAuthenticated(!!data.session);
      } catch (error) {
        console.error('セッション初期化エラー:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user || null);
        setIsAuthenticated(!!session);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // サインイン
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('サインインエラー:', error);
        return { success: false, error: error.message };
      }

      setSession(data.session);
      setUser(data.user);
      setIsAuthenticated(true);
      toast.success('ログインしました');
      return { success: true };
    } catch (error: any) {
      console.error('サインインエラー:', error);
      return { success: false, error: error.message || 'ログインに失敗しました' };
    } finally {
      setLoading(false);
    }
  };

  // サインアップ
  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('サインアップエラー:', error);
        return { success: false, error: error.message };
      }

      if (data.user && !data.session) {
        toast.success('確認メールを送信しました。メールを確認してアカウントを有効化してください。');
      } else {
        setSession(data.session);
        setUser(data.user);
        setIsAuthenticated(!!data.session);
        toast.success('アカウントを作成しました');
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('サインアップエラー:', error);
      return { success: false, error: error.message || 'アカウント作成に失敗しました' };
    } finally {
      setLoading(false);
    }
  };

  // サインアウト
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('サインアウトエラー:', error);
        toast.error('ログアウトに失敗しました');
        return;
      }
      
      setSession(null);
      setUser(null);
      setIsAuthenticated(false);
      toast.success('ログアウトしました');
    } catch (error) {
      console.error('サインアウトエラー:', error);
      toast.error('ログアウトに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // パスワードリセット
  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (error) {
        console.error('パスワードリセットエラー:', error);
        return { success: false, error: error.message };
      }

      toast.success('パスワードリセットメールを送信しました');
      return { success: true };
    } catch (error: any) {
      console.error('パスワードリセットエラー:', error);
      return { success: false, error: error.message || 'パスワードリセットに失敗しました' };
    } finally {
      setLoading(false);
    }
  };

  // パスワード更新
  const updatePassword = async (password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        console.error('パスワード更新エラー:', error);
        return { success: false, error: error.message };
      }

      toast.success('パスワードを更新しました');
      return { success: true };
    } catch (error: any) {
      console.error('パスワード更新エラー:', error);
      return { success: false, error: error.message || 'パスワード更新に失敗しました' };
    } finally {
      setLoading(false);
    }
  };

  // コンテキスト値
  const value = {
    session,
    user,
    loading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};

// フックの作成
export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
}; 