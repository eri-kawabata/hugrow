import React, { useState, useEffect, memo } from 'react';
import { Image as ImageIcon, MessageCircle, Calendar, Filter, Search, X, Music, Camera, Palette, Heart, ThumbsUp, Star, Award, Smile, PenLine, MessageSquare, Sparkles, User, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import './ParentWorks.css'; // アニメーション用のCSSをインポート

// Work型の定義
interface Work {
  id: string;
  title: string;
  description?: string;
  media_url?: string;
  content_url?: string;
  media_type: 'drawing' | 'photo' | 'audio' | 'image' | 'video';
  type?: 'drawing' | 'photo' | 'audio';
  user_id: string;
  profile_id?: string;
  created_at: string;
  updated_at: string;
}

// 子供プロファイル型の定義
interface ChildProfile {
  id: string;
  username: string;
  avatar_url?: string;
  user_id: string;
}

type Feedback = {
  id: string;
  feedback: string;
  created_at: string;
  user_id: string;
  username: string | null;
  likes?: number;
  liked_by_me?: boolean;
  stamp?: string;
};

// 作品タイプのフィルター型
type WorkTypeFilter = 'all' | 'drawing' | 'photo' | 'audio';

// メディアURLを安全に処理する関数
const getSafeMediaUrl = (url: string) => {
  if (!url) {
    // URLがない場合はデータURIのプレースホルダー画像を返す
    return 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20300%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_189e113b0f1%20text%20%7B%20fill%3A%23AAAAAA%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A20pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_189e113b0f1%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23EEEEEE%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22148.5%22%20y%3D%22157.9%22%3ENo Image%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
  }
  
  try {
    // URLをトリムして余分な空白を削除
    url = url.trim();
    
    // URLが既に完全なURLの場合はそのまま返す
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // データURIの場合はそのまま返す
    if (url.startsWith('data:')) {
      return url;
    }
    
    // Supabaseのストレージパスの場合
    if (url.includes('storage/v1/object/public')) {
      // 既にURLの形式になっているが、プロトコルが欠けている場合
      if (url.startsWith('//')) {
        return `https:${url}`;
      }
      
      // 相対パスの場合
      if (url.startsWith('/')) {
        return `${window.location.origin}${url}`;
      }
    }
    
    // Supabaseの直接ストレージURLを構築
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    if (supabaseUrl) {
      // パスが既にworks/で始まっている場合
      if (url.includes('works/')) {
        return `${supabaseUrl}/storage/v1/object/public/${url}`;
      } else {
        // 完全なパスを構築
        return `${supabaseUrl}/storage/v1/object/public/works/${url}`;
      }
    }
    
    // それ以外の場合は相対パスとして扱う
    return `${window.location.origin}/${url}`;
  } catch (error) {
    console.error('Error processing URL:', error, url);
    // エラーが発生した場合はデータURIのプレースホルダー画像を返す
    return 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20300%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_189e113b0f1%20text%20%7B%20fill%3A%23AAAAAA%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A20pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_189e113b0f1%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23EEEEEE%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22148.5%22%20y%3D%22157.9%22%3ENo Image%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
  }
};

// スタンプの種類
const STAMPS = [
  { id: 'heart', icon: <Heart className="h-6 w-6" />, label: 'ハート', color: 'text-rose-500' },
  { id: 'thumbsup', icon: <ThumbsUp className="h-6 w-6" />, label: 'いいね', color: 'text-blue-500' },
  { id: 'star', icon: <Star className="h-6 w-6" />, label: 'スター', color: 'text-amber-500' },
  { id: 'award', icon: <Award className="h-6 w-6" />, label: '賞', color: 'text-purple-500' },
  { id: 'smile', icon: <Smile className="h-6 w-6" />, label: 'スマイル', color: 'text-green-500' },
];

// 作品タイプに応じたアイコンを返すコンポーネント
const WorkTypeIcon = memo(({ type }: { type: string }) => {
  const icons = {
    drawing: <Palette className="h-5 w-5" />,
    audio: <Music className="h-5 w-5" />,
    photo: <Camera className="h-5 w-5" />,
  };

  return icons[type] || <ImageIcon className="h-5 w-5" />;
});

WorkTypeIcon.displayName = 'WorkTypeIcon';

// フィルターボタンコンポーネント
const FilterButton = memo(({ type, activeFilter, onClick }: { 
  type: WorkTypeFilter, 
  activeFilter: WorkTypeFilter, 
  onClick: (type: WorkTypeFilter) => void 
}) => {
  // フィルタータイプに基づくラベルとアイコンを設定
  const filterConfig = {
    all: { 
      label: 'すべて', 
      icon: <Filter className="h-4 w-4" />,
      color: 'bg-gradient-to-r from-purple-500 to-indigo-600'
    },
    drawing: { 
      label: '絵', 
      icon: <Palette className="h-4 w-4" />,
      color: 'bg-gradient-to-r from-orange-400 to-pink-500'
    },
    audio: { 
      label: '音声', 
      icon: <Music className="h-4 w-4" />,
      color: 'bg-gradient-to-r from-green-400 to-teal-500'
    },
    photo: { 
      label: '写真', 
      icon: <Camera className="h-4 w-4" />,
      color: 'bg-gradient-to-r from-blue-400 to-cyan-500'
    },
  };

  const isActive = type === activeFilter;
  const config = filterConfig[type];

  return (
    <button
      onClick={() => onClick(type)}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
        isActive 
          ? `${config.color} text-white shadow-lg` 
          : `bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:shadow`
      }`}
    >
      <span className={`${isActive ? 'animate-pulse' : ''}`}>
        {config.icon}
      </span>
      <span>{config.label}</span>
    </button>
  );
});

FilterButton.displayName = 'FilterButton';

// フィードバックアイテムコンポーネント
const FeedbackItem = memo(({ feedback, onLike }: { 
  feedback: Feedback, 
  onLike: (id: string) => void 
}) => {
  // フィードバックテキストからスタンプ情報を抽出
  let feedbackText = feedback.feedback || '';
  let stampId = null;
  
  // スタンプ情報の抽出（[スタンプ名] の形式）
  const stampMatch = feedbackText.match(/^\[(ハート|いいね|スター|賞|スマイル)\]\s*/);
  if (stampMatch) {
    const stampLabel = stampMatch[1];
    // スタンプラベルからIDを逆引き
    const foundStamp = STAMPS.find(s => s.label === stampLabel);
    if (foundStamp) {
      stampId = foundStamp.id;
      // スタンプ情報を除去したテキストを設定
      feedbackText = feedbackText.replace(stampMatch[0], '');
    }
  }
  
  const stamp = stampId ? STAMPS.find(s => s.id === stampId) : null;
  
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full p-2 shadow-sm">
            <User className="h-4 w-4 text-indigo-600" />
          </div>
          <span className="font-medium text-gray-800">{feedback.username || '匿名'}</span>
        </div>
        <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
          {new Date(feedback.created_at).toLocaleDateString('ja-JP')}
        </span>
      </div>
      
      <div className="mt-3">
        {stamp && (
          <div className="mb-2 inline-flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
            <span className={`${stamp.color}`}>{stamp.icon}</span>
            <span className="text-sm text-amber-700 font-medium">{stamp.label}</span>
          </div>
        )}
        
        {feedbackText && feedbackText !== 'スタンプを送りました' && (
          <p className="text-gray-700 whitespace-pre-wrap">{feedbackText}</p>
        )}
      </div>
      
      <div className="mt-3 flex justify-end">
        <button 
          onClick={() => onLike(feedback.id)}
          className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full transition-all duration-200 ${
            feedback.liked_by_me 
              ? 'text-rose-600 bg-rose-50 border border-rose-200' 
              : 'text-gray-500 hover:bg-gray-100 border border-transparent hover:border-gray-200'
          }`}
          data-feedback-id={feedback.id}
        >
          <Heart className={`h-4 w-4 heart-icon ${feedback.liked_by_me ? 'fill-rose-600' : ''}`} />
          <span>{feedback.likes || 0}</span>
        </button>
      </div>
    </div>
  );
});

