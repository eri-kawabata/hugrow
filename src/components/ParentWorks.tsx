import React, { useState, useEffect, memo } from 'react';
import { Image as ImageIcon, MessageCircle, Calendar, Filter, Search, X, Music, Camera, Palette, Heart, ThumbsUp, Star, Award, Smile } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import './ParentWorks.css'; // アニメーション用のCSSをインポート

// Work型の定義
interface Work {
  id: string;
  title: string;
  description?: string;
  media_url: string;
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
    },
    drawing: { 
      label: '絵', 
      icon: <Palette className="h-4 w-4" />,
    },
    audio: { 
      label: '音声', 
      icon: <Music className="h-4 w-4" />,
    },
    photo: { 
      label: '写真', 
      icon: <Camera className="h-4 w-4" />,
    },
  };

  const isActive = type === activeFilter;
  const config = filterConfig[type];

  return (
    <button
      onClick={() => onClick(type)}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
        isActive 
          ? `bg-indigo-600 text-white shadow-md` 
          : `bg-white text-gray-700 hover:bg-gray-50 border border-gray-200`
      }`}
    >
      <span>
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
  const stamp = STAMPS.find(s => s.id === feedback.stamp);
  
  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-3 animate-fadeIn">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-100 rounded-full p-2">
            <MessageCircle className="h-4 w-4 text-indigo-600" />
          </div>
          <span className="font-medium text-gray-700">{feedback.username || '匿名'}</span>
        </div>
        <span className="text-xs text-gray-500">
          {new Date(feedback.created_at).toLocaleDateString('ja-JP')}
        </span>
      </div>
      
      <p className="mt-2 text-gray-700">{feedback.feedback}</p>
      
      {stamp && (
        <div className="mt-2 flex items-center gap-1">
          <span className={`${stamp.color}`}>{stamp.icon}</span>
          <span className="text-sm text-gray-600">{stamp.label}</span>
        </div>
      )}
      
      <div className="mt-3 flex justify-end">
        <button 
          onClick={() => onLike(feedback.id)}
          className={`flex items-center gap-1 text-sm px-2 py-1 rounded-md ${
            feedback.liked_by_me 
              ? 'text-indigo-600 bg-indigo-50' 
              : 'text-gray-500 hover:bg-gray-100'
          }`}
          data-feedback-id={feedback.id}
        >
          <Heart className="h-4 w-4 heart-icon" />
          <span>{feedback.likes || 0}</span>
        </button>
      </div>
    </div>
  );
});

FeedbackItem.displayName = 'FeedbackItem';

// 作品カードコンポーネント
const WorkCard = memo(({ work, onFeedbackClick, feedbackCount = 0 }: { 
  work: Work, 
  onFeedbackClick: (work: Work) => void,
  feedbackCount?: number
}) => {
  const workType = work.type || work.media_type;
  const typeLabels = {
    drawing: 'お絵かき',
    audio: '音声',
    photo: '写真',
  };
  
  const typeLabel = typeLabels[workType] || '作品';

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 animate-fadeIn">
      <Link
        to={`/parent/works/${work.id}`}
        className="block"
      >
        <div className="relative h-48 bg-gray-100">
          {workType === 'drawing' || workType === 'photo' ? (
            <img 
              src={work.media_url} 
              alt={work.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Music className="h-16 w-16 text-gray-300" />
            </div>
          )}
          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
            {typeLabel}
          </div>
        </div>
      </Link>
      
      <div className="p-4">
        <h2 className="font-semibold text-gray-800 text-lg mb-1">{work.title}</h2>
        
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
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-md text-sm font-medium transition-all duration-200"
          >
            <MessageCircle className="h-4 w-4" />
            <span>フィードバック{feedbackCount > 0 ? ` (${feedbackCount})` : ''}</span>
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
  <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">
          子どもの作品一覧
        </h1>
        
        <div className="relative max-w-md w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="作品を検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-500" />
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
    <div className="bg-white rounded-lg shadow-md p-8 mt-6 text-center">
      <div className="inline-flex items-center justify-center p-4 bg-gray-100 rounded-full mb-4">
        <ImageIcon className="h-12 w-12 text-gray-400" />
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

  useEffect(() => {
    checkParentMode();
    fetchWorks();
  }, []);

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
        img.src = getSafeMediaUrl(work.media_url);
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

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();
        
      if (error) {
        console.error('プロファイル取得エラー:', error);
        setIsParentMode(true);
        return;
      }

      setIsParentMode(profile?.role === 'parent');
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
      const { data, error } = await supabase
        .from('works')
        .select('*')
        .order('created_at', { ascending: false });

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
      
      // メディアタイプの正規化
      const normalizedData = data.map(work => {
        // 元のメディアタイプを保存
        const originalType = work.media_type;
        let normalizedType = originalType;
        
        // メディアタイプのデバッグ出力
        console.log(`作品「${work.title}」の元のメディアタイプ: ${originalType}`);
        
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
        
        return {
          ...work,
          media_type: normalizedType
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
      
      if (!data) {
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
      
      const { data, error } = await supabase
        .from('work_feedback')
        .insert([{
          work_id: selectedWork.id,
          user_id: user.id,
          feedback: feedback.trim() || null,
          stamp: selectedStamp
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
      drawing: works.filter(w => w.type === 'drawing' || (!w.type && w.media_type === 'drawing')).length,
      photo: works.filter(w => w.type === 'photo' || (!w.type && w.media_type === 'photo')).length,
      audio: works.filter(w => w.type === 'audio' || (!w.type && w.media_type === 'audio')).length,
      all: works.length
    };
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

  // メディアURLを安全に処理する関数
  const getSafeMediaUrl = (url: string) => {
    if (!url) {
      // URLがない場合はプレースホルダー画像のURLを返す
      return 'https://via.placeholder.com/400x300?text=No+Image';
    }
    
    try {
      // URLが既に完全なURLの場合はそのまま返す
      if (url.startsWith('http://') || url.startsWith('https://')) {
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
      if (url.includes('works/') && !url.includes('http')) {
        // 環境変数からSupabaseのURLを取得
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
        if (supabaseUrl) {
          return `${supabaseUrl}/storage/v1/object/public/${url}`;
        }
      }
      
      // それ以外の場合は相対パスとして扱う
      return `${window.location.origin}/${url}`;
    } catch (error) {
      console.error('Error processing URL:', error, url);
      // エラーが発生した場合はプレースホルダー画像のURLを返す
      return 'https://via.placeholder.com/400x300?text=Error';
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        activeFilter={filter} 
        setActiveFilter={setFilter}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
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
            {filteredWorks.map((work) => (
              <WorkCard 
                key={work.id} 
                work={work} 
                onFeedbackClick={setSelectedWork}
                feedbackCount={feedbackCounts[work.id] || 0}
              />
            ))}
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {selectedWork && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">{selectedWork.title}へのフィードバック</h3>
              <button
                onClick={() => {
                  setSelectedWork(null);
                  setShowFeedbacks(false);
                  setSelectedStamp(null);
                  setFeedback('');
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 max-h-[calc(90vh-8rem)] overflow-y-auto">
              {/* タブ切り替え */}
              <div className="flex border-b border-gray-200 mb-4">
                <button
                  onClick={() => setShowFeedbacks(false)}
                  className={`px-4 py-2 font-medium text-sm ${!showFeedbacks ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  新規フィードバック
                </button>
                <button
                  onClick={() => setShowFeedbacks(true)}
                  className={`px-4 py-2 font-medium text-sm ${showFeedbacks ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  フィードバック一覧 {feedbackList.length > 0 && `(${feedbackList.length})`}
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
                    <div className="text-center py-8 text-gray-500">
                      まだフィードバックはありません
                    </div>
                  ) : (
                    <div>
                      {feedbackList.map(item => (
                        <FeedbackItem 
                          key={item.id} 
                          feedback={item} 
                          onLike={handleLikeToggle} 
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // 新規フィードバック入力
                <div>
                  <p className="text-gray-600 mb-4">子どもの作品に対するフィードバックを送信します。励ましのメッセージや感想を書いてみましょう。</p>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      スタンプ（オプション）
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {STAMPS.map(stamp => (
                        <button
                          key={stamp.id}
                          onClick={() => setSelectedStamp(stamp.id === selectedStamp ? null : stamp.id)}
                          className={`p-2 rounded-md transition-all ${
                            stamp.id === selectedStamp 
                              ? 'bg-indigo-100 ring-2 ring-indigo-500 ring-offset-2' 
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <div className={stamp.color}>{stamp.icon}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      メッセージ（オプション）
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="子どもへのメッセージを書いてください..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-inner"
                      rows={4}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setSelectedWork(null);
                  setShowFeedbacks(false);
                  setSelectedStamp(null);
                  setFeedback('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors rounded hover:bg-gray-100"
              >
                キャンセル
              </button>
              
              {!showFeedbacks && (
                <button
                  onClick={handleFeedbackSubmit}
                  disabled={!feedback.trim() && !selectedStamp}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm flex items-center gap-2"
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