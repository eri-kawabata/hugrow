import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useUnreadFeedbacks() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUnreadFeedbacks() {
      try {
        // 1. 現在選択されている子供のprofile_idを取得
        const profileId = localStorage.getItem('selectedChildId') || localStorage.getItem('selectedChildProfileId');
        console.log('対象の子供のprofile_id:', profileId);
        
        if (!profileId) {
          console.log('子供のprofile_idが見つかりません');
          setLoading(false);
          return;
        }

        // 2. 未読フィードバック数を取得
        // work_feedback と works を結合して、特定の子供の作品に対する未読フィードバックをカウント
        const { count, error } = await supabase
          .from('work_feedback')
          .select('id', { count: 'exact', head: true })
          .eq('is_read', false)
          .in('work_id', 
            supabase
              .from('works')
              .select('id')
              .eq('profile_id', profileId)
          );

        console.log('未読フィードバッククエリ結果:', { 
          対象子供ID: profileId,
          未読数: count,
          エラー: error 
        });

        if (error) {
          console.error('未読フィードバック数の取得エラー:', error);
          return;
        }

        if (count !== null) {
          console.log('未読フィードバック数を更新:', count);
          setUnreadCount(count);
        }
      } catch (error) {
        console.error('フィードバック取得処理エラー:', error);
      } finally {
        setLoading(false);
      }
    }

    // 初回実行
    fetchUnreadFeedbacks();

    // 3. リアルタイム更新の購読設定
    const profileId = localStorage.getItem('selectedChildId') || localStorage.getItem('selectedChildProfileId');
    if (profileId) {
      // work_feedbackテーブルの変更を監視
      const subscription = supabase
        .channel('work_feedback-changes')
        .on('postgres_changes', {
          event: '*',              // 全てのイベント（INSERT, UPDATE, DELETE）
          schema: 'public',        // publicスキーマ
          table: 'work_feedback',  // work_feedbackテーブル
        }, () => {
          console.log('フィードバックの変更を検知。未読数を再取得します。');
          fetchUnreadFeedbacks();  // 変更があれば未読数を再取得
        })
        .subscribe();

      // コンポーネントのクリーンアップ時に購読を解除
      return () => {
        subscription.unsubscribe();
      };
    }
  }, []); // 空の依存配列 - コンポーネントのマウント時のみ実行

  return { unreadCount, loading };
} 