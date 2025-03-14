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
  created_at: string;
  updated_at: string;
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

export function ParentWorks() {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [feedback, setFeedback] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<WorkTypeFilter>('all');
  const [isParentMode, setIsParentMode] = useState(false);
  const [workToDelete, setWorkToDelete] = useState<Work | null>(null);
  const [previewWork, setPreviewWork] = useState<Work | null>(null);
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackCounts, setFeedbackCounts] = useState<Record<string, number>>({});
  const [likesLoading, setLikesLoading] = useState<Record<string, boolean>>({});
  const [selectedStamp, setSelectedStamp] = useState<string | null>(null);
  const [showFeedbacks, setShowFeedbacks] = useState(false);
  const [children, setChildren] = useState<{id: string, username: string, avatar_url?: string}[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [compareMode, setCompareMode] = useState(false);
  const [childrenWorks, setChildrenWorks] = useState<Record<string, Work[]>>({});
  const [loadingChildrenWorks, setLoadingChildrenWorks] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [selectedChildrenForTimeline, setSelectedChildrenForTimeline] = useState<string[]>([]);
  const [timelineWorks, setTimelineWorks] = useState<(Work & { childName: string, childAvatar?: string })[]>([]);

  useEffect(() => {
    checkParentMode();
    fetchChildren();
    fetchWorks();
  }, [selectedChildId]);

  useEffect(() => {
    if (compareMode && children.length > 1) {
      fetchAllChildrenWorks();
    }
  }, [compareMode]);

  useEffect(() => {
    if (compareMode && viewMode === 'timeline' && selectedChildrenForTimeline.length > 0) {
      generateTimelineData();
    }
  }, [viewMode, selectedChildrenForTimeline, childrenWorks]);

  useEffect(() => {
    if (selectedWork) {
      fetchFeedbackForWork(selectedWork.id);
    }
  }, [selectedWork]);

  // 画像をプリロードする関数
  const preloadImages = (works: Work[]) => {
    works.forEach(work => {
      if (work.media_type === 'drawing' || work.media_type === 'photo') {
        const img = new window.Image();
        // media_urlとcontent_urlの両方をチェック
        const mediaUrl = work.media_url || work.content_url;
        img.src = getSafeMediaUrl(mediaUrl);
      }
    });
  };

  // 作品データが更新されたらプリロード
  useEffect(() => {
    if (works.length > 0) {
      preloadImages(works);
    }
  }, [works]);

  // フィルターが変更されたときにコンソールに出力
  useEffect(() => {
    console.log('フィルター変更:', filter);
    console.log('作品数:', works.length);
    
    // 各メディアタイプの数をカウント
    const counts = {
      drawing: 0,
      image: 0,
      photo: 0,
      video: 0,
      audio: 0,
      other: 0
    };
    
    works.forEach(work => {
      console.log(`作品: ${work.title}, メディアタイプ: ${work.media_type}`);
      if (work.media_type === 'drawing') counts.drawing++;
      else if (work.media_type === 'image') counts.image++;
      else if (work.media_type === 'photo') counts.photo++;
      else if (work.media_type === 'video') counts.video++;
      else if (work.media_type === 'audio') counts.audio++;
      else counts.other++;
    });
    
    console.log('メディアタイプ別カウント:', counts);
  }, [filter, works]);

  const checkParentMode = async () => {
    if (!supabase) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('ユーザーが認証されていません');
        return;
      }

      console.log('認証ユーザーID:', user.id);

      // 複数行の結果を処理できるように修正
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id);
        
      if (error) {
        console.error('プロファイル取得エラー:', error);
        setIsParentMode(true);
        return;
      }

      console.log('取得したプロファイル:', profiles);

      // データが存在し、少なくとも1つのプロファイルがある場合
      if (profiles && profiles.length > 0) {
        // 親ロールのプロファイルを探す
        const parentProfile = profiles.find(profile => profile.role === 'parent');
        console.log('親ロールのプロファイル:', parentProfile);
        
        // 親ロールのプロファイルが見つかった場合は親モードに設定
        if (parentProfile) {
          setIsParentMode(true);
        } else {
          // 親ロールのプロファイルが見つからない場合は子モードに設定
          setIsParentMode(false);
        }
      } else {
        // プロファイルが見つからない場合はデフォルトで親モードに設定
        console.warn('プロファイルが見つかりません');
        setIsParentMode(true);
      }
    } catch (error) {
      console.error('認証チェックエラー:', error);
      setIsParentMode(true);
    }
  };

  const fetchWorks = async () => {
    if (!supabase) {
      toast.error('データベース接続エラーが発生しました');
      return;
    }

    try {
      setLoading(true);
      
      // URLパラメータから子供のIDを取得
      const urlParams = new URLSearchParams(window.location.search);
      const childId = urlParams.get('child');
      
      console.log('【デバッグ】URLパラメータから取得した子供ID:', childId);
      
      // 子供のIDがURLパラメータにある場合、localStorageに保存
      if (childId) {
        localStorage.setItem('selectedChildId', childId);
        localStorage.setItem('selectedChildProfileId', childId);
        console.log('【デバッグ】localStorageに保存した子供ID:', childId);
        
        // 子供の名前とuser_idも取得して保存
        const { data: childData } = await supabase
          .from('profiles')
          .select('username, user_id')
          .eq('id', childId)
          .maybeSingle();
          
        console.log('【デバッグ】取得した子供データ:', childData);
        
        if (childData) {
          if (childData.username) {
            localStorage.setItem('childName', childData.username);
            console.log('【デバッグ】localStorageに保存した子供名:', childData.username);
          }
          if (childData.user_id) {
            localStorage.setItem('selectedChildUserId', childData.user_id);
            console.log('【デバッグ】localStorageに保存した子供のユーザーID:', childData.user_id);
          }
        }
      } else {
        console.log('【デバッグ】URLパラメータに子供IDがありません');
      }
      
      // クエリを構築
      let query = supabase
        .from('works')
        .select('*')
        .order('created_at', { ascending: false });
      
      // 子供のIDでフィルタリング
      if (childId) {
        // 子供のuser_idを取得
        const childUserId = localStorage.getItem('selectedChildUserId');
        if (childUserId) {
          query = query.eq('user_id', childUserId);
          console.log(`【デバッグ】子供のユーザーID: ${childUserId} でフィルタリングします`);
        } else {
          console.log(`【デバッグ】子供のユーザーIDが見つかりません。プロファイルID: ${childId} でフィルタリングを試みます`);
          query = query.eq('user_id', childId);
        }
      } else {
        // 子供IDがない場合は、親に関連するすべての子供の作品を取得
        const { data: { user } } = await supabase.auth.getUser();
        console.log('【デバッグ】現在のユーザーID:', user?.id);
        
        if (user) {
          const { data: parentProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', user.id)
            .eq('role', 'parent')
            .maybeSingle();
            
          console.log('【デバッグ】取得した親プロファイル:', parentProfile);
            
          if (parentProfile) {
            const { data: children } = await supabase
              .from('profiles')
              .select('id, username')
              .eq('parent_id', parentProfile.id)
              .eq('role', 'child');
              
            console.log('【デバッグ】取得した子供リスト:', children);
              
            if (children && children.length > 0) {
              const childIds = children.map(child => child.id);
              query = query.in('user_id', childIds);
              console.log(`【デバッグ】複数の子供ID: ${childIds.join(', ')} でフィルタリングします`);
            } else {
              console.log('【デバッグ】子供が見つかりません');
            }
          } else {
            console.log('【デバッグ】親プロファイルが見つかりません');
          }
        } else {
          console.log('【デバッグ】ユーザーが認証されていません');
        }
      }
      
      // クエリを実行
      console.log('【デバッグ】実行するクエリ:', query);
      const { data, error } = await query;
      
      console.log('【デバッグ】クエリ結果:', data);
      console.log('【デバッグ】クエリエラー:', error);

      if (error) {
        console.error('作品の取得エラー:', error);
        toast.error('作品の読み込みに失敗しました');
        return;
      }
      
      if (!data) {
        console.warn('作品データが取得できませんでした');
        setWorks([]);
        return;
      }
      
      console.log('取得した作品データ:', data);
      
      // データベースのカラム名を確認
      if (data.length > 0) {
        console.log('データベースのカラム名:', Object.keys(data[0]));
        console.log('最初の作品の詳細データ:', JSON.stringify(data[0], null, 2));
      }
      
      // 各作品のメディアURLをログに出力
      data.forEach(work => {
        // content_urlとmedia_urlの両方をチェック
        const mediaUrl = work.media_url || work.content_url;
        console.log(`作品「${work.title}」のメディアURL:`, mediaUrl);
        console.log(`作品「${work.title}」のメディアタイプ:`, work.media_type);
        console.log(`作品「${work.title}」のタイプ:`, work.type);
      });
      
      // メディアタイプの正規化
      const normalizedData = data.map(work => {
        // 元のメディアタイプを保存
        const originalType = work.media_type;
        let normalizedType = originalType;
        
        // メディアタイプのデバッグ出力
        console.log(`作品「${work.title}」の元のメディアタイプ: ${originalType}`);
        
        // content_urlとmedia_urlの両方をチェック
        let mediaUrl = work.media_url || work.content_url;
        console.log(`作品「${work.title}」のメディアURL: ${mediaUrl}`);
        
        // 正規化ロジック
        if (originalType === 'image') {
          normalizedType = 'drawing';
          console.log(`  → 'image'を'drawing'に変換`);
        } else if (originalType === 'video') {
          normalizedType = 'photo';
          console.log(`  → 'video'を'photo'に変換`);
        }
        
        // typeフィールドがある場合はそれを優先
        if (work.type) {
          normalizedType = work.type;
          console.log(`  → 'type'フィールドを使用: ${work.type}`);
        }
        
        // media_urlが相対パスの場合、完全なURLに変換
        if (mediaUrl && !mediaUrl.startsWith('http://') && !mediaUrl.startsWith('https://') && !mediaUrl.startsWith('data:')) {
          mediaUrl = getSafeMediaUrl(mediaUrl);
          console.log(`  → メディアURLを変換: ${mediaUrl}`);
        }
        
        return {
          ...work,
          media_type: normalizedType,
          media_url: mediaUrl
        };
      });
      
      console.log('正規化されたデータ:', normalizedData);
      setWorks(normalizedData);
      
      // 作品のIDリストを取得してフィードバック数を取得
      if (normalizedData.length > 0) {
        const workIds = normalizedData.map(work => work.id);
        fetchFeedbackCounts(workIds);
      }
    } catch (error) {
      console.error('予期せぬエラーが発生しました:', error);
      toast.error('予期せぬエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbackForWork = async (workId: string) => {
    if (!supabase) {
      toast.error('データベース接続エラーが発生しました');
      return;
    }

    try {
      setFeedbackLoading(true);
      
      const { data, error } = await supabase
        .from('work_feedback')
        .select('*')
        .eq('work_id', workId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('フィードバックの取得エラー:', error);
        toast.error('フィードバックの読み込みに失敗しました');
        return;
      }
      
      if (!data || data.length === 0) {
        setFeedbackList([]);
        return;
      }
      
      // ユーザー情報を取得
      const userIds = [...new Set(data.map(item => item.user_id))];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, username')
        .in('user_id', userIds);
        
      if (profilesError) {
        console.error('プロファイル情報の取得エラー:', profilesError);
      }
      
      // プロファイル情報をマッピング
      const userMap = new Map();
      if (profilesData) {
        profilesData.forEach(profile => {
          userMap.set(profile.user_id, profile.username);
        });
      }
      
      // いいね情報を取得
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('ユーザー情報が取得できませんでした');
        return;
      }
      
      const { data: likesData, error: likesError } = await supabase
        .from('feedback_likes')
        .select('feedback_id, count')
        .in('feedback_id', data.map(item => item.id));
        
      if (likesError) {
        console.error('いいね情報の取得エラー:', likesError);
      }
      
      // 自分のいいね情報を取得
      const { data: myLikesData, error: myLikesError } = await supabase
        .from('feedback_likes')
        .select('feedback_id')
        .eq('user_id', user.id)
        .in('feedback_id', data.map(item => item.id));
        
      if (myLikesError) {
        console.error('自分のいいね情報の取得エラー:', myLikesError);
      }
      
      // いいね情報をマッピング
      const likesMap = new Map();
      if (likesData) {
        likesData.forEach(item => {
          likesMap.set(item.feedback_id, item.count);
        });
      }
      
      const myLikesSet = new Set();
      if (myLikesData) {
        myLikesData.forEach(item => {
          myLikesSet.add(item.feedback_id);
        });
      }
      
      // フィードバックリストを更新
      const updatedFeedbackList = data.map(item => ({
        ...item,
        username: userMap.get(item.user_id) || '匿名',
        likes: likesMap.get(item.id) || 0,
        liked_by_me: myLikesSet.has(item.id)
      }));
      
      setFeedbackList(updatedFeedbackList);
    } catch (error) {
      console.error('予期せぬエラーが発生しました:', error);
      toast.error('予期せぬエラーが発生しました');
    } finally {
      setFeedbackLoading(false);
    }
  };

  // スタンプ付きフィードバックを送信する関数
  const handleFeedbackSubmit = async () => {
    if (!supabase || !selectedWork || (!feedback.trim() && !selectedStamp)) {
      toast.error('フィードバックまたはスタンプを入力してください');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('ログインが必要です');
        return;
      }
      
      // スタンプ情報をフィードバックテキストに含める
      let feedbackText = feedback.trim();
      if (selectedStamp) {
        const stamp = STAMPS.find(s => s.id === selectedStamp);
        if (stamp) {
          // スタンプ情報をテキストの先頭に追加
          feedbackText = `[${stamp.label}] ${feedbackText}`;
        }
      }
      
      const { data, error } = await supabase
        .from('work_feedback')
        .insert([{
          work_id: selectedWork.id,
          user_id: user.id,
          feedback: feedbackText || 'スタンプを送りました' // スタンプのみの場合はデフォルトテキスト
        }])
        .select();

      if (error) {
        console.error('フィードバック送信エラー:', error);
        toast.error('フィードバックの送信に失敗しました');
        return;
      }

      toast.success('フィードバックを送信しました');
      setFeedback('');
      setSelectedStamp(null);
      
      // フィードバックリストを更新
      if (selectedWork) {
        fetchFeedbackForWork(selectedWork.id);
      }
      
      // フィードバック数を更新
      setFeedbackCounts(prev => ({
        ...prev,
        [selectedWork.id]: (prev[selectedWork.id] || 0) + 1
      }));
      
      // モーダルは閉じない（フィードバック一覧を表示するため）
      setShowFeedbacks(true);
    } catch (error) {
      console.error('予期せぬエラー:', error);
      toast.error('フィードバックの送信に失敗しました');
    }
  };

  const handleDelete = async () => {
    if (!supabase || !workToDelete) return;

    try {
      // まず、作品のレコードを削除
      const { error: deleteError } = await supabase
        .from('works')
        .delete()
        .eq('id', workToDelete.id);

      if (deleteError) throw deleteError;

      // 次に、関連するストレージのファイルを削除
      if (workToDelete.media_url) {
        // URLからファイルパスを抽出
        const url = new URL(workToDelete.media_url);
        const pathParts = url.pathname.split('/');
        // "works" バケット名を除外して、実際のファイルパスを取得
        const filePath = pathParts.slice(2).join('/');

        if (filePath) {
          const { error: storageError } = await supabase.storage
            .from('works')
            .remove([filePath]);

          if (storageError) {
            console.error('Storage deletion error:', storageError);
            // ストレージの削除に失敗しても、レコードは削除されているのでエラーは表示しない
          }
        }
      }

      toast.success('作品を削除しました');
      setWorkToDelete(null);
      fetchWorks();
    } catch (error) {
      console.error('Error deleting work:', error);
      toast.error('削除に失敗しました');
    }
  };

  const filteredWorks = React.useMemo(() => {
    console.log('フィルタリング実行:', filter);
    
    // 各メディアタイプの数をカウント
    const typeCounts = {
      drawing: 0,
      image: 0,
      photo: 0,
      video: 0,
      audio: 0,
      other: 0
    };
    
    works.forEach(work => {
      console.log(`作品: ${work.title}, メディアタイプ: ${work.media_type}`);
      if (work.media_type === 'drawing') typeCounts.drawing++;
      else if (work.media_type === 'image') typeCounts.image++;
      else if (work.media_type === 'photo') typeCounts.photo++;
      else if (work.media_type === 'video') typeCounts.video++;
      else if (work.media_type === 'audio') typeCounts.audio++;
      else typeCounts.other++;
    });
    
    console.log('メディアタイプ別カウント:', typeCounts);
    
    return works.filter(work => {
      // 検索条件に一致するか
      const matchesSearch = work.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (work.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      // フィルター条件に一致するか
      let matchesFilter = false;
      
      if (filter === 'all') {
        matchesFilter = true;
      } else {
        // typeフィールドがある場合はそれを使用し、ない場合はmedia_typeを使用
        const workType = work.type || work.media_type;
        matchesFilter = workType === filter;
      }
      
      // デバッグ出力
      console.log(`作品「${work.title}」: タイプ=${work.type || work.media_type}, フィルター=${filter}, 一致=${matchesFilter}`);
      
      return matchesSearch && matchesFilter;
    });
  }, [works, searchTerm, filter]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // メディアタイプに応じたアイコンを返す関数
  const getMediaTypeIcon = (type: Work['media_type']) => {
    switch (type) {
      case 'drawing':
        return <ImageIcon className="h-12 w-12 text-gray-400" />;
      case 'photo':
        return <ImageIcon className="h-12 w-12 text-gray-400" />;
      case 'audio':
        return <ImageIcon className="h-12 w-12 text-gray-400" />;
      default:
        return <ImageIcon className="h-12 w-12 text-gray-400" />;
    }
  };

  const fetchFeedbackCounts = async (workIds: string[]) => {
    if (!supabase || workIds.length === 0) return;

    try {
      const { data, error } = await supabase
        .from('work_feedback')
        .select('work_id, id')
        .in('work_id', workIds);

      if (error) {
        console.error('Error fetching feedback counts:', error);
        return;
      }

      // 各作品のフィードバック数をカウント
      const counts: Record<string, number> = {};
      data.forEach(item => {
        counts[item.work_id] = (counts[item.work_id] || 0) + 1;
      });

      setFeedbackCounts(counts);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // いいねを追加/削除する関数
  const handleLikeToggle = async (feedbackId: string) => {
    if (!supabase) return;
    
    try {
      // 現在のいいね状態を取得
      const currentFeedback = feedbackList.find(f => f.id === feedbackId);
      if (!currentFeedback) return;
      
      // いいね処理中のフィードバックを記録
      setLikesLoading(prev => ({ ...prev, [feedbackId]: true }));
      
      const { data: { user } } = await supabase.auth.getUser();
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
        
        // フィードバックリストを更新
        setFeedbackList(prev => 
          prev.map(item => 
            item.id === feedbackId 
              ? { ...item, likes: Math.max(0, (item.likes || 0) - 1), liked_by_me: false }
              : item
          )
        );
      } else {
        // いいねを追加
        const { error } = await supabase
          .from('feedback_likes')
          .insert([{
            feedback_id: feedbackId,
            user_id: user.id
          }]);
          
        if (error) throw error;
        
        // フィードバックリストを更新
        setFeedbackList(prev => 
          prev.map(item => 
            item.id === feedbackId 
              ? { ...item, likes: (item.likes || 0) + 1, liked_by_me: true }
              : item
          )
        );
        
        // いいねアニメーションのためのDOM要素を取得
        const heartElement = document.querySelector(`[data-feedback-id="${feedbackId}"] .heart-icon`);
        if (heartElement) {
          heartElement.classList.add('animate-heartBeat');
          // アニメーション終了後にクラスを削除
          setTimeout(() => {
            heartElement.classList.remove('animate-heartBeat');
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('いいねの処理に失敗しました');
    } finally {
      // いいね処理中のフィードバックを解除
      setLikesLoading(prev => ({ ...prev, [feedbackId]: false }));
    }
  };

  // 作品詳細ページへのリンクを生成
  const getWorkDetailLink = (workId: string) => {
    return `/parent/works/${workId}`;
  };

  // フィルタリング結果をログに出力
  useEffect(() => {
    console.log('フィルタリング結果:', {
      全作品数: works.length,
      フィルター後の作品数: filteredWorks.length,
      現在のフィルター: filter
    });
    
    // フィルタリング後の作品のメディアタイプを出力
    const filteredTypes = filteredWorks.map(work => work.type || work.media_type);
    console.log('フィルタリング後のメディアタイプ:', filteredTypes);
    
    // 各メディアタイプの数をカウント
    const counts = {
      drawing: 0,
      photo: 0,
      audio: 0,
      other: 0
    };
    
    filteredWorks.forEach(work => {
      const type = work.type || work.media_type;
      if (type === 'drawing') counts.drawing++;
      else if (type === 'photo') counts.photo++;
      else if (type === 'audio') counts.audio++;
      else counts.other++;
    });
    
    console.log('フィルタリング後のメディアタイプ別カウント:', counts);
  }, [filteredWorks, works, filter]);

  // 子供一覧を取得する関数
  const fetchChildren = async () => {
    if (!supabase) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('ユーザーが認証されていません');
        return;
      }

      // 親プロファイルを取得
      const { data: parentProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .eq('role', 'parent')
        .maybeSingle();

      if (!parentProfile) {
        console.log('親プロファイルが見つかりません');
        return;
      }

      // 子供のプロフィールを取得
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .eq('parent_id', parentProfile.id)
        .eq('role', 'child');

      if (error) {
        console.error('子供情報の取得エラー:', error);
        return;
      }

      if (data && data.length > 0) {
        setChildren(data);
        
        // URLパラメータから子供のIDを取得
        const urlParams = new URLSearchParams(window.location.search);
        const childId = urlParams.get('child');
        
        // URLパラメータに子供IDがある場合はそれを選択、なければ最初の子供を選択
        if (childId && data.some(child => child.id === childId)) {
          setSelectedChildId(childId);
        } else {
          setSelectedChildId(data[0].id);
        }
      }
    } catch (error) {
      console.error('子供一覧の取得エラー:', error);
    }
  };

  // 子供を切り替える関数
  const handleChildChange = (childId: string) => {
    setSelectedChildId(childId);
    // URLを更新
    const url = new URL(window.location.href);
    url.searchParams.set('child', childId);
    window.history.pushState({}, '', url.toString());
    // 作品を再取得
    setLoading(true);
  };

  // 全ての子供の作品を取得する関数
  const fetchAllChildrenWorks = async () => {
    if (!supabase || children.length <= 1) return;

    try {
      setLoadingChildrenWorks(true);
      const worksData: Record<string, Work[]> = {};

      for (const child of children) {
        // 各子供の作品を取得
        let query = supabase
          .from('works')
          .select('*')
          .eq('user_id', child.id)
          .order('created_at', { ascending: false });

        if (filter !== 'all') {
          query = query.eq('type', filter);
        }

        const { data, error } = await query;

        if (error) {
          console.error(`${child.username}の作品取得エラー:`, error);
          worksData[child.id] = [];
        } else {
          worksData[child.id] = data || [];
        }
      }

      setChildrenWorks(worksData);
    } catch (error) {
      console.error('全ての子供の作品取得エラー:', error);
    } finally {
      setLoadingChildrenWorks(false);
    }
  };

  // 比較モードを切り替える関数
  const toggleCompareMode = () => {
    setCompareMode(!compareMode);
  };

  // タイムラインデータを生成する関数
  const generateTimelineData = () => {
    if (!childrenWorks || Object.keys(childrenWorks).length === 0) return;

    // 選択された子供の作品を取得してマージ
    const allWorks: (Work & { childName: string, childAvatar?: string })[] = [];

    selectedChildrenForTimeline.forEach(childId => {
      const child = children.find(c => c.id === childId);
      if (child && childrenWorks[childId]) {
        const childWorks = childrenWorks[childId].map(work => ({
          ...work,
          childName: child.username,
          childAvatar: child.avatar_url
        }));
        allWorks.push(...childWorks);
      }
    });

    // 日付順にソート（新しい順）
    const sortedWorks = allWorks.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    setTimelineWorks(sortedWorks);
  };

  // 子供の選択状態を切り替える関数
  const toggleChildSelection = (childId: string) => {
    setSelectedChildrenForTimeline(prev => {
      if (prev.includes(childId)) {
        return prev.filter(id => id !== childId);
      } else {
        return [...prev, childId];
      }
    });
  };

  // 表示モードを切り替える関数
  const toggleViewMode = (mode: 'grid' | 'timeline') => {
    setViewMode(mode);
    if (mode === 'timeline' && selectedChildrenForTimeline.length === 0) {
      // デフォルトで最初の2人の子供を選択
      setSelectedChildrenForTimeline(children.slice(0, 2).map(child => child.id));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <Header 
        activeFilter={filter} 
        setActiveFilter={setFilter}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 子供選択タブ */}
        {children.length > 1 && (
          <div className="mb-6 bg-white rounded-lg shadow-sm p-4 animate-fadeIn">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-600" />
                お子様の作品を選択
              </h2>
              <div className="flex items-center gap-2">
                {compareMode && (
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => toggleViewMode('grid')}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        viewMode === 'grid' 
                          ? 'bg-white text-indigo-700 shadow-sm' 
                          : 'text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      グリッド表示
                    </button>
                    <button
                      onClick={() => toggleViewMode('timeline')}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        viewMode === 'timeline' 
                          ? 'bg-white text-indigo-700 shadow-sm' 
                          : 'text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      タイムライン表示
                    </button>
                  </div>
                )}
                <button
                  onClick={toggleCompareMode}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    compareMode 
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                      : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                  }`}
                >
                  {compareMode ? '通常表示に戻る' : '作品を比較する'}
                </button>
              </div>
            </div>
            {!compareMode && (
              <>
                <div className="flex flex-wrap gap-2">
                  {children.map(child => (
                    <button
                      key={child.id}
                      onClick={() => handleChildChange(child.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                        selectedChildId === child.id 
                          ? 'bg-indigo-100 text-indigo-700 font-medium shadow-sm' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                        {child.avatar_url ? (
                          <img 
                            src={child.avatar_url} 
                            alt={child.username} 
                            className="w-6 h-6 object-cover"
                          />
                        ) : (
                          <User className="h-3 w-3 text-indigo-600" />
                        )}
                      </div>
                      {child.username}
                    </button>
                  ))}
                </div>
                {selectedChildId && (
                  <p className="mt-2 text-sm text-gray-500">
                    {children.find(c => c.id === selectedChildId)?.username}の作品を表示しています
                  </p>
                )}
              </>
            )}
            {compareMode && viewMode === 'timeline' && (
              <div className="mt-4 border-t pt-4 border-gray-100">
                <p className="text-sm font-medium text-gray-700 mb-2">タイムラインに表示する子供を選択してください：</p>
                <div className="flex flex-wrap gap-2">
                  {children.map(child => (
                    <button
                      key={child.id}
                      onClick={() => toggleChildSelection(child.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                        selectedChildrenForTimeline.includes(child.id) 
                          ? 'bg-indigo-100 text-indigo-700 font-medium shadow-sm' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                        {child.avatar_url ? (
                          <img 
                            src={child.avatar_url} 
                            alt={child.username} 
                            className="w-6 h-6 object-cover"
                          />
                        ) : (
                          <User className="h-3 w-3 text-indigo-600" />
                        )}
                      </div>
                      {child.username}
                    </button>
                  ))}
                </div>
                {selectedChildrenForTimeline.length > 0 && (
                  <p className="mt-2 text-sm text-gray-500">
                    {selectedChildrenForTimeline.length}人の子供の作品をタイムラインで表示しています
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* 通常モード */}
        {!compareMode ? (
          loading ? (
            <div className="bg-white rounded-lg shadow-md p-8 flex justify-center items-center min-h-[50vh]">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                <p className="mt-4 text-gray-600">作品を読み込んでいます...</p>
              </div>
            </div>
          ) : filteredWorks.length === 0 ? (
            <EmptyState filter={filter} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredWorks.map((work, index) => (
                <div key={work.id} className="animate-fadeIn" style={{ animationDelay: `${index * 0.05}s` }}>
                  <WorkCard 
                    work={work} 
                    onFeedbackClick={setSelectedWork}
                    feedbackCount={feedbackCounts[work.id] || 0}
                    getSafeMediaUrl={getSafeMediaUrl}
                  />
                </div>
              ))}
            </div>
          )
        ) : (
          /* 比較モード */
          loadingChildrenWorks ? (
            <div className="bg-white rounded-lg shadow-md p-8 flex justify-center items-center min-h-[50vh]">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                <p className="mt-4 text-gray-600">全ての子供の作品を読み込んでいます...</p>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="space-y-8">
              {children.map(child => (
                <div key={child.id} className="bg-white rounded-lg shadow-sm p-4 animate-fadeIn">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                      {child.avatar_url ? (
                        <img 
                          src={child.avatar_url} 
                          alt={child.username} 
                          className="w-8 h-8 object-cover"
                        />
                      ) : (
                        <User className="h-4 w-4 text-indigo-600" />
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{child.username}の作品</h3>
                    <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full">
                      {childrenWorks[child.id]?.length || 0}件
                    </span>
                  </div>
                  
                  {!childrenWorks[child.id] || childrenWorks[child.id].length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>まだ作品がありません</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {childrenWorks[child.id].slice(0, 4).map((work, index) => (
                        <div key={work.id} className="animate-fadeIn" style={{ animationDelay: `${index * 0.05}s` }}>
                          <WorkCard 
                            work={work} 
                            onFeedbackClick={setSelectedWork}
                            feedbackCount={feedbackCounts[work.id] || 0}
                            getSafeMediaUrl={getSafeMediaUrl}
                          />
                        </div>
                      ))}
                      {childrenWorks[child.id].length > 4 && (
                        <div className="flex items-center justify-center h-full">
                          <Link 
                            to={`/parent/works?child=${child.id}`}
                            className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm font-medium"
                            onClick={() => {
                              setCompareMode(false);
                              handleChildChange(child.id);
                            }}
                          >
                            すべての作品を見る ({childrenWorks[child.id].length}件) →
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* タイムライン表示 */
            <div className="bg-white rounded-lg shadow-sm p-4 animate-fadeIn">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
                作品タイムライン
              </h3>
              
              {timelineWorks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>表示する作品がありません。子供を選択してください。</p>
                </div>
              ) : (
                <div className="relative pl-8 border-l-2 border-indigo-100 space-y-8 py-4">
                  {timelineWorks.map((work, index) => (
                    <div key={work.id} className="relative animate-fadeIn" style={{ animationDelay: `${index * 0.05}s` }}>
                      <div className="absolute -left-10 w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border-2 border-white">
                        {work.childAvatar ? (
                          <img 
                            src={work.childAvatar} 
                            alt={work.childName} 
                            className="w-6 h-6 object-cover"
                          />
                        ) : (
                          <User className="h-3 w-3 text-indigo-600" />
                        )}
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                              {work.childName}
                            </span>
                            <h4 className="text-lg font-medium text-gray-900 mt-1">{work.title}</h4>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDate(work.created_at)}
                          </span>
                        </div>
                        <div className="bg-white rounded-lg overflow-hidden border border-gray-100">
                          {(work.media_type === 'drawing' || work.media_type === 'photo') && (
                            <img 
                              src={getSafeMediaUrl(work.media_url || work.content_url || '')} 
                              alt={work.title} 
                              className="w-full h-48 object-cover"
                            />
                          )}
                        </div>
                        <div className="mt-2 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              {work.media_type === 'drawing' ? 'おえかき' : 
                               work.media_type === 'photo' ? 'しゃしん' : 'おんがく'}
                            </span>
                          </div>
                          <Link 
                            to={`/parent/works/${work.id}?child=${work.user_id}`}
                            className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                          >
                            詳細を見る →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        )}
      </div>

      {/* Feedback Modal */}
      {selectedWork && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-scaleIn">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
              <h3 className="text-xl font-semibold text-indigo-900 flex items-center gap-2">
                <span className="bg-indigo-100 p-1.5 rounded-full">
                  <MessageCircle className="h-5 w-5 text-indigo-600" />
                </span>
                {selectedWork.title}へのフィードバック
              </h3>
              <button
                onClick={() => {
                  setSelectedWork(null);
                  setShowFeedbacks(false);
                  setSelectedStamp(null);
                  setFeedback('');
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1.5 rounded-full hover:bg-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 max-h-[calc(90vh-8rem)] overflow-y-auto">
              {/* タブ切り替え */}
              <div className="flex border-b border-gray-200 mb-4">
                <button
                  onClick={() => setShowFeedbacks(false)}
                  className={`px-4 py-2 font-medium text-sm transition-all duration-200 flex items-center gap-1.5 ${!showFeedbacks ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <PenLine className="h-4 w-4" />
                  新規フィードバック
                </button>
                <button
                  onClick={() => setShowFeedbacks(true)}
                  className={`px-4 py-2 font-medium text-sm transition-all duration-200 flex items-center gap-1.5 ${showFeedbacks ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <MessageSquare className="h-4 w-4" />
                  フィードバック一覧 {feedbackList.length > 0 && (
                    <span className="bg-indigo-100 text-indigo-600 text-xs px-1.5 py-0.5 rounded-full">
                      {feedbackList.length}
                    </span>
                  )}
                </button>
              </div>
              
              {showFeedbacks ? (
                // フィードバック一覧
                <div>
                  {feedbackLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : feedbackList.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 flex flex-col items-center">
                      <MessageCircle className="h-12 w-12 text-gray-300 mb-2" />
                      <p className="text-lg font-medium mb-1">まだフィードバックはありません</p>
                      <p className="text-sm">新規フィードバックタブからメッセージを送ってみましょう</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {feedbackList.map((item, index) => (
                        <div key={item.id} className="animate-fadeIn" style={{ animationDelay: `${index * 0.05}s` }}>
                          <FeedbackItem 
                            feedback={item} 
                            onLike={handleLikeToggle} 
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // 新規フィードバック入力
                <div className="animate-fadeIn">
                  <div className="bg-indigo-50 rounded-lg p-4 mb-6 border border-indigo-100">
                    <p className="text-indigo-700 text-sm">子どもの作品に対するフィードバックを送信します。励ましのメッセージや感想を書いてみましょう。</p>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      スタンプ（オプション）
                    </label>
                    <div className="flex flex-wrap gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      {STAMPS.map(stamp => (
                        <button
                          key={stamp.id}
                          onClick={() => setSelectedStamp(stamp.id === selectedStamp ? null : stamp.id)}
                          className={`p-3 rounded-full transition-all duration-300 transform ${
                            stamp.id === selectedStamp 
                              ? 'bg-indigo-100 ring-2 ring-indigo-500 ring-offset-2 scale-110 shadow-md' 
                              : 'bg-white hover:bg-gray-100 hover:scale-105 shadow-sm border border-gray-200'
                          }`}
                          title={stamp.label}
                        >
                          <div className={stamp.color}>{stamp.icon}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                      <MessageSquare className="h-4 w-4 text-indigo-500" />
                      メッセージ（オプション）
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="子どもへのメッセージを書いてください..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm bg-white"
                      rows={4}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 p-4 border-t border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
              <button
                onClick={() => {
                  setSelectedWork(null);
                  setShowFeedbacks(false);
                  setSelectedStamp(null);
                  setFeedback('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors rounded-full hover:bg-white border border-gray-200 shadow-sm"
              >
                キャンセル
              </button>
              
              {!showFeedbacks && (
                <button
                  onClick={handleFeedbackSubmit}
                  disabled={!feedback.trim() && !selectedStamp}
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-300 shadow-md transform hover:scale-105 disabled:hover:scale-100 flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>送信する</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}