FeedbackItem.displayName = 'FeedbackItem';

// 作品カードコンポーネント
const WorkCard = memo(({ work, onFeedbackClick, feedbackCount = 0, getSafeMediaUrl }: { 
  work: Work, 
  onFeedbackClick: (work: Work) => void,
  feedbackCount?: number,
  getSafeMediaUrl: (url: string) => string
}) => {
  const workType = work.type || work.media_type;
  const typeLabels = {
    drawing: 'お絵かき',
    audio: '音声',
    photo: '写真',
  };
  
  const typeColors = {
    drawing: 'bg-gradient-to-r from-orange-400 to-pink-500',
    audio: 'bg-gradient-to-r from-green-400 to-teal-500',
    photo: 'bg-gradient-to-r from-blue-400 to-cyan-500',
  };
  
  const typeLabel = typeLabels[workType] || '作品';
  const typeColor = typeColors[workType] || 'bg-gradient-to-r from-purple-500 to-indigo-600';
  
  // media_urlとcontent_urlの両方をチェック
  const mediaUrl = work.media_url || work.content_url;

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 animate-fadeIn transform hover:-translate-y-1">
      <Link
        to={`/parent/works/${work.id}`}
        className="block"
      >
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          {workType === 'drawing' || workType === 'photo' ? (
            <img 
              src={getSafeMediaUrl(mediaUrl)} 
              alt={work.title} 
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20300%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_189e113b0f1%20text%20%7B%20fill%3A%23AAAAAA%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A20pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_189e113b0f1%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23EEEEEE%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22148.5%22%20y%3D%22157.9%22%3ENo Image%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <Music className="h-16 w-16 text-gray-300" />
            </div>
          )}
          <div className={`absolute top-2 right-2 ${typeColor} text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm shadow-md`}>
            {typeLabel}
          </div>
        </div>
      </Link>
      
      <div className="p-4">
        <h2 className="font-semibold text-gray-800 text-lg mb-1 line-clamp-1">{work.title}</h2>
        
        {work.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{work.description}</p>
        )}
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{new Date(work.created_at).toLocaleDateString('ja-JP')}</span>
          </div>
          
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onFeedbackClick(work);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              feedbackCount > 0 
                ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <MessageCircle className={`h-4 w-4 ${feedbackCount > 0 ? 'text-indigo-500' : ''}`} />
            <span>
              {feedbackCount > 0 ? `${feedbackCount}件` : 'フィードバック'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
});

