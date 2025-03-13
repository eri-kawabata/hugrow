import React, { memo } from 'react';
import { MessageCircle, User } from 'lucide-react';
import type { Feedback } from '@/types/feedback';

interface FeedbackListProps {
  feedbacks: Feedback[];
  loading: boolean;
}

export const FeedbackList = memo(({ feedbacks, loading }: FeedbackListProps) => {
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
        <p className="text-sm">保護者からのフィードバックがここに表示されます</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {feedbacks.map((feedback) => (
        <FeedbackItem key={feedback.id} feedback={feedback} />
      ))}
    </div>
  );
});

FeedbackList.displayName = 'FeedbackList';

interface FeedbackItemProps {
  feedback: Feedback;
}

const FeedbackItem = memo(({ feedback }: FeedbackItemProps) => {
  // スタンプ情報を抽出（[スタンプ名] 形式）
  const stampMatch = feedback.feedback.match(/^\[(.*?)\]\s*/);
  const hasStamp = !!stampMatch;
  const stampName = hasStamp ? stampMatch[1] : '';
  const feedbackText = hasStamp 
    ? feedback.feedback.replace(/^\[(.*?)\]\s*/, '')
    : feedback.feedback;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {feedback.user_profile?.avatar_url ? (
            <img
              src={feedback.user_profile.avatar_url}
              alt={feedback.user_profile.display_name || '保護者'}
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
              {feedback.user_profile?.display_name || '保護者'}
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
          
          <p className="text-gray-700 whitespace-pre-wrap break-words">
            {feedbackText}
          </p>
        </div>
      </div>
    </div>
  );
});

FeedbackItem.displayName = 'FeedbackItem'; 