import React, { useState, useEffect, memo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Calendar, Award, Heart, Star, Download, Music, Bookmark, Edit2, Check, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useFeedback } from '@/hooks/useFeedback';
import { LoadingSpinner } from '@/components/Common/LoadingSpinner';
import { ErrorMessage } from '@/components/Common/ErrorMessage';
import { FeedbackList } from '@/components/Feedback/FeedbackList';
import { useWorks } from '@/hooks/useWorks';
import { Work } from '@/types/database';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const BackButton = memo(({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 text-white bg-gradient-to-r from-[#8ec5d6] to-[#5d7799] px-4 py-2 rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105"
  >
    <ArrowLeft className="h-5 w-5" />
    <span className="font-medium">もどる</span>
  </button>
));

BackButton.displayName = 'BackButton';

const WorkContent = memo(({ work, onUpdate }: { work: Work, onUpdate: (updates: Partial<Work>) => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(work.title);
  const [editDescription, setEditDescription] = useState(work.description || '');
  const [favorite, setFavorite] = useState(false);
  
  // 編集モードの保存
  const handleSave = async () => {
    if (editTitle.trim() === '') {
      toast.error('タイトルを入力してください');
      return;
    }
    
    await onUpdate({
      title: editTitle.trim(),
      description: editDescription.trim() || null
    });
    setIsEditing(false);
  };
  
  // 編集モードのキャンセル
  const handleCancel = () => {
    setEditTitle(work.title);
    setEditDescription(work.description || '');
    setIsEditing(false);
  };
  
  // お気に入り状態を保存する関数
  const saveFavoriteStatus = useCallback(async (isFavorite: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      if (isFavorite) {
        // お気に入りに追加
        const { error } = await supabase
          .from('favorites')
          .upsert({
            user_id: user.id,
            work_id: work.id,
            created_at: new Date().toISOString()
          });
          
        if (error) throw error;
        toast.success('お気に入りに追加しました！');
      } else {
        // お気に入りから削除
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('work_id', work.id);
          
        if (error) throw error;
        toast.success('お気に入りから削除しました');
      }
    } catch (err) {
      console.error('お気に入り状態の保存に失敗しました:', err);
      toast.error('お気に入り状態の保存に失敗しました');
    }
  }, [work.id]);
  
  // お気に入り状態を切り替える
  const toggleFavorite = useCallback(() => {
    const newState = !favorite;
    setFavorite(newState);
    saveFavoriteStatus(newState);
  }, [favorite, saveFavoriteStatus]);
  
  // お気に入り状態を読み込む
  useEffect(() => {
    const loadFavoriteStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { data, error } = await supabase
          .from('favorites')
          .select('*')
          .eq('user_id', user.id)
          .eq('work_id', work.id)
          .single();
          
        if (error && error.code !== 'PGRST116') {
          // PGRST116 は「結果が見つからない」エラーなので無視
          console.error('お気に入り状態の読み込みに失敗しました:', error);
          return;
        }
        
        setFavorite(!!data);
      } catch (err) {
        console.error('お気に入り状態の読み込みに失敗しました:', err);
      }
    };
    
    loadFavoriteStatus();
  }, [work.id]);
  
  const handleDownload = useCallback(() => {
    if (work.type === 'drawing' || work.type === 'photo') {
      const link = document.createElement('a');
      link.href = work.content_url;
      link.download = `${work.title}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('ダウンロードしました！');
    } else if (work.type === 'audio') {
      const link = document.createElement('a');
      link.href = work.content_url;
      link.download = `${work.title}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('ダウンロードしました！');
    }
  }, [work]);

  const renderContent = useCallback(() => {
    switch (work.type) {
      case 'drawing':
      case 'photo':
        return (
          <div className="relative group">
            <img
              src={work.content_url}
              alt={work.title}
              className="max-w-full h-auto rounded-2xl shadow-md transition-transform duration-300 group-hover:scale-[1.01]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
          </div>
        );
      case 'audio':
        return (
          <div className="bg-gradient-to-r from-[#f5f6bf]/30 to-white p-6 rounded-2xl shadow-md">
            <div className="flex flex-col items-center mb-4">
              <div className="w-32 h-32 rounded-full bg-[#f5f6bf]/50 flex items-center justify-center mb-4">
                <Music className="h-16 w-16 text-[#5d7799]" />
              </div>
              <div className="flex space-x-1 mb-4">
                {[3, 5, 7, 4, 6, 8, 5, 4, 3].map((h, i) => (
                  <div 
                    key={i} 
                    className="w-1.5 bg-[#5d7799]/60 rounded-full animate-pulse" 
                    style={{ 
                      height: `${h * 4}px`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  ></div>
                ))}
              </div>
            </div>
            <audio controls className="w-full rounded-lg">
              <source src={work.content_url} type="audio/mpeg" />
              お使いのブラウザは音声の再生に対応していません。
            </audio>
          </div>
        );
      default:
        return null;
    }
  }, [work.type, work.content_url, work.title]);

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-[#8ec5d6] via-[#f7c5c2] to-[#f5f6bf] p-8 rounded-[32px] shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <div className="relative z-10">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2 text-2xl font-bold bg-white/90 rounded-xl border-2 border-white/50 focus:outline-none focus:border-white"
                  placeholder="タイトルを入力"
                />
              </div>
              <div>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-4 py-2 text-base bg-white/90 rounded-xl border-2 border-white/50 focus:outline-none focus:border-white resize-none"
                  placeholder="説明を入力（任意）"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 bg-white/90 text-gray-700 rounded-xl hover:bg-white/100 transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>キャンセル</span>
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-[#5d7799] text-white rounded-xl hover:bg-[#4c6380] transition-colors"
                >
                  <Check className="h-4 w-4" />
                  <span>保存</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="group relative">
              <motion.h1 
                className="text-3xl font-bold text-white text-center drop-shadow-md mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {work.title}
              </motion.h1>
              {work.description && (
                <motion.p 
                  className="text-white/90 text-center mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {work.description}
                </motion.p>
              )}
              <button
                onClick={() => setIsEditing(true)}
                className="absolute -right-2 -top-2 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white"
              >
                <Edit2 className="h-4 w-4 text-[#5d7799]" />
              </button>
            </div>
          )}
          <div className="flex items-center justify-center gap-2 text-white/90 mt-4">
            <Calendar className="h-4 w-4" />
            <p className="text-sm">
              {new Date(work.created_at).toLocaleDateString('ja-JP')}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[24px] shadow-lg p-6 border-2 border-[#5d7799]/10">
        {renderContent()}
        
        <div className="flex justify-between items-center mt-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleFavorite}
              className={`p-3 rounded-full transition-all duration-300 ${
                favorite 
                  ? 'bg-yellow-100 text-yellow-500 scale-110' 
                  : 'bg-gray-100 text-gray-400 hover:bg-yellow-50 hover:text-yellow-500'
              }`}
              aria-label="お気に入り"
              title={favorite ? 'お気に入りから削除' : 'お気に入りに追加'}
            >
              <Star className={`h-6 w-6 ${favorite ? 'fill-yellow-500' : ''}`} />
              {favorite && (
                <span className="absolute -top-1 -right-1 animate-pulse bg-yellow-500 w-2 h-2 rounded-full"></span>
              )}
            </button>
          </div>
          
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-[#5d7799] text-white rounded-full hover:bg-[#4c6380] transition-colors"
          >
            <Download className="h-5 w-5" />
            <span>ダウンロード</span>
          </button>
        </div>
      </div>
    </div>
  );
});

WorkContent.displayName = 'WorkContent';

const FeedbackSection = memo(({ workId }: { workId: string }) => {
  const { feedbacks, loading, error, fetchFeedbacks } = useFeedback(workId);
  const [isExpanded, setIsExpanded] = useState(true);
  
  // コンポーネントがマウントされたときにフィードバックを再取得
  useEffect(() => {
    console.log('FeedbackSection マウント - workId:', workId);
    fetchFeedbacks();
  }, [workId, fetchFeedbacks]);
  
  // フィードバックがあるときは自動的に展開
  useEffect(() => {
    console.log('フィードバック数:', feedbacks.length);
    if (feedbacks.length > 0) {
      setIsExpanded(true);
    }
  }, [feedbacks.length]);

  // 手動でフィードバックを再取得する関数
  const handleRefresh = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // 親要素のクリックイベントを停止
    console.log('フィードバック再取得');
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  return (
    <div className="mt-8 bg-white rounded-[24px] shadow-lg overflow-hidden border-2 border-[#5d7799]/10">
      <div 
        className={`p-5 ${feedbacks.length > 0 ? 'bg-gradient-to-r from-indigo-100 to-indigo-50' : 'bg-gradient-to-r from-[#8ec5d6]/20 to-[#f7c5c2]/20'} flex justify-between items-center cursor-pointer`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2.5 ${feedbacks.length > 0 ? 'bg-indigo-200 text-indigo-600' : 'bg-[#5d7799]/10 text-[#5d7799]'} rounded-full`}>
            <MessageCircle className="h-6 w-6" />
          </div>
          <h3 className={`font-bold ${feedbacks.length > 0 ? 'text-indigo-600' : 'text-[#5d7799]'} text-lg`}>
            フィードバック一覧
            {feedbacks.length > 0 && (
              <span className="ml-2 text-sm bg-indigo-600 text-white px-2.5 py-0.5 rounded-full">
                {feedbacks.length}
              </span>
            )}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            title="更新"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M8 16H3v5" />
            </svg>
          </button>
          <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${feedbacks.length > 0 ? 'text-indigo-600' : 'text-[#5d7799]'}`}>
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </div>
        </div>
      </div>
      
      <div className={`transition-all duration-500 overflow-hidden ${isExpanded ? 'max-h-[800px]' : 'max-h-0'}`}>
        {error ? (
          <div className="p-4 text-center text-red-500">
            <p>フィードバックの読み込みに失敗しました</p>
            <button 
              onClick={() => fetchFeedbacks()}
              className="mt-2 px-3 py-1 bg-red-100 text-red-600 rounded-md text-sm hover:bg-red-200 transition-colors"
            >
              再試行
            </button>
          </div>
        ) : (
          <FeedbackList feedbacks={feedbacks} loading={loading} />
        )}
      </div>
    </div>
  );
});

FeedbackSection.displayName = 'FeedbackSection';

export function WorkDetail() {
  const { workId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [work, setWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { updateWork } = useWorks();

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

  const handleUpdateWork = async (updates: Partial<Work>) => {
    if (!work || !updateWork) {
      console.error('作品の更新に必要な情報が不足しています');
      toast.error('作品の更新に失敗しました');
      return;
    }
    
    try {
      console.log('作品更新開始:', { workId: work.id, updates });
      const updatedWork = await updateWork(work.id, updates);
      
      if (!updatedWork) {
        throw new Error('作品の更新に失敗しました');
      }
      
      console.log('作品更新成功:', updatedWork);
      setWork(updatedWork);
      toast.success('作品を更新しました');
    } catch (err) {
      console.error('作品の更新に失敗しました:', err);
      toast.error('作品の更新に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fbfd]">
        <div className="bg-white p-8 rounded-[24px] shadow-lg border-2 border-[#5d7799]/10 w-full max-w-md">
          <LoadingSpinner size="lg" message="作品を読み込んでいます..." />
        </div>
      </div>
    );
  }

  if (error || !work) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fbfd] p-4">
        <div className="bg-white p-8 rounded-[24px] shadow-lg border-2 border-[#5d7799]/10 w-full max-w-md">
          <ErrorMessage
            title="作品が見つかりません"
            message="指定された作品は存在しないか、アクセス権限がありません。"
            onRetry={handleRetry}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fbfd] p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <BackButton onClick={handleBack} />
        </div>
        <WorkContent work={work} onUpdate={handleUpdateWork} />
        <FeedbackSection workId={work.id} />
        
        <div className="h-20"></div>
      </div>
    </div>
  );
} 