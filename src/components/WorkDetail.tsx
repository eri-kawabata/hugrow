import React, { useState, useEffect, memo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/Common/LoadingSpinner';
import { ErrorMessage } from '@/components/Common/ErrorMessage';
import toast from 'react-hot-toast';

type Work = {
  id: string;
  user_id: string;
  title: string;
  type: 'drawing' | 'audio' | 'photo';
  content_url: string;
  created_at: string;
  updated_at?: string;
};

const BackButton = memo(({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
  >
    <ArrowLeft className="h-5 w-5" />
    <span>戻る</span>
  </button>
));

BackButton.displayName = 'BackButton';

const WorkContent = memo(({ work }: { work: Work }) => {
  const renderContent = useCallback(() => {
    switch (work.type) {
      case 'drawing':
      case 'photo':
        return (
          <img
            src={work.content_url}
            alt={work.title}
            className="max-w-full h-auto rounded-lg"
            loading="lazy"
          />
        );
      case 'audio':
        return (
          <audio controls className="w-full">
            <source src={work.content_url} type="audio/mpeg" />
            お使いのブラウザは音声の再生に対応していません。
          </audio>
        );
      default:
        return null;
    }
  }, [work.type, work.content_url, work.title]);

  return (
    <div className="space-y-8">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900">{work.title}</h1>
        <p className="text-sm text-gray-500">
          作成日: {new Date(work.created_at).toLocaleDateString('ja-JP')}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        {renderContent()}
      </div>
    </div>
  );
});

WorkContent.displayName = 'WorkContent';

export function WorkDetail() {
  const { workId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [work, setWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchWork = useCallback(async () => {
    if (!workId || !user) return;

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('works')
        .select('*')
        .eq('id', workId)
        .single();

      if (profile?.role === 'child') {
        query = query.eq('user_id', user.id);
      } else if (profile?.role === 'parent') {
        const { data: children } = await supabase
          .from('parent_child_relations')
          .select('child_id')
          .eq('parent_id', user.id);

        const childIds = children?.map(relation => relation.child_id) || [];
        query = query.in('user_id', [user.id, ...childIds]);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      if (!data) throw new Error('作品が見つかりません');

      setWork(data);
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error('作品の読み込みに失敗しました');
      console.error('Error fetching work:', error);
    } finally {
      setLoading(false);
    }
  }, [workId, user, profile]);

  useEffect(() => {
    fetchWork();
  }, [fetchWork]);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleRetry = useCallback(() => {
    fetchWork();
  }, [fetchWork]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !work) {
    return (
      <ErrorMessage
        title="作品が見つかりません"
        message="指定された作品は存在しないか、アクセス権限がありません。"
        onRetry={handleRetry}
      />
    );
  }

  return (
    <div className="space-y-6">
      <BackButton onClick={handleBack} />
      <WorkContent work={work} />
    </div>
  );
} 