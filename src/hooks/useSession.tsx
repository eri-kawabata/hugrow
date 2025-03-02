import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

// 定数定義
const SESSION_TIMEOUT_WARNING = 5 * 60 * 1000; // 5分前に警告
const SESSION_CHECK_INTERVAL = 60 * 1000; // 1分ごとにチェック
const OFFLINE_CHECK_INTERVAL = 5000; // 5秒ごとにオフライン状態をチェック
const MAX_RETRY_COUNT = 3; // 最大リトライ回数

export function useSession() {
  // 状態管理
  const [session, setSession] = useState<Session | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);
  const [lastActiveAt, setLastActiveAt] = useState<Date>(new Date());

  // オンライン状態の監視
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('オンラインに復帰しました');
      refreshSession();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('オフラインになりました。一部の機能が制限されます');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // アクティビティの監視
  useEffect(() => {
    const updateLastActive = () => {
      setLastActiveAt(new Date());
    };

    // ユーザーのアクティビティを監視
    window.addEventListener('mousemove', updateLastActive);
    window.addEventListener('keydown', updateLastActive);
    window.addEventListener('touchstart', updateLastActive);
    window.addEventListener('scroll', updateLastActive);

    return () => {
      window.removeEventListener('mousemove', updateLastActive);
      window.removeEventListener('keydown', updateLastActive);
      window.removeEventListener('touchstart', updateLastActive);
      window.removeEventListener('scroll', updateLastActive);
    };
  }, []);

  // セッションの復元
  const restoreSession = useCallback(async () => {
    try {
      // ローカルストレージからセッション情報を取得
      const { data: { session: storedSession } } = await supabase.auth.getSession();
      
      if (storedSession) {
        // セッションが有効な場合
        const expiresAt = new Date(storedSession.expires_at! * 1000);
        if (expiresAt > new Date()) {
          setSession(storedSession);
          setExpiresAt(expiresAt);
          setShowWarning(false);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('セッション復元エラー:', error);
      return false;
    }
  }, []);

  // セッションの更新
  const refreshSession = useCallback(async () => {
    if (!isOnline) {
      console.warn('オフライン状態でセッション更新を試みました');
      return;
    }

    try {
      const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession();
      if (error) throw error;

      if (refreshedSession) {
        setSession(refreshedSession);
        setExpiresAt(new Date(refreshedSession.expires_at! * 1000));
        setShowWarning(false);
        setRetryCount(0); // リトライカウントをリセット
      }
    } catch (error) {
      console.error('セッション更新エラー:', error);
      
      // オフライン時やエラー時のリトライ処理
      if (retryCount < MAX_RETRY_COUNT) {
        const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 10000);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          refreshSession();
        }, backoffDelay);
      } else {
        toast.error('セッションの更新に失敗しました。再ログインが必要です。');
      }
    }
  }, [isOnline, retryCount]);

  // セッションの有効期限をチェック
  const checkSessionExpiration = useCallback(() => {
    if (!expiresAt || !session) return;

    const now = new Date();
    const timeUntilExpiry = expiresAt.getTime() - now.getTime();
    const inactiveTime = now.getTime() - lastActiveAt.getTime();

    // 30分以上の非アクティブ状態
    if (inactiveTime > 30 * 60 * 1000) {
      console.log('長時間の非アクティブを検出');
      return;
    }

    if (timeUntilExpiry <= SESSION_TIMEOUT_WARNING && !showWarning) {
      setShowWarning(true);
      toast.warning('セッションの有効期限が近づいています。自動的に更新されます。', {
        duration: 10000,
      });
    }

    // セッションの有効期限が切れる前に更新
    if (timeUntilExpiry <= SESSION_TIMEOUT_WARNING) {
      refreshSession();
    }
  }, [expiresAt, session, showWarning, refreshSession, lastActiveAt]);

  // 初期化時にセッションを設定
  useEffect(() => {
    restoreSession();

    // セッションの変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession(session);
        setExpiresAt(new Date(session.expires_at! * 1000));
        setShowWarning(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [restoreSession]);

  // 定期的なセッションチェック
  useEffect(() => {
    const sessionInterval = setInterval(checkSessionExpiration, SESSION_CHECK_INTERVAL);
    const offlineInterval = setInterval(() => {
      if (!isOnline && session) {
        console.log('オフライン状態でセッションをチェック中...');
      }
    }, OFFLINE_CHECK_INTERVAL);

    return () => {
      clearInterval(sessionInterval);
      clearInterval(offlineInterval);
    };
  }, [checkSessionExpiration, isOnline, session]);

  return {
    session,
    expiresAt,
    refreshSession,
    isOnline,
    restoreSession,
    lastActiveAt,
  };
} 