WorkCard.displayName = 'WorkCard';

// ヘッダーコンポーネント
const Header = memo(({ 
  activeFilter, 
  setActiveFilter,
  searchTerm,
  setSearchTerm
}: { 
  activeFilter: WorkTypeFilter, 
  setActiveFilter: (filter: WorkTypeFilter) => void,
  searchTerm: string,
  setSearchTerm: (term: string) => void
}) => (
  <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
          子どもの作品一覧
        </h1>
        
        <div className="relative max-w-md w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-indigo-400" />
          </div>
          <input
            type="text"
            placeholder="作品を検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-10 py-2 border border-indigo-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-indigo-50 text-indigo-900 placeholder-indigo-300"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-5 w-5 text-indigo-400 hover:text-indigo-500" />
            </button>
          )}
        </div>
      </div>
      
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <FilterButton type="all" activeFilter={activeFilter} onClick={setActiveFilter} />
        <FilterButton type="drawing" activeFilter={activeFilter} onClick={setActiveFilter} />
        <FilterButton type="photo" activeFilter={activeFilter} onClick={setActiveFilter} />
        <FilterButton type="audio" activeFilter={activeFilter} onClick={setActiveFilter} />
      </div>
    </div>
  </div>
));

Header.displayName = 'Header';

// 空の状態コンポーネント
const EmptyState = memo(({ filter }: { filter: WorkTypeFilter }) => {
  const filterLabels = {
    all: 'すべての',
    drawing: '絵の',
    photo: '写真の',
    audio: '音声の'
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-8 mt-6 text-center animate-fadeIn">
      <div className="inline-flex items-center justify-center p-4 bg-indigo-50 rounded-full mb-4">
        <ImageIcon className="h-12 w-12 text-indigo-300" />
      </div>
      <h3 className="text-xl font-medium text-gray-700 mb-2">
        {filterLabels[filter]}作品が見つかりません
      </h3>
      <p className="text-gray-500">
        検索条件に一致する作品はありません。
      </p>
    </div>
  );
});

