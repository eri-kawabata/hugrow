import React, { memo, useCallback, useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Image, Music, Camera, Plus, Filter, X, Palette, Star, MessageCircle, Award, Calendar, Mic } from 'lucide-react';
import { useWorks } from '@/hooks/useWorks';
import type { Work, Badge } from '@/types/work';
import { LoadingSpinner } from '@/components/Common/LoadingSpinner';
import { ErrorMessage } from '@/components/Common/ErrorMessage';
import { EmptyState } from '@/components/Common/EmptyState';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { formatDate } from '../utils/formatDate';
import { useConfirm } from '../hooks/useConfirm';
import toast from 'react-hot-toast';
import { useProfile } from '@/hooks/useProfile';
import { BaseLayout } from '@/components/layouts/BaseLayout';
import { GradientHeader } from '@/components/Common/GradientHeader';

// 作品タイプのフィルター型
type WorkTypeFilter = 'all' | Work['type'] | 'drawing' | 'audio' | 'photo';

// フィルタータイプを日本語に変換する関数
const filterTypeToJapanese = (type: WorkTypeFilter): string => {
  switch (type) {
    case 'all': return 'すべての';
    case 'drawing': return 'お絵かき';
    case 'audio': return '音声';
    case 'photo': return '写真';
    default: return '';
  }
};

// 作成ボタンコンポーネント
const CreateWorkButton = memo(() => (
  <Link
    to="/child/works/new"
    className="flex items-center gap-2 bg-gradient-to-r from-[#8ec5d6] to-[#5d7799] text-white px-6 py-3 rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-pulse"
  >
    <Plus className="h-5 w-5" />
    <span className="font-medium">新しい作品を作る</span>
  </Link>
));

CreateWorkButton.displayName = 'CreateWorkButton';

