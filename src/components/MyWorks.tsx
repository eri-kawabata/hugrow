import React, { memo, useCallback, useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Image, Music, Camera, Plus, Filter, X, Palette, Star, MessageCircle, Pencil, Mic } from 'lucide-react';
import { useWorks, Work } from '@/hooks/useWorks';
import { LoadingSpinner } from '@/components/Common/LoadingSpinner';
import { ErrorMessage } from '@/components/Common/ErrorMessage';
import { EmptyState } from '@/components/Common/EmptyState';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { FaPlus, FaTrash, FaEye, FaStar, FaMagic, FaSparkles } from 'react-icons/fa';
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
  const [parentName, setParentName] = useState<string>('');
  const [feedbackContent, setFeedbackContent] = useState<string>('');
  const [isHovered, setIsHovered] = useState(false);
  
  // お気に入り状態とフィードバック状態を読み込む
  useEffect(() => {
    const loadFavoriteAndFeedbackStatus = async () => {
      if (!user) return;
      
      try {
        // お気に入り状態を確認 - favoritesテーブルが存在しない場合はエラーを無視
        try {
          const { data: favoriteData, error: favoriteError } = await supabase
            .from('favorites')
            .select('id')
            .eq('user_id', user.id)
            .eq('work_id', work.id);
            
          if (!favoriteError && favoriteData && favoriteData.length > 0) {
            setIsFavorite(true);
          }
        } catch (favError) {
          console.log('お気に入り情報の取得に失敗しました:', favError);
          // エラーを無視して処理を続行
        }
        
        // フィードバック数を確認
        const { data: feedbackData, error: feedbackError } = await supabase
          .from('work_feedback')
          .select('id, user_id, content')
          .eq('work_id', work.id);
          
        if (!feedbackError && feedbackData && feedbackData.length > 0) {
          setHasFeedback(true);
          setFeedbackCount(feedbackData.length);
          
          // 最新のフィードバックの内容を保存
          if (feedbackData[0].content) {
            setFeedbackContent(feedbackData[0].content);
          }
          
          try {
            // 保護者のユーザーIDを取得
            const userId = feedbackData[0].user_id;
            
            // プロフィール情報を取得 - single()を使わない
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('display_name')
              .eq('user_id', userId);
              
            if (!profileError && profileData && profileData.length > 0 && profileData[0].display_name) {
              setParentName(profileData[0].display_name);
            } else {
              setParentName('保護者');
            }
          } catch (profileError) {
            console.log('プロフィール情報の取得に失敗しました:', profileError);
            setParentName('保護者');
          }
        }
      } catch (error) {
        console.error('作品情報の読み込みに失敗しました:', error);
      }
    };
    
    loadFavoriteAndFeedbackStatus();
  }, [work.id, user]);
  
  // サムネイル表示
  const renderThumbnail = () => {
    const thumbnailHeight = 'h-48';
    
    // 画像URLがある場合
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
    
    // タイプに応じたデフォルト表示
    switch (workType) {
      case 'drawing':
        return (
          <div className={`${thumbnailHeight} bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center transition-transform duration-300 ${isHovered ? 'scale-105' : 'scale-100'} relative`}>
            <Palette className="h-16 w-16 text-indigo-300" />
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
      case 'audio':
        return (
          <div className={`${thumbnailHeight} bg-gradient-to-br from-purple-50 to-pink-100 flex flex-col items-center justify-center transition-transform duration-300 ${isHovered ? 'scale-105' : 'scale-100'} relative overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 to-pink-100/80 backdrop-blur-sm"></div>
            <div className="relative z-10 flex flex-col items-center gap-3">
              <Mic className="h-12 w-12 text-pink-400" />
              <div className="flex space-x-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-8 bg-pink-400 rounded-full animate-soundwave"
                    style={{
                      animationDelay: `${i * 0.2}s`,
                      transform: `scaleY(${Math.random() * 0.5 + 0.5})`
                    }}
                  />
                ))}
              </div>
            </div>
            {isHovered && (
              <div className="absolute inset-0">
                {[...Array(12)].map((_, i) => (
                  <div 
                    key={i} 
                    className="absolute w-1.5 h-1.5 bg-pink-300 rounded-full animate-twinkle"
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
      case 'photo':
        return (
          <div className={`${thumbnailHeight} bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center transition-transform duration-300 ${isHovered ? 'scale-105' : 'scale-100'} relative`}>
            <Camera className="h-16 w-16 text-emerald-300" />
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
      default:
        return (
          <div className={`${thumbnailHeight} bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center transition-transform duration-300 ${isHovered ? 'scale-105' : 'scale-100'} relative`}>
            <Image className="h-16 w-16 text-gray-300" />
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
  
  return (
    <div 
      className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 cursor-pointer"
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        {renderThumbnail()}
        
        {/* タイプラベル */}
        <div className="absolute top-3 left-3">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${typeInfo.color}`}>
            {typeInfo.icon}
            <span className="text-xs font-medium">{typeInfo.label}</span>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-gray-800 mb-1 line-clamp-1">
          {work.title || 'タイトルなし'}
        </h3>
        <div className="text-sm text-gray-500 mb-2">
          {formatDate(work.created_at)}
        </div>
        
        {/* フィードバックとお気に入り */}
        <div className="mt-2">
          {hasFeedback ? (
            <div className="text-sm">
              <div className="flex items-center text-purple-600 mb-1">
                <MessageCircle className="h-4 w-4 mr-1" />
                <span className="font-medium">{parentName}からのコメント</span>
              </div>
              {feedbackContent && (
                <p className="text-gray-600 text-xs line-clamp-2 bg-purple-50 p-2 rounded-md">
                  {feedbackContent}
                </p>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-400">コメントなし</div>
          )}
          
          {isFavorite && (
            <div className="flex items-center text-sm text-yellow-500 mt-1">
              <Star className="h-4 w-4 mr-1 fill-current" />
              <span>お気に入り</span>
            </div>
          )}
        </div>
      </div>
    </div>
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
    <div className="max-w-5xl mx-auto">
      <GradientHeader 
        title="わたしの作品" 
        gradientColors={{
          from: '#8ec5d6',
          via: '#f7c5c2',
          to: '#f5f6bf'
        }}
      />
      
      <div className="px-6 -mt-8 relative z-20">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-3 flex flex-wrap items-center justify-center gap-2.5 max-w-2xl mx-auto border border-white/50">
          {getFilterInfo().map(filter => (
            <button
              key={filter.type}
              onClick={() => setActiveFilter(filter.type)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                activeFilter === filter.type 
                  ? 'bg-gradient-to-r from-[#8ec5d6] to-[#5d7799] text-white shadow-md transform scale-105' 
                  : 'bg-white/80 text-[#5d7799] hover:bg-[#5d7799]/5 border border-[#5d7799]/10'
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
  const { works, loading, error, createWork, deleteWork } = useWorks(true);
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
        setSelectedChildProfileId(newProfileId);
      }
    };

    const handleChildChange = () => {
      const newProfileId = localStorage.getItem('selectedChildProfileId') || localStorage.getItem('selectedChildId');
      console.log('MyWorks - 子供変更イベント検知 - profileId:', newProfileId);
      setSelectedChildProfileId(newProfileId);
    };

    // 初期値を設定
    const initialProfileId = localStorage.getItem('selectedChildProfileId') || localStorage.getItem('selectedChildId');
    console.log('MyWorks - 初期値設定 - profileId:', initialProfileId);
    setSelectedChildProfileId(initialProfileId);

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('selectedChildChanged', handleChildChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('selectedChildChanged', handleChildChange);
    };
  }, []);

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

  // 作品がない場合のメッセージ
  if (childFilteredWorks.length === 0 && !loading) {
    console.log('MyWorks - 表示する作品がありません - selectedChildProfileId:', selectedChildProfileId);
    return (
      <BaseLayout hideHeader={true}>
        <WorksHeader 
          activeFilter={selectedType} 
          setActiveFilter={setSelectedType}
          worksCount={works.length}
        />
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-[32px] shadow-md p-8 text-center my-12 relative overflow-hidden">
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
            
            <CreateWorkButton />
          </div>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout hideHeader={true}>
      <WorksHeader 
        activeFilter={selectedType} 
        setActiveFilter={setSelectedType}
        worksCount={works.length}
      />
      <div className="max-w-4xl mx-auto px-4">
        {/* ローディング状態 */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-8">
              {childFilteredWorks.map((work, index) => (
                <div 
                  key={work.id} 
                  className="animate-fade-in" 
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <WorkCard 
                    work={work} 
                    onView={() => handleViewWork(work)}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* カスタムアニメーションのためのスタイル */}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .animate-twinkle {
          animation: twinkle 2s infinite ease-in-out;
        }
        @keyframes soundwave {
          0% {
            transform: scaleY(0.5);
          }
          50% {
            transform: scaleY(1);
          }
          100% {
            transform: scaleY(0.5);
          }
        }
        .animate-soundwave {
          animation: soundwave 1s ease-in-out infinite;
        }
      `}</style>
    </BaseLayout>
  );
};

export default MyWorks; 

// 名前付きエクスポートを追加
export { MyWorks }; 