EmptyState.displayName = 'EmptyState';

export default function ParentWorks() {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filter, setFilter] = useState<WorkTypeFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [childrenStats, setChildrenStats] = useState<{[key: string]: {total: number, drawing: number, photo: number, audio: number}}>({});

  // 子供一覧を取得
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 親のプロファイルIDを取得
        const { data: parentProfile, error: parentError } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .eq('role', 'parent')
          .single();

        if (parentError) {
          console.error('親プロファイル取得エラー:', parentError);
          return;
        }

        // 親に関連付けられた子供を取得
        const { data: childProfiles, error: childrenError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, user_id')
          .eq('parent_id', parentProfile.id)
          .eq('role', 'child');

        if (childrenError) {
          console.error('子供プロファイル取得エラー:', childrenError);
          return;
        }

        setChildren(childProfiles || []);
        
        // 最初の子供を選択
        if (childProfiles && childProfiles.length > 0) {
          setSelectedChildId(childProfiles[0].id);
        }
      } catch (err) {
        console.error('子供データ取得エラー:', err);
      }
    };

    fetchChildren();
  }, []);

  // 子供ごとの作品統計を取得
  useEffect(() => {
    const fetchChildrenStats = async () => {
      if (children.length === 0) return;
      
      const stats: {[key: string]: {total: number, drawing: number, photo: number, audio: number}} = {};
      
      for (const child of children) {
        try {
          // 子供の作品数を取得
          const { data, error } = await supabase
            .from('works')
            .select('id, type')
            .eq('profile_id', child.id);
        
      if (error) {
            console.error(`${child.username}の作品統計取得エラー:`, error);
            continue;
          }
          
          // 作品タイプごとにカウント
          const typeCounts = {
            total: data.length,
            drawing: data.filter(w => w.type === 'drawing').length,
            photo: data.filter(w => w.type === 'photo').length,
            audio: data.filter(w => w.type === 'audio').length
          };
          
          stats[child.id] = typeCounts;
        } catch (err) {
          console.error(`${child.username}の作品統計取得中にエラー:`, err);
        }
      }
      
      setChildrenStats(stats);
    };
    
    fetchChildrenStats();
  }, [children]);

  // 選択した子供の作品を取得
  useEffect(() => {
  const fetchWorks = async () => {
      if (!selectedChildId) return;

    try {
      setLoading(true);
        setError(null);

        // 選択した子供の作品を取得
        const { data, error } = await supabase
        .from('works')
        .select('*')
          .eq('profile_id', selectedChildId)
        .order('created_at', { ascending: false });
      
        if (error) throw error;
      
      // メディアタイプの正規化
        const normalizedWorks = (data || []).map(work => {
        // 元のメディアタイプを保存
        const originalType = work.media_type;
        let normalizedType = originalType;
        
        // 正規化ロジック
        if (originalType === 'image') {
          normalizedType = 'drawing';
        } else if (originalType === 'video') {
          normalizedType = 'photo';
        }
        
        // typeフィールドがある場合はそれを優先
        if (work.type) {
          normalizedType = work.type;
        }
        
        return {
          ...work,
            type: normalizedType,
            media_type: normalizedType
        };
      });
      
        setWorks(normalizedWorks);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

      fetchWorks();
  }, [selectedChildId]);

  // 作品をフィルタリング
  const filteredWorks = works.filter(work => {
    // タイプでフィルタリング
    const typeMatch = filter === 'all' || work.type === filter;
    
    // 検索語でフィルタリング
    const searchMatch = !searchTerm || 
      work.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      work.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return typeMatch && searchMatch;
  });

  // 子供選択コンポーネント
  const ChildSelector = () => (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
      <h3 className="text-lg font-semibold text-[#5d7799] mb-4">お子様を選択</h3>
      <div className="flex flex-wrap gap-3">
                  {children.map(child => (
                    <button
                      key={child.id}
            onClick={() => setSelectedChildId(child.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                        selectedChildId === child.id 
                ? 'bg-[#5d7799] text-white' 
                : 'bg-gray-100 text-[#5d7799] hover:bg-gray-200'
                      }`}
                    >
                        {child.avatar_url ? (
                          <img 
                            src={child.avatar_url} 
                            alt={child.username} 
                className="w-6 h-6 rounded-full object-cover"
                          />
                        ) : (
              <User className="w-5 h-5" />
            )}
            <span>{child.username}</span>
            {childrenStats[child.id] && (
              <span className="text-xs opacity-80">({childrenStats[child.id].total})</span>
            )}
                    </button>
                  ))}
                </div>
              </div>
  );

  // 子供の作品統計コンポーネント
  const ChildStats = () => {
    if (!selectedChildId || !childrenStats[selectedChildId]) return null;
    
    const stats = childrenStats[selectedChildId];
    const selectedChild = children.find(c => c.id === selectedChildId);
    
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <h3 className="text-lg font-semibold text-[#5d7799] mb-2">
          {selectedChild?.username}の作品統計
        </h3>
        <div className="grid grid-cols-4 gap-3 mt-4">
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-blue-700">合計</div>
                </div>
          <div className="bg-purple-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.drawing}</div>
            <div className="text-sm text-purple-700">お絵かき</div>
                      </div>
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{stats.photo}</div>
            <div className="text-sm text-green-700">写真</div>
                          </div>
          <div className="bg-amber-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-amber-600">{stats.audio}</div>
            <div className="text-sm text-amber-700">音声</div>
                        </div>
                        </div>
                          </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fbfd] pb-20">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#5d7799]">お子様の作品一覧</h1>
          <div className="flex gap-2">
            {/* 検索ボックス */}
            <div className="relative">
              <input
                type="text"
                placeholder="作品を検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5d7799] w-64"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              {searchTerm && (
              <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5"
                >
                  <X className="h-5 w-5 text-gray-400" />
              </button>
              )}
            </div>
            
            {/* フィルターボタン */}
                <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50"
            >
              <Filter className="h-5 w-5 text-[#5d7799]" />
              <span className="text-[#5d7799]">
                {filter === 'all' ? 'すべて' : 
                 filter === 'drawing' ? 'お絵かき' : 
                 filter === 'photo' ? '写真' : '音声'}
                    </span>
                </button>
              </div>
                  </div>
                  
        {/* フィルターメニュー */}
        {isFilterOpen && (
          <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex gap-3">
            {['all', 'drawing', 'photo', 'audio'].map((type) => (
                        <button
                key={type}
                onClick={() => {
                  setFilter(type as WorkTypeFilter);
                  setIsFilterOpen(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  filter === type 
                    ? 'bg-[#5d7799] text-white' 
                    : 'bg-gray-100 text-[#5d7799] hover:bg-gray-200'
                }`}
              >
                {type === 'all' && <Filter className="h-5 w-5" />}
                {type === 'drawing' && <Palette className="h-5 w-5" />}
                {type === 'photo' && <Camera className="h-5 w-5" />}
                {type === 'audio' && <Music className="h-5 w-5" />}
                <span>
                  {type === 'all' ? 'すべて' : 
                   type === 'drawing' ? 'お絵かき' : 
                   type === 'photo' ? '写真' : '音声'}
                </span>
                        </button>
                      ))}
                </div>
              )}
        
        {/* 子供選択UI */}
        <ChildSelector />
        
        {/* 選択した子供の統計 */}
        {selectedChildId && <ChildStats />}
        
        {/* 作品一覧 */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5d7799]"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6">
            <p className="font-semibold">エラーが発生しました</p>
            <p className="text-sm">{error.message}</p>
                <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-full text-sm"
                >
              再読み込み
                </button>
            </div>
        ) : filteredWorks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-gray-100 p-4 rounded-full">
                <ImageIcon className="h-10 w-10 text-gray-400" />
          </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchTerm ? '検索結果がありません' : '作品がありません'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? '検索条件を変更してみてください' 
                : 'お子様がまだ作品を作成していません'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorks.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
        </div>
      )}
      </div>
    </div>
  );
}

// 名前付きエクスポートを追加
export { ParentWorks };