// 作品カードコンポーネント
const WorkCard = memo(({ work, onView }: { work: Work, onView?: () => void }) => {
  // 作品タイプを決定（互換性のため）
  const workType = work.type || 'drawing';
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [hasFeedback, setHasFeedback] = useState(false);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [feedbackContent, setFeedbackContent] = useState<string>('');
  const [isHovered, setIsHovered] = useState(false);
  const [feedbackUser, setFeedbackUser] = useState<{ username?: string; display_name?: string } | null>(null);
  
  // お気に入り状態とフィードバック状態を読み込む
  useEffect(() => {
    const loadFavoriteAndFeedbackStatus = async () => {
      if (!user) return;
      
      try {
        console.log('フィードバック情報を取得開始 - work.id:', work.id);
        
        // フィードバック数を確認
        const { data: feedbackData, error: feedbackError } = await supabase
          .from('work_feedback')
          .select('id, user_id, feedback')
          .eq('work_id', work.id);
          
        console.log('フィードバックデータ:', feedbackData);
        console.log('フィードバックエラー:', feedbackError);
          
        if (!feedbackError && feedbackData && feedbackData.length > 0) {
          setHasFeedback(true);
          setFeedbackCount(feedbackData.length);
          
          // 最新のフィードバックの内容を保存
          if (feedbackData[0].feedback) {
            setFeedbackContent(feedbackData[0].feedback);
            console.log('フィードバック内容を設定:', feedbackData[0].feedback);
          }
          
          try {
            // 保護者のユーザーIDを取得
            const userId = feedbackData[0].user_id;
            
            // プロフィール情報を取得
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('username, display_name')
              .eq('user_id', userId)
              .single();
              
            console.log('プロフィールデータ:', profileData);
            console.log('プロフィールエラー:', profileError);
              
            if (!profileError && profileData) {
              setFeedbackUser(profileData);
              console.log('フィードバックユーザー情報を設定:', profileData);
            }
          } catch (profileError) {
            console.error('プロフィール情報の取得に失敗しました:', profileError);
          }
        } else {
          console.log('フィードバックなし');
        }
      } catch (error) {
        console.error('作品情報の読み込みに失敗しました:', error);
      }
    };
    
    loadFavoriteAndFeedbackStatus();
  }, [work.id, user]);
  
  // お気に入り状態を読み込む
  useEffect(() => {
    const loadFavoriteStatus = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('work_id', work.id)
          .single();
          
        if (!error && data) {
          setIsFavorite(true);
        }
      } catch (error) {
        console.error('お気に入り状態の読み込みに失敗しました:', error);
      }
    };
    
    loadFavoriteStatus();
  }, [work.id, user]);
  
  // サムネイル表示
  const renderThumbnail = () => {
    const thumbnailHeight = 'h-40';
    
    // タイプに応じたデフォルト表示
    switch (workType) {
      case 'audio':
        return (
          <div className={`${thumbnailHeight} bg-gradient-to-br from-purple-400/20 via-pink-300/20 to-indigo-300/20 flex flex-col items-center justify-center transition-transform duration-300 ${isHovered ? 'scale-105' : 'scale-100'} relative overflow-hidden rounded-t-2xl`}>
            {/* 背景のグラデーションアニメーション */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-indigo-500/10 animate-gradient" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-transparent" />
            </div>

            {/* 波形アニメーション */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex space-x-1.5 h-24 items-center">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-gradient-to-t from-purple-500 to-pink-400 rounded-full transform origin-bottom"
                    style={{
                      height: `${Math.sin((i / 8) * Math.PI) * 100}%`,
                      animation: `wave 1.5s ease-in-out infinite`,
                      animationDelay: `${i * 0.1}s`,
                      opacity: 0.7
                    }}
                  />
                ))}
              </div>
            </div>

            {/* オーバーレイとアイコン */}
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="p-3 bg-white/30 rounded-full backdrop-blur-sm">
                <Mic className="h-8 w-8 text-purple-600/90" />
              </div>
              <div className="text-sm font-medium text-purple-900/80 bg-white/50 px-3 py-1 rounded-full backdrop-blur-sm">
                音声
              </div>
            </div>

            {/* キラキラエフェクト */}
            {isHovered && (
              <div className="absolute inset-0">
                {[...Array(12)].map((_, i) => (
                  <div 
                    key={i} 
                    className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${1 + Math.random() * 2}s`,
                      opacity: 0.8
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        );
      
      case 'drawing':
      case 'photo':
      default:
        // 画像URLがある場合はそれを表示
        if (work.thumbnail_url) {
          return (
            <div className={`${thumbnailHeight} overflow-hidden bg-gray-100 relative`}>
              <img 
                src={work.thumbnail_url} 
                alt={work.title || '作品'} 
                className={`w-full h-full object-cover transition-transform duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`}
              />
              {isHovered && (
                <div className="absolute inset-0">
                  {[...Array(8)].map((_, i) => (
                    <div 
                      key={i} 
                      className="absolute w-1.5 h-1.5 bg-yellow-300 rounded-full animate-twinkle"
                      style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 2}s`,
                        animationDuration: `${1 + Math.random() * 2}s`
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        }
        
        // デフォルトのアイコン表示
        const defaultIcon = workType === 'drawing' ? (
          <Palette className="h-16 w-16 text-indigo-300" />
        ) : workType === 'photo' ? (
          <Camera className="h-16 w-16 text-emerald-300" />
        ) : (
          <Image className="h-16 w-16 text-gray-300" />
        );
        
        const defaultGradient = workType === 'drawing' ? (
          'from-blue-50 to-indigo-100'
        ) : workType === 'photo' ? (
          'from-green-50 to-emerald-100'
        ) : (
          'from-gray-50 to-gray-200'
        );
        
        return (
          <div className={`${thumbnailHeight} bg-gradient-to-br ${defaultGradient} flex items-center justify-center transition-transform duration-300 ${isHovered ? 'scale-105' : 'scale-100'} relative`}>
            {defaultIcon}
            {isHovered && (
              <div className="absolute inset-0">
                {[...Array(8)].map((_, i) => (
                  <div 
                    key={i} 
                    className="absolute w-1.5 h-1.5 bg-yellow-300 rounded-full animate-twinkle"
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${1 + Math.random() * 2}s`
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        );
    }
  };
  
  // 作品タイプ情報を取得
  const getTypeInfo = () => {
    switch (workType) {
      case 'drawing':
        return {
          label: 'お絵かき',
          icon: <Palette className="h-3.5 w-3.5" />,
          color: 'bg-indigo-100 text-indigo-700'
        };
      case 'audio':
        return {
          label: '音声',
          icon: <Music className="h-3.5 w-3.5" />,
          color: 'bg-amber-100 text-amber-700'
        };
      case 'photo':
        return {
          label: '写真',
          icon: <Camera className="h-3.5 w-3.5" />,
          color: 'bg-emerald-100 text-emerald-700'
        };
      default:
        return {
          label: '作品',
          icon: <Image className="h-3.5 w-3.5" />,
          color: 'bg-gray-100 text-gray-700'
        };
    }
  };
  
  // カードクリック時の処理
  const handleCardClick = (e: React.MouseEvent) => {
    if (onView) {
      onView();
    }
  };
  
  const typeInfo = getTypeInfo();
  
  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user?.id)
          .eq('work_id', work.id);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert([{ user_id: user?.id, work_id: work.id }]);
          
        if (error) throw error;
      }
      
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('お気に入り操作に失敗しました:', error);
      toast.error('お気に入りの更新に失敗しました');
    }
  };
  
  return (
    <motion.div
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleCardClick}
      className="group relative h-full w-full"
    >
      {/* グラデーションの背景 */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#60a5fa] via-[#e879f9] to-[#fcd34d] rounded-[28px] opacity-30 group-hover:opacity-70 blur transition duration-500"></div>
      
      {/* メインのカード */}
      <div className="relative block bg-gradient-to-br from-white/90 to-white/85 rounded-[24px] shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-white/80 backdrop-blur-sm h-full flex flex-col">
        {/* 背景テクスチャ */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuMDUiIG51bU9jdGF2ZXM9IjIiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48ZmVDb2xvck1hdHJpeCB0eXBlPSJzYXR1cmF0ZSIgdmFsdWVzPSIwIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjUwMCIgaGVpZ2h0PSI1MDAiIGZpbHRlcj0idXJsKCNub2lzZSkiIG9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')] opacity-40 mix-blend-overlay"></div>
        
        <div className="absolute inset-0 bg-white/80 transition-opacity group-hover:opacity-90"></div>
        <div className="relative p-4 flex flex-col flex-1">
          {/* サムネイル部分 */}
          <div className="relative">
            {renderThumbnail()}
            
            {/* フィードバックバッジ */}
            {hasFeedback && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-3 right-3 z-20"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 border border-white/50"
                >
                  <MessageCircle className="h-4 w-4 text-white" />
                  <span className="text-xs font-medium text-white">メッセージ</span>
                </motion.div>
              </motion.div>
            )}
            
            {/* バッジ表示 */}
            {work.badges && work.badges.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-2 right-2 flex gap-1"
              >
                {work.badges.map((badge: Badge, index: number) => (
                  <motion.div
                    key={badge.id || index}
                    whileHover={{ scale: 1.2, rotate: 15 }}
                    className="bg-gradient-to-br from-yellow-400 to-yellow-500 p-1.5 rounded-full shadow-lg"
                  >
                    <Award className="h-4 w-4 text-white" />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
          
          {/* コンテンツ部分 */}
          <div className="p-3 flex-1 flex flex-col">
            <div className="min-h-[4.5rem] mb-2">
              <motion.h2 
                className="font-bold text-lg mb-1.5 text-gray-800 group-hover:text-[#5d7799] transition-colors duration-300 line-clamp-2"
              >
                {work.title || 'タイトルなし'}
              </motion.h2>
              
              {work.description && (
                <p className="text-gray-600 text-sm line-clamp-2">{work.description}</p>
              )}
            </div>
            
            {/* フィードバック表示 */}
            {hasFeedback && feedbackContent && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-auto mb-3 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl group-hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                <div className="px-3 py-2 border-b border-purple-100/50 bg-gradient-to-r from-purple-100/30 to-blue-100/30">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium text-purple-700">
                      {feedbackUser?.username || feedbackUser?.display_name || 'えり'}さんから
                    </span>
                  </div>
                </div>
                <div className="px-3 py-2 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-200/5 to-blue-200/5"></div>
                  <p className="text-sm text-gray-700 leading-relaxed line-clamp-2 relative">{feedbackContent}</p>
                </div>
              </motion.div>
            )}
            
            {/* フッター部分 */}
            <div className="mt-auto flex items-center justify-between">
              <div className="text-sm text-gray-500 flex items-center gap-2 bg-gray-50/80 px-2.5 py-1 rounded-full">
                <Calendar className="h-4 w-4" />
                {formatDate(work.created_at)}
              </div>
              
              <div className="flex items-center gap-3">
                {work.rating && (
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full"
                  >
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-yellow-700">{work.rating}</span>
                  </motion.div>
                )}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleFavoriteClick}
                  className={`p-2 rounded-full transition-all duration-300 ${
                    isFavorite 
                      ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100' 
                      : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                  }`}
                >
                  <Star className={`h-5 w-5 transform transition-transform duration-300 ${isFavorite ? 'fill-current scale-110' : 'scale-100'}`} />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* キラキラエフェクト */}
      {isHovered && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 1, 0], 
                scale: [0, 1, 0],
                x: Math.random() * 20 - 10,
                y: Math.random() * 20 - 10
              }}
              transition={{ 
                duration: 1.5 + Math.random(),
                delay: i * 0.1,
                repeat: Infinity,
                repeatDelay: Math.random() * 2
              }}
              className="absolute w-1.5 h-1.5 bg-yellow-300 rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                filter: 'blur(1px)'
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
});

WorkCard.displayName = 'WorkCard';

// フィルターボタンコンポーネント
const FilterButton = memo(({ 
  type, 
  activeFilter, 
  onClick 
}: { 
  type: WorkTypeFilter, 
  activeFilter: WorkTypeFilter, 
  onClick: (type: WorkTypeFilter) => void 
}) => {
  const getFilterInfo = () => {
    switch (type) {
      case 'all':
        return {
          label: 'すべて',
          icon: <Filter className="h-4 w-4" />
        };
      case 'drawing':
        return {
          label: 'お絵かき',
          icon: <Palette className="h-4 w-4" />
        };
      case 'audio':
        return {
          label: '音声',
          icon: <Music className="h-4 w-4" />
        };
      case 'photo':
        return {
          label: '写真',
          icon: <Camera className="h-4 w-4" />
        };
      default:
        return {
          label: 'すべて',
          icon: <Filter className="h-4 w-4" />
        };
    }
  };
  
  const info = getFilterInfo();
  
  return (
    <button
      onClick={() => onClick(type)}
      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
        activeFilter === type 
          ? 'bg-[#5d7799] text-white shadow-md' 
          : 'bg-white text-[#5d7799] hover:bg-[#5d7799]/10'
      }`}
    >
      <div className={`${activeFilter === type ? 'text-white' : 'text-[#5d7799]'}`}>
        {info.icon}
      </div>
      <span className="font-medium">{info.label}</span>
      {activeFilter === type && type !== 'all' && (
        <X 
          className="h-4 w-4 ml-1 cursor-pointer" 
          onClick={(e) => {
            e.stopPropagation();
            onClick('all');
          }} 
        />
      )}
    </button>
  );
});

FilterButton.displayName = 'FilterButton';

// 作品グリッドコンポーネント
const WorksGrid = memo(({ 
  works, 
  onView
}: { 
  works: Work[], 
  onView?: (work: Work) => void
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
    {works.map((work, index) => (
      <div 
        key={work.id} 
        className="animate-fade-in" 
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <WorkCard 
          work={work} 
          onView={onView ? () => onView(work) : undefined}
        />
      </div>
    ))}
  </div>
));

WorksGrid.displayName = 'WorksGrid';

// ヘッダーコンポーネント
const WorksHeader = memo(({ 
  activeFilter, 
  setActiveFilter,
  worksCount
}: { 
  activeFilter: WorkTypeFilter;
  setActiveFilter: (filter: WorkTypeFilter) => void;
  worksCount?: number;
}) => {
  const getFilterInfo = useCallback(() => [
    {
      type: 'all' as WorkTypeFilter,
      label: 'すべて',
      icon: <Filter className="h-4 w-4" />
    },
    {
      type: 'drawing' as WorkTypeFilter,
      label: 'お絵かき',
      icon: <Palette className="h-4 w-4" />
    },
    {
      type: 'audio' as WorkTypeFilter,
      label: '音声',
      icon: <Music className="h-4 w-4" />
    },
    {
      type: 'photo' as WorkTypeFilter,
      label: '写真',
      icon: <Camera className="h-4 w-4" />
    }
  ], []);

  return (
    <div className="w-full">
      <div className="max-w-5xl mx-auto">
        <GradientHeader 
          title="わたしの作品" 
          gradientColors={{
            from: '#FFD700',  // 明るい黄色
            via: '#FF9E9E',   // サーモンピンク
            to: '#B19CD9'     // 優しい紫
          }}
        />
      </div>
      
      <div className="px-6 -mt-8 relative z-10">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-3 flex flex-wrap items-center justify-center gap-2.5 max-w-2xl mx-auto border border-white/50 mb-4">
          {getFilterInfo().map(filter => (
            <button
              key={filter.type}
              onClick={() => setActiveFilter(filter.type)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                activeFilter === filter.type 
                  ? 'bg-gradient-to-r from-[#8ec5d6] to-[#5d7799] text-white shadow-md transform scale-105' 
                  : 'bg-white/70 text-[#5d7799] hover:bg-[#5d7799]/10 border border-[#5d7799]/10'
              }`}
            >
              <div className={`${activeFilter === filter.type ? 'text-white' : 'text-[#5d7799]'} transition-colors`}>
                {filter.icon}
              </div>
              <span className="font-medium text-sm">{filter.label}</span>
              {activeFilter === filter.type && filter.type !== 'all' && (
                <X 
                  className="h-3.5 w-3.5 ml-1 cursor-pointer hover:text-white/80 transition-colors" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveFilter('all');
                  }} 
                />
              )}
              {filter.type === 'all' && worksCount !== undefined && (
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                  activeFilter === filter.type 
                    ? 'bg-white/20 text-white' 
                    : 'bg-[#5d7799]/10 text-[#5d7799]'
                }`}>
                  {worksCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

WorksHeader.displayName = 'WorksHeader';

// メインコンポーネント
const MyWorks = () => {
  const { works, loading, error, fetchWorks, setWorks } = useWorks();
  const [selectedType, setSelectedType] = useState<WorkTypeFilter>('all');
  const [selectedChildProfileId, setSelectedChildProfileId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isParentMode = pathname.includes('/parent');

  // 子供プロファイルIDの変更を監視
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'selectedChildProfileId' || e.key === 'selectedChildId') {
        const newProfileId = e.newValue || localStorage.getItem('selectedChildProfileId') || localStorage.getItem('selectedChildId');
        console.log('MyWorks - ローカルストレージから子供プロファイルID変更検知:', newProfileId);
        if (newProfileId) {
          setSelectedChildProfileId(newProfileId);
        }
      }
    };

    const handleChildChange = () => {
      const newProfileId = localStorage.getItem('selectedChildProfileId') || localStorage.getItem('selectedChildId');
      console.log('MyWorks - 子供変更イベント検知 - profileId:', newProfileId);
      if (newProfileId) {
        setSelectedChildProfileId(newProfileId);
      }
    };

    // 初期値を設定
    const initialProfileId = localStorage.getItem('selectedChildProfileId') || localStorage.getItem('selectedChildId');
    console.log('MyWorks - 初期値設定 - profileId:', initialProfileId);
    if (initialProfileId) {
      setSelectedChildProfileId(initialProfileId);
    }

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('selectedChildChanged', handleChildChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('selectedChildChanged', handleChildChange);
    };
  }, []);

  // プロファイルIDが変更されたら作品を再取得
  useEffect(() => {
    if (selectedChildProfileId) {
      console.log('MyWorks - 作品を取得します - profileId:', selectedChildProfileId);
      fetchWorks(undefined, selectedChildProfileId);
    } else {
      console.log('MyWorks - プロファイルIDが設定されていないため、作品を取得しません');
      fetchWorks(undefined, undefined);  // プロファイルIDがない場合は空の配列を返すように修正
    }
  }, [selectedChildProfileId, fetchWorks]);

  // 作品を種類でフィルタリング
  const filteredWorks = useMemo(() => {
    if (selectedType === 'all') return works;
    return works.filter(work => work.type === selectedType);
  }, [works, selectedType]);

  // 選択中の子供のプロファイルIDに一致する作品のみをフィルタリング
  const childFilteredWorks = useMemo(() => {
    if (!selectedChildProfileId) return filteredWorks;
    
    // プロファイルIDによるフィルタリングを有効化
    const filtered = filteredWorks.filter(work => work.profile_id === selectedChildProfileId);
    console.log('MyWorks - 子供プロファイルIDでフィルタリング:', selectedChildProfileId);
    console.log('MyWorks - フィルタリング前の作品数:', filteredWorks.length, 'フィルタリング後の作品数:', filtered.length);
    
    // フィルタリングされた作品のプロファイルIDをログに出力（デバッグ用）
    if (filtered.length > 0) {
      console.log('MyWorks - フィルタリング後の作品のプロファイルID:', filtered.map(work => work.profile_id));
    }
    
    return filtered;
  }, [filteredWorks, selectedChildProfileId]);

  // 作品の詳細表示
  const handleViewWork = (work: Work) => {
    navigate(`/child/works/${work.id}`);
  };

  // 背景アニメーション用の要素を作成
  const renderBackgroundAnimation = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: -1 }}>
      {/* ふわふわ浮かぶ円形 */}
      {[...Array(20)].map((_, i) => (
        <div
          key={`circle-${i}`}
          className={`absolute rounded-full bg-gradient-to-b ${
            i % 3 === 0 ? 'from-pink-200/60 to-purple-200/50' : 
            i % 3 === 1 ? 'from-indigo-200/60 to-blue-200/50' : 
            'from-amber-200/60 to-yellow-200/50'
          } opacity-90 animate-float`}
          style={{
            width: `${Math.random() * 80 + 40}px`,
            height: `${Math.random() * 80 + 40}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 10 + 15}s`,
            animationDelay: `${Math.random() * 5}s`,
            filter: 'blur(1px)'
          }}
        />
      ))}

      {/* キラキラ光るエフェクト */}
      {[...Array(30)].map((_, i) => (
        <div
          key={`sparkle-${i}`}
          className="absolute w-2 h-2 bg-white rounded-full animate-twinkle"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${1 + Math.random() * 3}s`,
            opacity: Math.random() * 0.8 + 0.6,
            boxShadow: '0 0 6px 2px rgba(255, 255, 255, 0.7)'
          }}
        />
      ))}

      {/* グラデーション背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/80 via-white/30 to-amber-100/80 animate-gradient-slow opacity-95" />
    </div>
  );

  // 作品がない場合のメッセージ
  if (childFilteredWorks.length === 0 && !loading) {
    console.log('MyWorks - 表示する作品がありません - selectedChildProfileId:', selectedChildProfileId);
    return (
      <BaseLayout hideHeader={true}>
        {renderBackgroundAnimation()}
        <div className="relative flex flex-col min-h-screen" style={{ zIndex: 1 }}>
          <div className="sticky top-0 z-20 bg-white/60 backdrop-blur-md shadow-md">
            <WorksHeader 
              activeFilter={selectedType} 
              setActiveFilter={setSelectedType}
              worksCount={works.length}
            />
          </div>
          <div className="max-w-5xl mx-auto px-4 flex-1 pb-40">
            <div className="bg-white/90 rounded-[32px] shadow-lg p-8 text-center my-12 relative overflow-hidden backdrop-blur-sm border border-white">
              {/* キラキラエフェクト */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(10)].map((_, i) => (
                  <div 
                    key={i} 
                    className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-ping opacity-70"
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${2 + Math.random() * 3}s`
                    }}
                  />
                ))}
              </div>
              
              <div className="mb-6 bg-[#f8fbfd] p-6 rounded-full inline-block relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-200 via-purple-200 to-indigo-200 opacity-30 animate-pulse"></div>
                <Image className="w-20 h-20 text-[#8ec5d6] mx-auto relative z-10" />
              </div>
              <h2 className="text-2xl font-bold text-[#5d7799] mb-3">作品がありません</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                新しい作品を作成して、あなたの才能を表現してみましょう！
              </p>
            </div>
          </div>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout hideHeader={true}>
      {renderBackgroundAnimation()}
      <div className="relative flex flex-col min-h-screen" style={{ zIndex: 1 }}>
        <div className="sticky top-0 z-20 bg-white/60 backdrop-blur-md shadow-md">
          <WorksHeader 
            activeFilter={selectedType} 
            setActiveFilter={setSelectedType}
            worksCount={works.length}
          />
        </div>
        <div className="max-w-5xl mx-auto px-4 flex-1 pb-40">
          {/* ローディング状態 */}
          {loading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg">
                <div className="h-12 w-12 text-[#8ec5d6] animate-spin mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <p className="text-gray-600">読み込み中...</p>
              </div>
            </div>
          ) : (
            <>
              {/* 作品一覧 */}
              <div className="py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-20">
                {childFilteredWorks.map((work, index) => (
                  <motion.div 
                    key={work.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: index * 0.1,
                      duration: 0.4
                    }}
                    className="w-full flex justify-center"
                  >
                    <div className="w-full max-w-[280px]">
                      <WorkCard 
                        work={work} 
                        onView={() => handleViewWork(work)}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* カスタムアニメーションのためのスタイル */}
      <style>{`
        @keyframes wave {
          0% { transform: scaleY(0.3); }
          50% { transform: scaleY(1); }
          100% { transform: scaleY(0.3); }
        }
        @keyframes twinkle {
          0% { opacity: 0.3; transform: scale(0.8); filter: blur(2px); }
          50% { opacity: 1; transform: scale(1.8); filter: blur(1px); }
          100% { opacity: 0.3; transform: scale(0.8); filter: blur(2px); }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 8s ease infinite;
        }
        .animate-gradient-slow {
          background-size: 300% 300%;
          animation: gradient 25s ease infinite;
        }
        @keyframes float {
          0% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-20px) rotate(5deg); }
          50% { transform: translateY(-40px) rotate(10deg); }
          75% { transform: translateY(-20px) rotate(15deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }
        .animate-float {
          animation-name: float;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        
        /* フェードインアニメーション */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>
    </BaseLayout>
  );
};

export default MyWorks; 

// 名前付きエクスポートを追加
export { MyWorks }; 