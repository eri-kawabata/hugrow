import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Feedback } from '../types/feedback';

export function useFeedback(workId?: string) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFeedbacks = useCallback(async () => {
    if (!workId) {
      setFeedbacks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('フィードバック取得開始:', workId);
      
      // まず基本的なフィードバックデータを取得
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('work_feedback')
        .select('*')
        .eq('work_id', workId)
        .order('created_at', { ascending: false });

      if (feedbackError) {
        console.error('フィードバック取得エラー:', feedbackError);
        throw feedbackError;
      }

      console.log('取得したフィードバックデータ:', feedbackData);

      if (!feedbackData || feedbackData.length === 0) {
        console.log('フィードバックデータなし');
        setFeedbacks([]);
        setLoading(false);
        return;
      }

      // ユーザーIDのリストを作成
      const userIds = feedbackData.map(feedback => feedback.user_id);
      console.log('ユーザーID一覧:', userIds);
      
      // プロフィール情報を別途取得
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', userIds);
        
      if (profilesError) {
        console.error('プロフィール取得エラー:', profilesError);
        // プロフィール取得エラーは致命的ではないので続行
      }

      console.log('取得したプロフィールデータ:', profilesData);
      
      // フィードバックデータにプロフィール情報をマージ
      const enrichedFeedbacks = feedbackData.map(feedback => {
        const profile = profilesData?.find(p => p.user_id === feedback.user_id);
        console.log(`ユーザー ${feedback.user_id} のプロフィール:`, profile);
        
        // ユーザー名を生成（優先順位: フルネーム > 表示名 > メールアドレス > デフォルト）
        let username = '保護者';
        let userEmail = undefined;
        
        if (profile?.full_name) {
          username = profile.full_name;
        } else if (profile?.display_name) {
          username = profile.display_name;
        } else if (profile?.email) {
          userEmail = profile.email;
          username = profile.email.split('@')[0];
        }
        
        return {
          ...feedback,
          username,
          user_email: userEmail || profile?.email,
          user_profile: profile ? {
            display_name: profile.display_name || username,
            avatar_url: profile.avatar_url,
            full_name: profile.full_name,
            role: profile.role
          } : undefined
        };
      });
      
      console.log('加工後のフィードバックデータ:', enrichedFeedbacks);
      setFeedbacks(enrichedFeedbacks);
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [workId]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  return { feedbacks, loading, error, fetchFeedbacks };
} 