import React, { memo, useState } from 'react';
import { MessageCircle, User, Heart, Star, Award } from 'lucide-react';
import type { Feedback } from '@/types/feedback';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

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
      <div className="p-6 text-center text-gray-500">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full mb-3"></div>
          <div className="h-5 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full w-3/4 mb-3"></div>
          <div className="h-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full w-1/2"></div>
        </div>
      </div>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <div className="p-8 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100/50 shadow-inner"
        >
          <motion.div
            animate={{ 
              y: [0, -8, 0],
              rotate: [0, -5, 5, 0]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 5,
              ease: "easeInOut"
            }}
            className="mb-4 mx-auto w-fit"
          >
            <MessageCircle className="h-16 w-16 mx-auto text-indigo-300 stroke-[1.5]" />
          </motion.div>
          <p className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">まだメッセージはありません</p>
          <p className="text-sm text-indigo-600/70">{parentName}さんからのメッセージがここに表示されます</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-5">
      {feedbacks.map((feedback, index) => (
        <motion.div
          key={feedback.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.4 }}
        >
          <FeedbackItem feedback={feedback} onLike={onLike} />
        </motion.div>
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
  
  // スタンプアニメーション用のステート
  const [showStampAnimation, setShowStampAnimation] = useState(false);
  
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

  // スタンプのアイコンを取得する関数
  const getStampIcon = () => {
    const stampLower = stampName.toLowerCase();
    if (stampLower.includes('ハート') || stampLower.includes('heart')) {
      return <Heart className="h-6 w-6 text-pink-500 fill-pink-500" />;
    } else if (stampLower.includes('スター') || stampLower.includes('star')) {
      return <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />;
    } else {
      return <Award className="h-6 w-6 text-indigo-500" />;
    }
  };
  
  // スタンプの種類を取得
  const getStampType = () => {
    const stampLower = stampName.toLowerCase();
    if (stampLower.includes('ハート') || stampLower.includes('heart')) {
      return 'heart';
    } else if (stampLower.includes('スター') || stampLower.includes('star')) {
      return 'star';
    } else {
      return 'award';
    }
  };
  
  // スタンプアニメーションのクリックハンドラー
  const handleStampClick = () => {
    setShowStampAnimation(true);
    // 3秒後にアニメーションを非表示
    setTimeout(() => setShowStampAnimation(false), 3000);
  };

  return (
    <div className="bg-gradient-to-r from-white to-indigo-50/30 rounded-2xl shadow-md border border-indigo-100/30 p-5 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start gap-4">
        <motion.div 
          className="flex-shrink-0"
          whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
          transition={{ rotate: { repeat: 1, duration: 0.5 } }}
        >
          {feedback.user_profile?.avatar_url ? (
            <div className="h-12 w-12 rounded-full ring-2 ring-indigo-200 ring-offset-2 overflow-hidden">
              <img
                src={feedback.user_profile.avatar_url}
                alt={getUserName()}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-200 to-purple-200 flex items-center justify-center ring-2 ring-indigo-100 ring-offset-2">
              <User className="h-6 w-6 text-indigo-500" />
            </div>
          )}
        </motion.div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-lg text-indigo-700">
              {getUserName()}
            </h4>
            <div className="px-3 py-1 bg-indigo-100/70 text-indigo-600 rounded-full text-xs font-medium shadow-sm">
              {new Date(feedback.created_at).toLocaleDateString('ja-JP')}
            </div>
          </div>
          
          {hasStamp && (
            <motion.div 
              className="mb-3 relative"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <motion.div 
                whileHover={{ 
                  scale: [1, 3, 2.5], 
                  rotate: [-5, 15, -15, 20, -20, 15, -5, 0],
                  y: [0, -20, -10, -25, -15, -5, 0]
                }}
                whileTap={{ scale: 0.8, rotate: 0 }}
                transition={{ 
                  rotate: { duration: 2, ease: "easeInOut" },
                  scale: { duration: 1 }
                }}
                className="inline-flex items-center justify-center bg-gradient-to-r from-yellow-100 to-orange-100 w-14 h-14 rounded-full shadow-md border-2 border-white cursor-pointer z-10"
                onClick={handleStampClick}
              >
                {getStampIcon()}
              </motion.div>
              
              {/* スタンプアニメーション */}
              <AnimatePresence>
                {showStampAnimation && getStampType() === 'star' && (
                  <>
                    {[...Array(40)].map((_, i) => (
                      <motion.div
                        key={`star-animation-${i}`}
                        className="absolute z-20 pointer-events-none"
                        initial={{ 
                          scale: 0.5,
                          x: 0,
                          y: 0
                        }}
                        animate={{ 
                          scale: Math.random() * 2 + 0.8,
                          x: (Math.random() - 0.5) * 800,
                          y: (Math.random() - 0.5) * 800,
                          rotate: Math.random() * 720 - 360,
                          opacity: [1, 0.8, 0]
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ 
                          duration: 3 + Math.random() * 2,
                          ease: [0.16, 0.87, 0.73, 0.97]
                        }}
                      >
                        {Math.random() > 0.6 ? (
                          <Star className={`h-${Math.floor(Math.random() * 4) + 5} w-${Math.floor(Math.random() * 4) + 5} text-yellow-${Math.floor(Math.random() * 3) + 4}00 fill-yellow-${Math.floor(Math.random() * 3) + 4}00`} />
                        ) : (
                          <div className={`text-${Math.floor(Math.random() * 2) + 3}xl`}>
                            {['⭐', '✨', '🌟', '⚡', '💫', '✦'][Math.floor(Math.random() * 6)]}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </>
                )}
                
                {showStampAnimation && getStampType() === 'heart' && (
                  <>
                    {[...Array(40)].map((_, i) => (
                      <motion.div
                        key={`heart-animation-${i}`}
                        className="absolute z-20 pointer-events-none"
                        initial={{ 
                          scale: 0.5,
                          x: 0,
                          y: 0
                        }}
                        animate={{ 
                          scale: Math.random() * 2 + 0.8,
                          x: (Math.random() - 0.5) * 800,
                          y: (Math.random() - 0.5) * 800,
                          rotate: Math.random() * 720 - 360,
                          opacity: [1, 0.8, 0]
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ 
                          duration: 3 + Math.random() * 2,
                          ease: [0.16, 0.87, 0.73, 0.97]
                        }}
                      >
                        {Math.random() > 0.6 ? (
                          <Heart className={`h-${Math.floor(Math.random() * 4) + 5} w-${Math.floor(Math.random() * 4) + 5} text-pink-${Math.floor(Math.random() * 3) + 4}00 fill-pink-${Math.floor(Math.random() * 3) + 4}00`} />
                        ) : (
                          <div className={`text-${Math.floor(Math.random() * 2) + 3}xl`}>
                            {['❤️', '💕', '💖', '💗', '💓', '💘'][Math.floor(Math.random() * 6)]}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </>
                )}
                
                {showStampAnimation && getStampType() === 'award' && (
                  <>
                    {[...Array(40)].map((_, i) => (
                      <motion.div
                        key={`award-animation-${i}`}
                        className="absolute z-20 pointer-events-none"
                        initial={{ 
                          scale: 0.5,
                          x: 0,
                          y: 0
                        }}
                        animate={{ 
                          scale: Math.random() * 2 + 0.8,
                          x: (Math.random() - 0.5) * 800,
                          y: (Math.random() - 0.5) * 800,
                          rotate: Math.random() * 720 - 360,
                          opacity: [1, 0.8, 0]
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ 
                          duration: 3 + Math.random() * 2,
                          ease: [0.16, 0.87, 0.73, 0.97]
                        }}
                      >
                        {Math.random() > 0.6 ? (
                          <Award className={`h-${Math.floor(Math.random() * 4) + 5} w-${Math.floor(Math.random() * 4) + 5} text-indigo-${Math.floor(Math.random() * 3) + 4}00 fill-indigo-${Math.floor(Math.random() * 3) + 4}00`} />
                        ) : (
                          <div className={`text-${Math.floor(Math.random() * 2) + 3}xl`}>
                            {['🏆', '🥇', '🎖️', '👑', '✨', '🌟'][Math.floor(Math.random() * 6)]}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </>
                )}
              </AnimatePresence>
            </motion.div>
          )}
          
          <div className={`rounded-xl bg-white p-4 shadow-inner border border-indigo-50 ${hasRuby ? '' : 'text-indigo-900 text-lg font-medium whitespace-pre-wrap break-words'}`}>
            {hasRuby ? (
              <div className="text-indigo-900 text-lg font-medium whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{ __html: feedbackText }} />
            ) : (
              <p>
                {feedbackText}
              </p>
            )}
          </div>
          
          {onLike && (
            <div className="mt-3 flex justify-end">
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLikeClick();
                }}
                whileHover={{ 
                  scale: [1, 1.2, 1.1], 
                  rotate: [-5, 10, -10, 5, -5, 0],
                  y: [0, -5, -2, -7, -3, 0]
                }}
                whileTap={{ scale: 0.9, rotate: 0 }}
                transition={{ 
                  rotate: { duration: 1.2 },
                  scale: { duration: 0.5 }
                }}
                className={`flex items-center justify-center ${
                  feedback.liked_by_me 
                    ? 'bg-pink-100 text-pink-500 border-2 border-pink-200' 
                    : 'bg-gray-50 text-gray-400 hover:bg-pink-50 hover:text-pink-500 border-2 border-gray-100 hover:border-pink-100'
                } w-12 h-12 rounded-full shadow-md transition-all duration-300`}
                data-feedback-id={feedback.id}
                id={`like-button-${feedback.id}`}
              >
                <div className="relative">
                  <Heart
                    className={`heart-icon w-6 h-6 ${
                      feedback.liked_by_me ? 'text-pink-500 fill-pink-500' : ''
                    }`}
                  />
                  {feedback.isLikeLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-3 h-3 border-2 border-t-transparent border-pink-500 rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                {feedback.likes > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">{feedback.likes}</span>
                )}
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

FeedbackItem.displayName = 'FeedbackItem'; 