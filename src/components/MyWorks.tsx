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
import { FaPlus, FaTrash, FaEye } from 'react-icons/fa';
import { formatDate } from '../utils/formatDate';
import { useConfirm } from '../hooks/useConfirm';
import toast from 'react-hot-toast';
import { useProfile } from '@/hooks/useProfile';

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
          .select('id, user_id')
          .eq('work_id', work.id);
          
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
              setParentName(profileData[0].display_name);
            } else {
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
      if (work.type === 'drawing' || work.type === 'photo') {
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
    } else if (work.type === 'drawing') {
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
    } else if (work.type === 'audio') {
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
    } else if (work.type === 'photo') {
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
    switch (work.type) {
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
    
    const filtered = filteredWorks.filter(work => work.profile_id === selectedChildProfileId);
    console.log('MyWorks - 子供プロファイルIDでフィルタリング:', selectedChildProfileId);
    console.log('MyWorks - フィルタリング前の作品数:', filteredWorks.length, 'フィルタリング後の作品数:', filtered.length);
    
    return filtered;
  }, [filteredWorks, selectedChildProfileId]);

  // 作品の削除
  const handleDelete = async (id: string) => {
    if (window.confirm('本当にこの作品を削除しますか？')) {
      await deleteWork(id);
    }
  };

  // 作品の詳細表示
  const handleViewWork = (work: Work) => {
    navigate(`/child/works/${work.id}`);
  };

  // 新しい作品の作成
  const handleCreateWork = (type: 'drawing' | 'audio' | 'photo') => {
    navigate(`/child/works/new?type=${type}`);
  };

  // フィルター情報を取得する関数
  const getFilterInfo = () => {
    return [
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
    ];
  };

  // 作品がない場合のメッセージ
  if (childFilteredWorks.length === 0 && !loading) {
    console.log('MyWorks - 表示する作品がありません - selectedChildProfileId:', selectedChildProfileId);
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="mb-4">
            <Image className="w-16 h-16 text-gray-400 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">作品がありません</h2>
          <p className="text-gray-500 mb-6">新しい作品を作成してみましょう！</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => handleCreateWork('drawing')}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-200 transition-colors"
            >
              <Pencil className="w-4 h-4" />
              お絵かき
            </button>
            <button
              onClick={() => handleCreateWork('audio')}
              className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full hover:bg-amber-200 transition-colors"
            >
              <Mic className="w-4 h-4" />
              ボイスメモ
            </button>
            <button
              onClick={() => handleCreateWork('photo')}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full hover:bg-emerald-200 transition-colors"
            >
              <Camera className="w-4 h-4" />
              写真
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 作品一覧の表示
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">作品一覧</h1>
        
        <div className="flex gap-2">
          {getFilterInfo().map(filter => (
            <button
              key={filter.type}
              onClick={() => setSelectedType(filter.type)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm ${
                selectedType === filter.type
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } transition-colors`}
            >
              {filter.icon}
              {filter.label}
              {filter.type === 'all' && (
                <span className="ml-1 px-1.5 py-0.5 bg-indigo-200 text-indigo-800 rounded-full text-xs">
                  {works.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {childFilteredWorks.map(work => (
              <WorkCard
                key={work.id}
                work={work}
                onView={() => handleViewWork(work)}
                onDelete={() => handleDelete(work.id)}
              />
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <div className="fixed bottom-24 sm:static flex gap-3">
              <button
                onClick={() => handleCreateWork('drawing')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-lg"
              >
                <Pencil className="w-4 h-4" />
                お絵かき
              </button>
              <button
                onClick={() => handleCreateWork('audio')}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-colors shadow-lg"
              >
                <Mic className="w-4 h-4" />
                ボイスメモ
              </button>
              <button
                onClick={() => handleCreateWork('photo')}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors shadow-lg"
              >
                <Camera className="w-4 h-4" />
                写真
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MyWorks; 

// 名前付きエクスポートを追加
export { MyWorks }; 