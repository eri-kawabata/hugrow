import React, { memo } from 'react';
import { MessageCircle, User, Heart } from 'lucide-react';
import type { Feedback } from '@/types/feedback';
import { useAuth } from '@/hooks/useAuth';

interface FeedbackListProps {
  feedbacks: Feedback[];
  loading: boolean;
  onLike?: (feedbackId: string) => void;
}

export const FeedbackList = memo(({ feedbacks, loading, onLike }: FeedbackListProps) => {
  const { profile } = useAuth();
  const parentName = profile?.username || profile?.display_name || 'えり';

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-10 w-10 bg-gray-200 rounded-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p className="text-lg font-medium">まだフィードバックはありません</p>
        <p className="text-sm">{parentName}さんからのフィードバックがここに表示されます</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {feedbacks.map((feedback) => (
        <FeedbackItem key={feedback.id} feedback={feedback} onLike={onLike} />
      ))}
    </div>
  );
});

FeedbackList.displayName = 'FeedbackList';

interface FeedbackItemProps {
  feedback: Feedback;
  onLike?: (feedbackId: string) => void;
}

const FeedbackItem = memo(({ feedback, onLike }: FeedbackItemProps) => {
  // スタンプ情報を抽出（[スタンプ名] 形式）
  const stampMatch = feedback.feedback.match(/^\[(.*?)\]\s*/);
  const hasStamp = !!stampMatch;
  const stampName = hasStamp ? stampMatch[1] : '';
  const feedbackText = hasStamp 
    ? feedback.feedback.replace(/^\[(.*?)\]\s*/, '')
    : feedback.feedback;

  // ふりがなの抽出（<ruby>漢字<rt>ふりがな</rt></ruby>の形式）
  const hasRuby = feedbackText.includes('<ruby>');
  
  // ユーザー名を取得する関数
  const getUserName = () => {
    // プロフィールのusernameフィールドがあればそれを優先的に使用
    if (feedback.user_profile?.username) {
      return feedback.user_profile.username;
    }
    
    // ユーザープロフィールのフルネームがあればそれを使用
    if (feedback.user_profile?.full_name) {
      return feedback.user_profile.full_name;
    }
    
    // 表示名があればそれを使用
    if (feedback.user_profile?.display_name) {
      return feedback.user_profile.display_name;
    }
    
    // usernameプロパティがあればそれを使用
    if (feedback.username && feedback.username !== '保護者') {
      return feedback.username;
    }
    
    // どれもない場合は「保護者」と表示
    return '保護者';
  };

  // いいねボタンのクリックハンドラー
  const handleLikeClick = () => {
    if (onLike) {
      onLike(feedback.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {feedback.user_profile?.avatar_url ? (
            <img
              src={feedback.user_profile.avatar_url}
              alt={getUserName()}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <User className="h-5 w-5 text-indigo-500" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium text-gray-900">
              {getUserName()}
            </h4>
            <span className="text-xs text-gray-500">
              {new Date(feedback.created_at).toLocaleDateString('ja-JP')}
            </span>
          </div>
          
          {hasStamp && (
            <div className="mb-2">
              <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                {stampName}
              </span>
            </div>
          )}
          
          {hasRuby ? (
            <div className="text-gray-700 whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{ __html: feedbackText }} />
          ) : (
            <p className="text-gray-700 whitespace-pre-wrap break-words">
              {feedbackText}
            </p>
          )}
          
          {onLike && (
            <div className="mt-3 flex justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLikeClick();
                }}
                className={`flex items-center gap-1 text-gray-500 hover:text-pink-500 transition-colors`}
                data-feedback-id={feedback.id}
                id={`like-button-${feedback.id}`}
              >
                <div className="relative">
                  <Heart
                    className={`heart-icon w-5 h-5 ${
                      feedback.liked_by_me ? 'text-pink-500 fill-pink-500' : 'text-gray-400'
                    }`}
                  />
                  {feedback.isLikeLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-3 h-3 border-2 border-t-transparent border-pink-500 rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <span>{feedback.likes || 0}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

FeedbackItem.displayName = 'FeedbackItem'; 