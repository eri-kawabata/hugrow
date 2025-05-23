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
import { TrashIcon } from '@heroicons/react/24/outline';

const BackButton = memo(({ onClick }: { onClick: () => void }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.05, y: -2 }}
    whileTap={{ scale: 0.95 }}
    className="flex items-center gap-2 text-white bg-gradient-to-r from-[#8ec5d6] to-[#5d7799] px-4 py-2 rounded-full shadow-md transition-all duration-300"
  >
    <ArrowLeft className="h-5 w-5" />
    <span className="font-medium">もどる</span>
    <motion.span 
      animate={{ x: [-3, 0, -3] }}
      transition={{ repeat: Infinity, duration: 1.5 }}
      className="absolute left-3 opacity-70"
    >
      <ArrowLeft className="h-4 w-4" />
    </motion.span>
  </motion.button>
));

BackButton.displayName = 'BackButton';

const WorkContent = memo(({ work, onUpdate, onDelete }: { work: Work, onUpdate: (updates: Partial<Work>) => void, onDelete: () => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(work.title);
  const [editDescription, setEditDescription] = useState(work.description || '');
  const [favorite, setFavorite] = useState(false);
  const [showStarAnimation, setShowStarAnimation] = useState(false);
  
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
    
    // お気に入りに追加された場合、星のアニメーションを表示
    if (newState) {
      setShowStarAnimation(true);
      // 3秒後にアニメーションを非表示
      setTimeout(() => {
        setShowStarAnimation(false);
      }, 3000);
    }
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
      <div className="bg-gradient-to-r from-[#FFF9C4] via-[#FFCCBC] to-[#BBDEFB] p-8 rounded-[32px] shadow-lg relative overflow-hidden">
        {/* メインの背景グラデーション効果 - より鮮やかで魅力的に */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFD54F]/90 via-[#FF8A65]/80 to-[#64B5F6]/90 opacity-90"></div>
        
        {/* キラキラ背景とパターンは削除 */}
        
        <div className="absolute inset-0 backdrop-blur-[3px]"></div>
        
        {/* 虹色のリム効果 - より洗練された効果 */}
        <div className="absolute inset-0 rounded-[32px] p-0.5 -m-0.5 bg-gradient-to-r from-[#FFEB3B] via-[#FF4081] to-[#2979FF] opacity-70 blur-[1px]"></div>
        
        {/* 背景の楽しい装飾 - より鮮やかで大きな雲状の装飾 */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-br from-[#FFEB3B] to-[#FFA000] rounded-full opacity-70 blur-md transform rotate-12"></div>
        <div className="absolute -bottom-32 -right-20 w-96 h-96 bg-gradient-to-br from-[#F48FB1] to-[#CE93D8] rounded-full opacity-60 blur-md"></div>
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-gradient-to-br from-[#81D4FA] to-[#4FC3F7] rounded-full opacity-60 blur-md"></div>
        <div className="absolute bottom-1/5 -left-16 w-72 h-72 bg-gradient-to-br from-[#AED581] to-[#7CB342] rounded-full opacity-50 blur-md"></div>
        
        {/* 小さな背景の円形装飾を削減 */}
        <div className="absolute bottom-1/3 right-1/3 w-24 h-24 bg-gradient-to-br from-[#B39DDB] to-[#9575CD] rounded-full opacity-30 blur-md"></div>
        
        {/* パーティクルアニメーション - さらに削減して洗練 */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={`star-title-${i}`}
            className="absolute"
            style={{
              width: `${Math.random() * 10 + 4}px`,
              height: `${Math.random() * 10 + 4}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)`,
              borderRadius: '50%',
              zIndex: 5,
            }}
            animate={{
              scale: [0.9, 1.2, 0.9],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
        
        {/* 浮かぶ泡 - さらに削減 */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`bubble-title-${i}`}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 12 + 4}px`,
              height: `${Math.random() * 12 + 4}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              backgroundColor: ['rgba(255,255,255,0.6)', 'rgba(255,236,179,0.6)', 'rgba(255,204,188,0.6)', 'rgba(187,222,251,0.6)'][Math.floor(Math.random() * 4)],
              zIndex: 5,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() > 0.5 ? 8 : -8, 0],
              opacity: [0.4, 0.9, 0.4]
            }}
            transition={{
              duration: 3 + Math.random() * 3,
              repeat: Infinity,
              repeatType: "reverse",
              delay: Math.random() * 2
            }}
          />
        ))}
        
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
                className="text-3xl font-bold text-center mb-2 relative z-10 py-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <div className="flex justify-center items-center relative px-4">
                  <span className="relative inline-block text-white px-5 py-1 font-extrabold text-3xl"
                    style={{
                      textShadow: '0 1px 3px rgba(0,0,0,0.25)',
                      letterSpacing: '1.5px',
                      lineHeight: '1.05'
                    }}>
                    {work.title}
                  </span>
                  <button
                    onClick={onDelete}
                    className="absolute right-4 text-white hover:text-red-500 p-2 rounded-full hover:bg-white/20 transition-all duration-300"
                    aria-label="作品を削除"
                  >
                    <TrashIcon className="w-6 h-6" />
                  </button>
                </div>
              </motion.h1>
              {work.description && (
                <motion.p 
                  className="text-[#4A154B] text-center mt-4 text-lg font-medium px-7 py-2.5 rounded-xl bg-white/50 backdrop-blur-sm shadow-inner max-w-[85%] mx-auto border border-white/30"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  {work.description}
                </motion.p>
              )}
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0, scale: 0 }}
                whileHover={{ opacity: 1, scale: 1, rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.3, rotate: { repeat: Infinity, duration: 1 } }}
                onClick={() => setIsEditing(true)}
                className="absolute -right-2 -top-2 p-2 bg-white/90 rounded-full shadow-md hover:bg-white"
              >
                <Edit2 className="h-4 w-4 text-[#5d7799]" />
              </motion.button>
            </div>
          )}
          <div className="flex items-center justify-center gap-2 text-white mt-5 bg-white/30 rounded-full py-2 px-5 w-fit mx-auto backdrop-blur-sm border border-white/40 shadow-sm">
            <Calendar className="h-4 w-4 text-white" />
            <p className="text-sm font-bold text-white">
              {new Date(work.created_at).toLocaleDateString('ja-JP')}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[24px] shadow-lg p-6 border-2 border-[#5d7799]/10">
        <div className="relative">
          {renderContent()}
          
          {/* 楽しいデコレーション要素 */}
          <div className="absolute -top-6 -right-6 transform rotate-12 z-10">
            <motion.div
              animate={{ rotate: [0, 15, 0, -15, 0], scale: [1, 1.1, 1, 0.9, 1] }}
              transition={{ repeat: Infinity, duration: 5 }}
            >
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6H12L10 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V8C22 6.9 21.1 6 20 6ZM20 18H4V6H9.17L11.17 8H20V18ZM8 14H10V16H12V14H14V12H12V10H10V12H8V14Z" fill="#FF9494"/>
              </svg>
            </motion.div>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-6">
          <div className="flex items-center gap-3 relative">
            <motion.button 
              onClick={toggleFavorite}
              whileTap={{ scale: 0.8 }}
              whileHover={{ 
                scale: 3,
                rotate: [-10, 30, -30, 40, -40, 20, -10, 0],
                y: [0, -25, -10, -30, -5, 0]
              }}
              transition={{ 
                rotate: { duration: 2.2, ease: "easeInOut" },
                scale: { duration: 0.2, type: "spring", stiffness: 400 }
              }}
              className={`p-3 rounded-full shadow-md transition-all duration-300 ${
                favorite 
                  ? 'bg-gradient-to-r from-yellow-200 to-amber-200 border-2 border-yellow-300' 
                  : 'bg-gray-100 text-gray-400 hover:bg-yellow-50 hover:text-yellow-500 border-2 border-gray-200'
              }`}
              aria-label="お気に入り"
              title={favorite ? 'お気に入りから削除' : 'お気に入りに追加'}
            >
              <Star className={`h-6 w-6 ${favorite ? 'text-amber-500 fill-amber-500' : ''}`} />
              {favorite && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.8, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -top-1 -right-1 bg-yellow-500 w-2 h-2 rounded-full"
                />
              )}
            </motion.button>
            
            {/* 星のアニメーション */}
            <AnimatePresence>
              {showStarAnimation && (
                <>
                  {[...Array(50)].map((_, i) => (
                    <motion.div
                      key={`fav-star-animation-${i}`}
                      className="absolute z-20 pointer-events-none"
                      initial={{ 
                        scale: 0.5,
                        x: 0,
                        y: 0,
                        rotate: 0
                      }}
                      animate={{ 
                        scale: Math.random() * 2.5 + 0.8,
                        x: (Math.random() - 0.5) * 1000,
                        y: (Math.random() - 0.5) * 1000,
                        rotate: Math.random() * 1080 - 540,
                        opacity: [1, 0.8, 0]
                      }}
                      exit={{ opacity: 0 }}
                      transition={{ 
                        duration: 3 + Math.random() * 2,
                        ease: [0.16, 0.87, 0.73, 0.97]
                      }}
                    >
                      {Math.random() > 0.6 ? (
                        <Star className={`h-${Math.floor(Math.random() * 4) + 5} w-${Math.floor(Math.random() * 4) + 5} text-amber-${Math.floor(Math.random() * 3) + 4}00 fill-amber-${Math.floor(Math.random() * 3) + 4}00`} />
                      ) : (
                        <div className={`text-${Math.floor(Math.random() * 2) + 3}xl`}>
                          {['⭐', '✨', '🌟', '⚡', '💫', '✦', '🔆', '🌠'][Math.floor(Math.random() * 8)]}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </>
              )}
            </AnimatePresence>
          </div>
          
          <motion.button 
            onClick={handleDownload}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#5d7799] via-[#7a9bc0] to-[#8ec5d6] text-white rounded-full shadow-md transition-all duration-300"
          >
            <Download className="h-5 w-5" />
            <span className="font-medium">ダウンロード</span>
            <motion.span
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 1 }}
              className="absolute -bottom-1 opacity-70"
            >
              <Download className="h-4 w-4" />
            </motion.span>
          </motion.button>
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

  // 背景色とエモジを決定
  const hasFeedback = feedbacks.length > 0;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-8 bg-white rounded-[24px] shadow-lg overflow-hidden border-2 border-[#5d7799]/10"
    >
      <motion.div 
        className={`p-5 ${hasFeedback 
          ? 'bg-gradient-to-r from-purple-100/80 via-pink-100/80 to-indigo-100/80' 
          : 'bg-gradient-to-r from-[#8ec5d6]/20 to-[#f7c5c2]/20'
        } flex justify-between items-center cursor-pointer relative overflow-hidden`}
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ backgroundColor: hasFeedback ? '#f3e8ff' : '#e6f7ff' }}
      >
        {/* 背景のアニメーション要素 */}
        {hasFeedback && [...Array(5)].map((_, i) => (
          <motion.div
            key={`msg-bubble-${i}`}
            className="absolute rounded-full bg-white/60"
            style={{
              width: `${Math.random() * 15 + 5}px`,
              height: `${Math.random() * 15 + 5}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.4, 0.7, 0.4]
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
        
        <div className="flex items-center gap-3">
          <motion.div 
            className={`p-3 ${hasFeedback 
              ? 'bg-gradient-to-r from-purple-300 to-pink-300 text-white shadow-md' 
              : 'bg-[#5d7799]/10 text-[#5d7799]'
            } rounded-full`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            animate={hasFeedback ? { 
              rotate: [0, -5, 5, 0],
              scale: [1, 1.05, 1]
            } : {}}
            transition={{ 
              rotate: { repeat: hasFeedback ? Infinity : 0, repeatDelay: 3, duration: 0.5 },
              scale: { repeat: hasFeedback ? Infinity : 0, repeatDelay: 2, duration: 1 }
            }}
          >
            {hasFeedback ? (
              <motion.div
                animate={{ rotate: [0, 10, 0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2, delay: 1 }}
              >
                <MessageCircle className="h-7 w-7" />
              </motion.div>
            ) : (
              <MessageCircle className="h-6 w-6" />
            )}
          </motion.div>
          <div>
            <h3 className={`font-bold ${hasFeedback ? 'text-purple-700' : 'text-[#5d7799]'} text-xl`}>
              {hasFeedback ? (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  メッセージが届いています！
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    className="ml-2 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2.5 py-0.5 rounded-full shadow-sm"
                  >
                    {feedbacks.length}
                  </motion.span>
                </motion.span>
              ) : (
                'メッセージはまだありません'
              )}
            </h3>
            {hasFeedback && (
              <motion.p 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-base font-medium bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent"
              >
                みんなからのメッセージをみてみよう！
              </motion.p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            onClick={handleRefresh}
            whileHover={{ rotate: 180, scale: 1.1 }}
            transition={{ duration: 0.3 }}
            className="p-2 rounded-full hover:bg-white/50 transition-colors"
            title="更新"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${hasFeedback ? 'text-purple-500' : 'text-gray-500'}`}>
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M8 16H3v5" />
            </svg>
          </motion.button>
          <motion.div 
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white/50 p-1 rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${hasFeedback ? 'text-purple-600' : 'text-[#5d7799]'}`}>
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </motion.div>
        </div>
      </motion.div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden bg-gradient-to-b from-purple-50/50 to-white"
          >
            {error ? (
              <div className="p-6 text-center">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-red-50 p-5 rounded-xl border border-red-100 max-w-md mx-auto"
                >
                  <p className="text-red-500 font-medium mb-3">メッセージの読み込みに失敗しました</p>
                  <motion.button 
                    onClick={() => fetchFeedbacks()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-red-100 text-red-600 rounded-full text-sm font-medium hover:bg-red-200 transition-colors shadow-sm"
                  >
                    もう一度試す
                  </motion.button>
                </motion.div>
              </div>
            ) : (
              <FeedbackList feedbacks={feedbacks} loading={loading} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
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
  const { updateWork, deleteWork } = useWorks();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const handleDeleteWork = async () => {
    try {
      await deleteWork(workId);
      toast.success('作品を削除しました');
      navigate('/child/works');
    } catch (error) {
      toast.error('削除に失敗しました');
      console.error('Delete work error:', error);
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
    <div className="min-h-screen bg-gradient-to-b from-[#f8fbfd] to-[#f0f7ff] p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <BackButton onClick={handleBack} />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="relative"
        >
          {/* デコレーション要素 - 雲のような背景 */}
          <div className="absolute -top-8 -left-8 w-32 h-16 bg-gradient-to-r from-blue-100/40 to-cyan-100/40 rounded-full blur-md -z-10"></div>
          <div className="absolute -bottom-6 -right-8 w-32 h-20 bg-gradient-to-r from-pink-100/40 to-purple-100/40 rounded-full blur-md -z-10"></div>
          
          <WorkContent 
            work={work}
            onUpdate={handleUpdateWork}
            onDelete={handleDeleteWork}
          />
        </motion.div>
        
        <FeedbackSection workId={work.id} />
        
        <div className="h-20"></div>
      </div>
      
      {/* キラキラエフェクト（子供向け装飾） */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              backgroundColor: ['#8ec5d6', '#f7c5c2', '#f5f6bf', '#5d7799', '#ffb6c1', '#ffd700', '#87cefa'][Math.floor(Math.random() * 7)]
            }}
            animate={{
              opacity: [0.1, 0.5, 0.1],
              scale: [1, 2, 1],
              y: [0, -20, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 7,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
          />
        ))}
        
        {/* 浮かぶ形 */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`shape-${i}`}
            className={`absolute rounded-${Math.random() > 0.5 ? 'full' : Math.random() > 0.5 ? 'md' : 'lg'}`}
            style={{
              width: `${Math.random() * 30 + 20}px`,
              height: `${Math.random() * 30 + 20}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)`,
              filter: 'blur(1px)'
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, Math.random() > 0.5 ? 20 : -20, 0],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: 10 + Math.random() * 15,
              repeat: Infinity,
              delay: Math.random() * 10
            }}
          />
        ))}
        
        {/* 虹色のキラキラ（角の部分） */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff9ff3" />
                <stop offset="20%" stopColor="#feca57" />
                <stop offset="40%" stopColor="#ff6b6b" />
                <stop offset="60%" stopColor="#48dbfb" />
                <stop offset="80%" stopColor="#1dd1a1" />
                <stop offset="100%" stopColor="#5f27cd" />
              </linearGradient>
            </defs>
            <motion.path 
              d="M10,30 Q50,10 90,30 Q70,50 90,70 Q50,90 10,70 Q30,50 10,30 Z" 
              fill="none"
              stroke="url(#rainbow)"
              strokeWidth="2"
              animate={{ 
                d: [
                  "M10,30 Q50,10 90,30 Q70,50 90,70 Q50,90 10,70 Q30,50 10,30 Z",
                  "M20,20 Q60,20 80,40 Q60,60 80,80 Q40,80 20,60 Q40,40 20,20 Z",
                  "M10,30 Q50,10 90,30 Q70,50 90,70 Q50,90 10,70 Q30,50 10,30 Z"
                ]
              }}
              transition={{ repeat: Infinity, duration: 20, ease: "easeInOut" }}
            />
          </svg>
        </div>
        
        <div className="absolute bottom-0 left-0 w-32 h-32 opacity-20">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <motion.path 
              d="M10,30 Q50,10 90,30 Q70,50 90,70 Q50,90 10,70 Q30,50 10,30 Z" 
              fill="none"
              stroke="url(#rainbow)"
              strokeWidth="2"
              animate={{ 
                d: [
                  "M10,30 Q50,10 90,30 Q70,50 90,70 Q50,90 10,70 Q30,50 10,30 Z",
                  "M20,20 Q60,20 80,40 Q60,60 80,80 Q40,80 20,60 Q40,40 20,20 Z",
                  "M10,30 Q50,10 90,30 Q70,50 90,70 Q50,90 10,70 Q30,50 10,30 Z"
                ]
              }}
              transition={{ repeat: Infinity, duration: 20, ease: "easeInOut", delay: 5 }}
            />
          </svg>
        </div>
      </div>
    </div>
  );
} 