import React, { useState, useEffect, memo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Calendar, Award, Heart, Star, Download, Music, Bookmark, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useFeedback } from '@/hooks/useFeedback';
import { LoadingSpinner } from '@/components/Common/LoadingSpinner';
import { ErrorMessage } from '@/components/Common/ErrorMessage';
import { FeedbackList } from '@/components/Feedback/FeedbackList';
import { Work } from '@/types/database';
import toast from 'react-hot-toast';
import './ParentWorks.css'; // アニメーション用のCSSをインポート

const BackButton = memo(({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 text-gray-700 bg-white px-4 py-2 rounded-md border border-gray-200 shadow-sm hover:bg-gray-50 transition-all duration-300"
  >
    <ArrowLeft className="h-5 w-5" />
    <span className="font-medium">もどる</span>
  </button>
));

BackButton.displayName = 'BackButton';

const WorkContent = memo(({ work, onAddFeedback }: { 
  work: Work, 
  onAddFeedback: () => void
}) => {
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
              className="max-w-full h-auto rounded-md shadow-sm transition-transform duration-300 group-hover:scale-[1.01]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md"></div>
          </div>
        );
      case 'audio':
        return (
          <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-md shadow-sm border border-blue-100">
            <div className="flex flex-col items-center mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-4 shadow-sm">
                <Music className="h-10 w-10 text-indigo-600" />
              </div>
              <div className="flex space-x-1 mb-4">
                {[3, 5, 7, 4, 6, 8, 5, 4, 3].map((h, i) => (
                  <div 
                    key={i} 
                    className="w-1.5 bg-indigo-500/60 rounded-full animate-pulse" 
                    style={{ 
                      height: `${h * 4}px`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  ></div>
                ))}
              </div>
            </div>
            <audio controls className="w-full rounded-md">
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
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            {work.title}
          </h1>
          <div className="flex items-center gap-2 text-gray-500 mt-2">
            <Calendar className="h-4 w-4" />
            <p className="text-sm">
              {new Date(work.created_at).toLocaleDateString('ja-JP')}
            </p>
          </div>
        </div>

        {renderContent()}
        
        <div className="flex justify-end items-center mt-6 gap-3">
          <button 
            onClick={onAddFeedback}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-md hover:from-indigo-700 hover:to-blue-700 transition-colors shadow-sm"
          >
            <MessageCircle className="h-5 w-5" />
            <span>フィードバックを追加</span>
          </button>
          
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-md hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm"
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
  const { feedbacks: feedbacksData, loading, error, fetchFeedbacks } = useFeedback(workId);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const { user, profile } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);
  const [likesLoading, setLikesLoading] = useState<Record<string, boolean>>({});
  
  // useFeedbackから取得したデータをローカルの状態に反映
  useEffect(() => {
    if (feedbacksData) {
      setFeedbacks(feedbacksData);
    }
  }, [feedbacksData]);
  
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

  // いいねを追加/削除する関数
  const handleLikeToggle = async (feedbackId: string) => {
    if (!supabase) return;
    
    try {
      // 現在のいいね状態を取得
      const currentFeedback = feedbacks.find(f => f.id === feedbackId);
      if (!currentFeedback) return;
      
      // いいね処理中のフィードバックを記録
      setLikesLoading(prev => ({ ...prev, [feedbackId]: true }));
      
      // フィードバックにisLikeLoadingプロパティを追加
      const updatedFeedbacksWithLoading = feedbacks.map(item => 
        item.id === feedbackId 
          ? { ...item, isLikeLoading: true }
          : item
      );
      setFeedbacks(updatedFeedbacksWithLoading);
      
      if (!user) {
        toast.error('ログインが必要です');
        return;
      }
      
      if (currentFeedback.liked_by_me) {
        // いいねを削除
        const { error } = await supabase
          .from('feedback_likes')
          .delete()
          .eq('feedback_id', feedbackId)
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        // フィードバックリストを更新（再取得せずに状態を更新）
        const updatedFeedbacks = feedbacks.map(item => 
          item.id === feedbackId 
            ? { ...item, likes: Math.max(0, (item.likes || 0) - 1), liked_by_me: false, isLikeLoading: false }
            : item
        );
        
        // 状態を直接更新
        setFeedbacks(updatedFeedbacks);
      } else {
        // いいねを追加
        const { error } = await supabase
          .from('feedback_likes')
          .insert([{
            feedback_id: feedbackId,
            user_id: user.id
          }]);
          
        if (error) throw error;
        
        // フィードバックリストを更新（再取得せずに状態を更新）
        const updatedFeedbacks = feedbacks.map(item => 
          item.id === feedbackId 
            ? { ...item, likes: (item.likes || 0) + 1, liked_by_me: true, isLikeLoading: false }
            : item
        );
        
        // 状態を直接更新
        setFeedbacks(updatedFeedbacks);
        
        // いいねアニメーションのためのDOM要素を取得
        setTimeout(() => {
          // ボタンのIDを使用して要素を取得（より確実）
          const likeButton = document.getElementById(`like-button-${feedbackId}`);
          const heartElement = likeButton?.querySelector('.heart-icon');
          
          console.log('いいねボタン要素:', likeButton);
          console.log('ハートアイコン要素:', heartElement);
          
          if (heartElement) {
            // 一度クラスを削除してから追加することでアニメーションをリセット
            heartElement.classList.remove('animate-heartBeat');
            
            // 強制的にリフロー（再描画）を発生させる
            void heartElement.offsetWidth;
            
            // アニメーションクラスを追加
            heartElement.classList.add('animate-heartBeat');
            
            // アニメーション終了後にクラスを削除
            setTimeout(() => {
              heartElement.classList.remove('animate-heartBeat');
            }, 1000);
            
            console.log('ハートビートアニメーション適用完了');
          } else {
            console.warn('ハートアイコン要素が見つかりませんでした');
          }
        }, 100); // DOM更新を待つために少し遅延させる
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('いいねの処理に失敗しました');
      
      // エラー時にローディング状態を解除
      const resetLoadingFeedbacks = feedbacks.map(item => 
        item.id === feedbackId 
          ? { ...item, isLikeLoading: false }
          : item
      );
      setFeedbacks(resetLoadingFeedbacks);
    } finally {
      // いいね処理中のフィードバックを解除
      setLikesLoading(prev => ({ ...prev, [feedbackId]: false }));
    }
  };

  // フィードバックの状態に応じたメッセージ
  const renderFeedbackPrompt = () => {
    if (feedbacks.length === 0 && !loading) {
      return (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-100 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-full">
              <MessageCircle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-medium text-amber-800">フィードバックしませんか？</h3>
              <p className="text-sm text-amber-700 mt-1">
                お子様の成長を促すために、作品へのフィードバックをしましょう。
                ポジティブな言葉で、お子様の努力や創造性を具体的に褒めることが大切です。
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // ヘッダーのスタイルをフィードバック状態に応じて変更
  const headerStyle = feedbacks.length > 0 
    ? "flex items-center justify-between bg-green-50 px-4 py-3 rounded-t-lg border border-green-100"
    : "flex items-center justify-between bg-amber-50 px-4 py-3 rounded-t-lg border border-amber-100";

  const headerIconColor = feedbacks.length > 0 ? "text-green-500" : "text-amber-500";
  const headerTextColor = feedbacks.length > 0 ? "text-green-800" : "text-amber-800";
  const headerCountBg = feedbacks.length > 0 ? "bg-green-200 text-green-800" : "bg-amber-200 text-amber-800";

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6 overflow-hidden">
      <div 
        className={headerStyle}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2 cursor-pointer">
          <MessageCircle className={`h-5 w-5 ${headerIconColor}`} />
          <h3 className={`font-medium ${headerTextColor}`}>
            フィードバック
          </h3>
          <span className={`text-xs px-2 py-0.5 rounded-full ${headerCountBg}`}>
            {feedbacks.length}件
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleRefresh}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            {loading && (
              <div className="animate-spin h-5 w-5 border-2 border-t-transparent border-blue-500 rounded-full"></div>
            )}
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div>
          {renderFeedbackPrompt()}
          <FeedbackList 
            feedbacks={feedbacks} 
            loading={loading} 
            onLike={handleLikeToggle} 
          />
        </div>
      )}
    </div>
  );
});

FeedbackSection.displayName = 'FeedbackSection';

// フィードバック入力フォーム
const FeedbackForm = memo(({ workId, onSubmit, onCancel }: { 
  workId: string, 
  onSubmit: (feedback: string) => void,
  onCancel: () => void
}) => {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    
    setIsSubmitting(true);
    await onSubmit(feedback);
    setFeedback('');
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6">
      <h3 className="font-medium text-gray-800 text-lg mb-4">フィードバックを追加</h3>
      
      <form onSubmit={handleSubmit}>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="お子様の作品へのフィードバックを入力してください..."
          className="w-full p-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          rows={4}
          required
        />
        
        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 bg-white rounded-md hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm"
            disabled={isSubmitting}
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-white bg-gradient-to-r from-indigo-600 to-blue-600 rounded-md hover:from-indigo-700 hover:to-blue-700 transition-colors flex items-center gap-2 shadow-sm"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                <span>送信中...</span>
              </>
            ) : (
              <>
                <MessageCircle className="h-5 w-5" />
                <span>送信する</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
});

FeedbackForm.displayName = 'FeedbackForm';

export function ParentWorkDetail() {
  const { workId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [work, setWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

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

      if (profile?.role === 'parent') {
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

  const handleAddFeedback = useCallback(() => {
    setShowFeedbackForm(true);
  }, []);

  const handleCancelFeedback = useCallback(() => {
    setShowFeedbackForm(false);
  }, []);

  const handleSubmitFeedback = useCallback(async (feedbackText: string) => {
    if (!workId || !user) return;

    try {
      console.log('フィードバック送信開始:', { workId, userId: user.id, feedback: feedbackText });
      
      const { data, error } = await supabase
        .from('work_feedback')
        .insert({
          work_id: workId,
          user_id: user.id,
          feedback: feedbackText,
          created_at: new Date().toISOString()
        })
        .select();

      if (error) {
        console.error('フィードバック送信エラー:', error);
        throw error;
      }
      
      console.log('フィードバック送信成功:', data);
      toast.success('フィードバックを送信しました！');
      setShowFeedbackForm(false);
      
      // フィードバックリストを更新するために少し待ってからページをリロード
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error('フィードバック送信エラー:', err);
      toast.error('フィードバックの送信に失敗しました');
    }
  }, [workId, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200 w-full max-w-md">
          <LoadingSpinner size="lg" message="作品を読み込んでいます..." />
        </div>
      </div>
    );
  }

  if (error || !work) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200 w-full max-w-md">
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-4">
          <BackButton onClick={handleBack} />
        </div>
        <WorkContent 
          work={work} 
          onAddFeedback={handleAddFeedback}
        />
        
        <div className="mt-4">
          <FeedbackSection workId={work.id} />
        </div>
        
        {showFeedbackForm && (
          <div className="mt-4">
            <FeedbackForm 
              workId={work.id} 
              onSubmit={handleSubmitFeedback}
              onCancel={handleCancelFeedback}
            />
          </div>
        )}
        
        <div className="h-16"></div> {/* 下部のスペース */}
      </div>
    </div>
  );
} 