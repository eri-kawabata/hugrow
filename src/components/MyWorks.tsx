import React, { memo, useCallback, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Image, Music, Camera, Plus, Filter, X, Palette, Star, MessageCircle } from 'lucide-react';
import { useWorks, Work } from '@/hooks/useWorks';
import { LoadingSpinner } from '@/components/Common/LoadingSpinner';
import { ErrorMessage } from '@/components/Common/ErrorMessage';
import { EmptyState } from '@/components/Common/EmptyState';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

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
    className="flex items-center gap-2 bg-gradient-to-r from-[#8ec5d6] to-[#5d7799] text-white px-4 py-2 rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105"
  >
    <Plus className="h-5 w-5" />
    <span className="font-medium">新しい作品を作る</span>
  </Link>
));

CreateWorkButton.displayName = 'CreateWorkButton';

// 作品カードコンポーネント
const WorkCard = memo(({ work }: { work: Work }) => {
  // 作品タイプを決定（互換性のため）
  const workType = work.type || 'drawing';
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [hasFeedback, setHasFeedback] = useState(false);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [parentName, setParentName] = useState<string>('');
  
  // お気に入り状態とフィードバック状態を読み込む
  useEffect(() => {
    const loadFavoriteAndFeedbackStatus = async () => {
      if (!user) return;
      
      try {
        // お気に入り状態を確認
        const { data: favoriteData, error: favoriteError } = await supabase
          .from('favorites')
          .select('*')
          .eq('user_id', user.id)
          .eq('work_id', work.id)
          .single();
          
        if (!favoriteError) {
          setIsFavorite(true);
        }
        
        // フィードバック数を確認
        const { data: feedbackData, error: feedbackError } = await supabase
          .from('work_feedback')
          .select('id, user_id')
          .eq('work_id', work.id);
          
        console.log('作品ID:', work.id, 'フィードバックデータ:', feedbackData);
          
        if (!feedbackError && feedbackData && feedbackData.length > 0) {
          setHasFeedback(true);
          setFeedbackCount(feedbackData.length);
          
          try {
            // 保護者のユーザーIDを取得
            const userId = feedbackData[0].user_id;
            
            // プロフィール情報を取得 - single()を使わない
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('display_name')
              .eq('user_id', userId);
              
            if (!profileError && profileData && profileData.length > 0 && profileData[0].display_name) {
              console.log('保護者名を設定:', profileData[0].display_name);
              setParentName(profileData[0].display_name);
            } else {
              console.log('保護者プロフィールが見つかりません');
              setParentName('保護者');
            }
          } catch (profileErr) {
            console.error('プロフィール取得エラー:', profileErr);
            setParentName('保護者');
          }
        }
      } catch (err) {
        console.error('状態の読み込みに失敗しました:', err);
      }
    };
    
    loadFavoriteAndFeedbackStatus();
  }, [work.id, user]);

  // サムネイルをレンダリングする関数
  const renderThumbnail = () => {
    if (work.content_url) {
      // 実際のコンテンツURLがある場合
      if (workType === 'drawing' || workType === 'photo') {
        return (
          <div className="w-full h-40 overflow-hidden rounded-t-[24px] relative">
            <img 
              src={work.content_url} 
              alt={work.title} 
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              loading="lazy"
            />
          </div>
        );
      }
    } else if (workType === 'drawing') {
      // お絵かきのデフォルトサムネイル
      return (
        <div className="w-full h-40 overflow-hidden rounded-t-[24px] bg-gradient-to-br from-[#8ec5d6]/30 to-white flex items-center justify-center relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <div className="w-32 h-32 border-4 border-[#8ec5d6]/30 rounded-full"></div>
            <div className="w-24 h-24 border-4 border-[#8ec5d6]/40 rounded-full absolute"></div>
            <div className="w-16 h-16 border-4 border-[#8ec5d6]/50 rounded-full absolute"></div>
          </div>
          <Palette className="h-16 w-16 text-[#5d7799]/40" />
        </div>
      );
    } else if (workType === 'audio') {
      // 音声のデフォルトサムネイル
      return (
        <div className="w-full h-40 overflow-hidden rounded-t-[24px] bg-gradient-to-br from-[#f5f6bf]/30 to-white flex items-center justify-center relative">
          <div className="flex flex-col items-center">
            <Music className="h-16 w-16 text-[#5d7799]/40" />
            <div className="flex space-x-1 mt-2">
              {[3, 5, 4, 6, 2, 4, 3].map((h, i) => (
                <div 
                  key={i} 
                  className="w-1 bg-[#5d7799]/30 rounded-full animate-pulse" 
                  style={{ 
                    height: `${h * 4}px`,
                    animationDelay: `${i * 0.1}s`
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      );
    } else if (workType === 'photo') {
      // 写真のデフォルトサムネイル
      return (
        <div className="w-full h-40 overflow-hidden rounded-t-[24px] bg-gradient-to-br from-[#f7c5c2]/30 to-white flex items-center justify-center relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <div className="w-32 h-32 border-4 border-[#f7c5c2]/30 rounded-full"></div>
            <div className="w-24 h-24 border-4 border-[#f7c5c2]/40 rounded-full absolute"></div>
            <div className="w-16 h-16 border-4 border-[#f7c5c2]/50 rounded-full absolute"></div>
          </div>
          <Camera className="h-16 w-16 text-[#5d7799]/40" />
        </div>
      );
    }
    
    // デフォルトのサムネイル
    return (
      <div className="w-full h-40 overflow-hidden rounded-t-[24px] bg-gray-100 flex items-center justify-center">
        <Image className="h-16 w-16 text-gray-300" />
      </div>
    );
  };

  // 作品タイプに応じたラベルとカラーを取得
  const getTypeInfo = () => {
    switch (workType) {
      case 'drawing':
        return {
          label: 'お絵かき',
          color: 'bg-[#8ec5d6]'
        };
      case 'audio':
        return {
          label: '音声',
          color: 'bg-[#f5f6bf]'
        };
      case 'photo':
        return {
          label: '写真',
          color: 'bg-[#f7c5c2]'
        };
      default:
        return {
          label: '作品',
          color: 'bg-gray-500'
        };
    }
  };

  const { label, color } = getTypeInfo();

  return (
    <Link to={`/child/works/${work.id}`} className="block">
      <div className="bg-white rounded-[24px] shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-[#5d7799]/10 relative">
        {renderThumbnail()}
        
        {/* タイプラベル */}
        <div className={`absolute top-3 right-3 ${color} text-white text-xs px-2 py-1 rounded-full shadow-md`}>
          {label}
        </div>
        
        {/* お気に入りとフィードバックのアイコン */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isFavorite && (
            <div className="bg-yellow-100 p-2 rounded-full shadow-md">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            </div>
          )}
          
          {hasFeedback && (
            <div className="bg-indigo-100 p-2 rounded-full shadow-md group relative">
              <MessageCircle className="h-4 w-4 text-indigo-500" />
              {feedbackCount > 1 && (
                <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                  {feedbackCount}
                </span>
              )}
              
              {/* 保護者名のツールチップ */}
              <div className="absolute left-full ml-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {parentName ? `${parentName}さんからのフィードバック` : '保護者からのフィードバック'}
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-bold text-[#5d7799] text-lg mb-1 truncate">{work.title}</h3>
          <p className="text-gray-500 text-sm">
            {new Date(work.created_at).toLocaleDateString('ja-JP')}
          </p>
        </div>
      </div>
    </Link>
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
  const isActive = type === activeFilter;
  
  const getFilterInfo = () => {
    switch (type) {
      case 'all':
        return {
          label: 'すべて',
          icon: <Filter className="h-5 w-5" />
        };
      case 'drawing':
        return {
          label: 'お絵かき',
          icon: <Palette className="h-5 w-5" />
        };
      case 'audio':
        return {
          label: '音声',
          icon: <Music className="h-5 w-5" />
        };
      case 'photo':
        return {
          label: '写真',
          icon: <Camera className="h-5 w-5" />
        };
      default:
        return {
          label: 'すべて',
          icon: <Filter className="h-5 w-5" />
        };
    }
  };

  const { label, icon } = getFilterInfo();

  return (
    <button
      onClick={() => onClick(type)}
      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
        isActive 
          ? 'bg-[#5d7799] text-white shadow-md' 
          : 'bg-white text-[#5d7799] hover:bg-[#5d7799]/10'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
      {isActive && (
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

const WorksGrid = memo(({ works }: { works: Work[] }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
    {works.map((work, index) => (
      <div 
        key={work.id} 
        className="animate-fade-in" 
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <WorkCard work={work} />
      </div>
    ))}
  </div>
));

WorksGrid.displayName = 'WorksGrid';

const Header = memo(({ 
  activeFilter, 
  setActiveFilter 
}: { 
  activeFilter: WorkTypeFilter, 
  setActiveFilter: (filter: WorkTypeFilter) => void 
}) => (
  <div>
    <div className="bg-gradient-to-r from-[#8ec5d6] via-[#f7c5c2] to-[#f5f6bf] px-4 py-12 rounded-b-[40px] shadow-lg relative overflow-hidden">
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
      <div className="relative z-10">
        <h1 className="text-4xl font-bold text-white text-center drop-shadow-md mb-2">
          わたしの作品
        </h1>
        <p className="text-white/90 text-center text-sm max-w-md mx-auto">
          あなたの素敵な作品をここで見ることができます
        </p>
      </div>
    </div>
    
    <div className="px-6 -mt-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-full shadow-lg p-2 flex flex-wrap items-center justify-center gap-3 max-w-2xl mx-auto">
        <FilterButton type="all" activeFilter={activeFilter} onClick={setActiveFilter} />
        <FilterButton type="drawing" activeFilter={activeFilter} onClick={setActiveFilter} />
        <FilterButton type="audio" activeFilter={activeFilter} onClick={setActiveFilter} />
        <FilterButton type="photo" activeFilter={activeFilter} onClick={setActiveFilter} />
      </div>
    </div>
  </div>
));

Header.displayName = 'Header';

export function MyWorks() {
  const { works, loading, error, fetchWorks } = useWorks();
  const [activeFilter, setActiveFilter] = useState<WorkTypeFilter>('all');
  const [filteredWorks, setFilteredWorks] = useState<Work[]>([]);

  // フィルターが変更されたときに作品をフィルタリング
  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredWorks(works);
    } else {
      setFilteredWorks(works.filter(work => work.type === activeFilter));
    }
  }, [activeFilter, works]);

  const handleRetry = useCallback(() => {
    fetchWorks();
  }, [fetchWorks]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fbfd]">
        <div className="max-w-5xl mx-auto">
          <Header activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
          <div className="px-6 pt-8">
            <div className="flex justify-center items-center min-h-[50vh] bg-white rounded-[32px] shadow-sm p-8">
              <LoadingSpinner size="lg" message="作品を読み込んでいます..." />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fbfd]">
        <div className="max-w-5xl mx-auto">
          <Header activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
          <div className="px-6 pt-8">
            <div className="bg-white rounded-[32px] shadow-sm p-8">
              <ErrorMessage
                title="作品の読み込みに失敗しました"
                message="ネットワーク接続を確認して、もう一度お試しください。"
                actionLabel="再試行"
                onAction={handleRetry}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fbfd]">
      <div className="max-w-5xl mx-auto">
        <Header activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
        <div className="space-y-12 pb-28">
          <div className="px-6 pt-8">
            {filteredWorks.length === 0 ? (
              <div className="bg-white rounded-[32px] shadow-sm p-8 mt-6">
                <EmptyState
                  title={`${filterTypeToJapanese(activeFilter)}作品がありません`}
                  message="新しい作品を作ってみましょう！"
                  actionLabel="作品を作る"
                  actionTo="/child/works/new"
                  icon={<Image className="h-16 w-16 text-[#5d7799]/50" />}
                />
              </div>
            ) : (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-bold text-[#5d7799]">
                    {activeFilter === 'all' ? 'すべての作品' : `${filterTypeToJapanese(activeFilter)}作品`}
                    <span className="ml-2 text-sm font-normal text-[#5d7799]/70">
                      ({filteredWorks.length}件)
                    </span>
                  </h2>
                  <CreateWorkButton />
                </div>
                <WorksGrid works={filteredWorks} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 