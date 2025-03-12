import React, { useState, useEffect, useCallback } from 'react';
import { Image as ImageIcon, MessageCircle, Heart, Calendar, Filter, Search, Trash2, AlertTriangle, X, ExternalLink, Music, Video } from 'lucide-react';
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
  media_type: 'drawing' | 'photo' | 'audio';
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
};

export function ParentWorks() {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [feedback, setFeedback] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'drawing' | 'photo' | 'audio'>('all');
  const [isParentMode, setIsParentMode] = useState(false);
  const [workToDelete, setWorkToDelete] = useState<Work | null>(null);
  const [previewWork, setPreviewWork] = useState<Work | null>(null);
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackCounts, setFeedbackCounts] = useState<Record<string, number>>({});
  const [likesLoading, setLikesLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    checkParentMode();
    fetchWorks();
  }, []);

  useEffect(() => {
    if (previewWork) {
      fetchFeedbackForWork(previewWork.id);
    }
  }, [previewWork]);

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

  const checkParentMode = async () => {
    if (!supabase) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('ユーザーが認証されていません');
        return;
      }

      console.log('ユーザーID:', user.id);
      
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();
          
        if (error) {
          console.error('プロファイル取得エラー:', error);
          // エラーが発生しても、デフォルトで親モードを有効にする
          setIsParentMode(true);
          return;
        }

        console.log('プロファイル:', profile);
        setIsParentMode(profile?.role === 'parent');
      } catch (profileError) {
        console.error('プロファイル取得中の例外:', profileError);
        // 例外が発生しても、デフォルトで親モードを有効にする
        setIsParentMode(true);
      }
    } catch (error) {
      console.error('認証チェックエラー:', error);
      // 認証エラーの場合もデフォルトで親モードを有効にする
      setIsParentMode(true);
    }
  };

  const fetchWorks = async () => {
    if (!supabase) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('works')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('元のデータ:', data);
      
      // データベースの値を直接修正
      let updatedAny = false;
      for (const work of data || []) {
        // media_urlがない場合はスキップ
        if (!work.media_url) {
          console.warn(`作品ID: ${work.id} のmedia_urlが存在しません`);
          continue;
        }
        
        // 拡張子を取得
        const url = work.media_url;
        const extension = url.split('.').pop()?.toLowerCase();
        
        // 画像の拡張子
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
        // 動画の拡張子
        const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'wmv', 'flv', 'mkv'];
        // 音声の拡張子
        const audioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'];
        
        let newMediaType = work.media_type;
        
        // media_typeが'image'の場合は'drawing'に、'video'の場合は'photo'に変換
        if (work.media_type === 'image') {
          newMediaType = 'drawing';
          updatedAny = true;
        } else if (work.media_type === 'video') {
          newMediaType = 'photo';
          updatedAny = true;
        } else if (!['drawing', 'photo', 'audio'].includes(work.media_type)) {
          // 無効な値の場合は拡張子に基づいて判断
          if (extension) {
            if (imageExtensions.includes(extension)) {
              newMediaType = 'drawing';
            } else if (videoExtensions.includes(extension)) {
              newMediaType = 'photo';
            } else if (audioExtensions.includes(extension)) {
              newMediaType = 'audio';
            } else {
              // 不明な拡張子の場合はデフォルトでdrawingに
              newMediaType = 'drawing';
            }
          } else {
            // 拡張子がない場合はデフォルトでdrawingに
            newMediaType = 'drawing';
          }
          updatedAny = true;
        }
        
        // データベースの値を更新
        if (work.media_type !== newMediaType) {
          console.log(`作品ID: ${work.id} のメディアタイプを ${work.media_type} から ${newMediaType} に更新します`);
          const { error: updateError } = await supabase
            .from('works')
            .update({ media_type: newMediaType })
            .eq('id', work.id);
            
          if (updateError) {
            console.error(`作品ID: ${work.id} の更新に失敗しました:`, updateError);
          }
        }
        
        // メモリ上のデータも更新
        work.media_type = newMediaType as any;
      }
      
      // 更新があった場合のみ再取得
      if (updatedAny) {
        console.log('メディアタイプを更新しました。データベースの変更が反映されるまで少し時間がかかる場合があります。');
      }
      
      setWorks(data || []);
      
      // 作品のIDリストを取得してフィードバック数を取得
      if (data && data.length > 0) {
        const workIds = data.map(work => work.id);
        fetchFeedbackCounts(workIds);
      }
    } catch (error) {
      console.error('Error fetching works:', error);
      toast.error('作品の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbackForWork = async (workId: string) => {
    if (!supabase) {
      return;
    }

    try {
      setFeedbackLoading(true);
      
      // クエリを修正 - 結合を使わずに単純なクエリに変更
      const { data, error } = await supabase
        .from('work_feedback')
        .select('*')
        .eq('work_id', workId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        // ユーザー情報を取得
        const userIds = [...new Set(data.map(item => item.user_id))];
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, username')
          .in('user_id', userIds);
          
        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
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
        const { data: likesData, error: likesError } = await supabase
          .from('feedback_likes')
          .select('feedback_id, count')
          .in('feedback_id', data.map(item => item.id));
          
        if (likesError) {
          console.error('Error fetching likes:', likesError);
        }
        
        // 自分のいいね情報を取得
        let myLikes: Record<string, boolean> = {};
        if (user) {
          const { data: myLikesData, error: myLikesError } = await supabase
            .from('feedback_likes')
            .select('feedback_id')
            .eq('user_id', user.id)
            .in('feedback_id', data.map(item => item.id));
            
          if (myLikesError) {
            console.error('Error fetching my likes:', myLikesError);
          } else if (myLikesData) {
            myLikesData.forEach(like => {
              myLikes[like.feedback_id] = true;
            });
          }
        }
        
        // いいね数をマッピング
        const likesMap: Record<string, number> = {};
        if (likesData) {
          likesData.forEach(like => {
            likesMap[like.feedback_id] = like.count;
          });
        }
        
        // データ形式を変換
        const formattedData = data.map(item => ({
          id: item.id,
          feedback: item.feedback,
          created_at: item.created_at,
          user_id: item.user_id,
          username: userMap.get(item.user_id) || null,
          likes: likesMap[item.id] || 0,
          liked_by_me: myLikes[item.id] || false
        }));
        
        setFeedbackList(formattedData);
      } else {
        setFeedbackList([]);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
      // エラーメッセージを表示しない - 単に空のリストを表示
      setFeedbackList([]);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!supabase || !selectedWork || !feedback.trim()) {
      toast.error('フィードバックを入力してください');
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
          feedback: feedback.trim()
        }])
        .select();

      if (error) {
        console.error('Feedback submission error:', error);
        throw error;
      }

      toast.success('フィードバックを送信しました');
      setFeedback('');
      
      // 修正: プレビューモーダルが開いている場合は、フィードバックリストを更新
      const workId = selectedWork.id;
      setSelectedWork(null);
      
      // 少し遅延を入れてからフィードバックを再取得
      setTimeout(() => {
        if (previewWork && previewWork.id === workId) {
          fetchFeedbackForWork(workId);
        }
      }, 500);
    } catch (error) {
      console.error('Error:', error);
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

  const filteredWorks = works.filter(work => {
    // 検索条件に一致するか
    const matchesSearch = work.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (work.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    // フィルター条件に一致するか
    let matchesFilter = filter === 'all';
    
    if (!matchesFilter) {
      // 有効なメディアタイプを持つ場合
      if (['drawing', 'photo', 'audio'].includes(work.media_type)) {
        matchesFilter = work.media_type === filter;
      } else if (work.media_type === 'image' && filter === 'drawing') {
        // 'image'は'drawing'として扱う
        matchesFilter = true;
      } else if (work.media_type === 'video' && filter === 'photo') {
        // 'video'は'photo'として扱う
        matchesFilter = true;
      }
    }
    
    return matchesSearch && matchesFilter;
  });

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
        return <Music className="h-12 w-12 text-gray-400" />;
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">作品一覧</h1>
        
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="作品を検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 h-5 w-5" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
            >
              <option value="all">すべて</option>
              <option value="drawing">絵・写真</option>
              <option value="photo">写真</option>
              <option value="audio">音声</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">作品を読み込んでいます...</p>
        </div>
      ) : filteredWorks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <div className="text-gray-400 mx-auto">
            <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">作品が見つかりません</h3>
          <p className="text-gray-500">検索条件に一致する作品はありません。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorks.map((work) => (
            <div
              key={work.id}
              className="bg-white rounded-xl shadow overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer transform hover:scale-[1.02] border border-gray-100"
              onClick={(e) => {
                e.preventDefault();
                setPreviewWork({...work});
              }}
            >
              {work.media_type === 'drawing' && (
                <div className="relative h-48 bg-gray-100">
                  <img
                    src={getSafeMediaUrl(work.media_url)}
                    alt={work.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/400x300?text=画像が見つかりません';
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <span className="bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
                      絵
                    </span>
                  </div>
                </div>
              )}
              {work.media_type === 'photo' && (
                <div className="relative h-48 bg-gray-100">
                  <img
                    src={getSafeMediaUrl(work.media_url)}
                    alt={work.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/400x300?text=画像が見つかりません';
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <span className="bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
                      写真
                    </span>
                  </div>
                </div>
              )}
              {work.media_type === 'audio' && (
                <div className="relative h-48 bg-gray-100 flex items-center justify-center">
                  <Music className="h-12 w-12 text-gray-400" />
                  <div className="absolute top-2 right-2">
                    <span className="bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
                      音声
                    </span>
                  </div>
                </div>
              )}
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2 text-gray-800">{work.title}</h3>
                {work.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{work.description}</p>
                )}
                <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(work.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isParentMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedWork(work);
                        }}
                        className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 transition-colors px-2 py-1 rounded hover:bg-indigo-50"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>フィードバック</span>
                      </button>
                    )}
                    {!isParentMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedWork(work);
                        }}
                        className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 transition-colors px-2 py-1 rounded hover:bg-indigo-50"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>フィードバック</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Feedback Modal */}
      {selectedWork && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">{selectedWork.title}へのフィードバック</h3>
              <button
                onClick={() => setSelectedWork(null)}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">子どもの作品に対するフィードバックを送信します。励ましのメッセージや感想を書いてみましょう。</p>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="子どもへのメッセージを書いてください..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-inner"
              rows={4}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setSelectedWork(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors rounded hover:bg-gray-100"
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  handleFeedbackSubmit();
                }}
                disabled={!feedback.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                <span>送信する</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Work Preview Modal */}
      {previewWork && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">{previewWork.title}</h3>
              <button
                onClick={() => {
                  setPreviewWork(null);
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-6">
              {previewWork.media_type === 'drawing' && (
                <div className="bg-gray-100 rounded-lg p-2 shadow-inner">
                  <img
                    src={getSafeMediaUrl(previewWork.media_url)}
                    alt={previewWork.title}
                    className="w-full max-h-[60vh] object-contain rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/800x600?text=画像が見つかりません';
                    }}
                  />
                </div>
              )}
              {previewWork.media_type === 'photo' && (
                <div className="bg-gray-100 rounded-lg p-2 shadow-inner">
                  <img
                    src={getSafeMediaUrl(previewWork.media_url)}
                    alt={previewWork.title}
                    className="w-full max-h-[60vh] object-contain rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/800x600?text=画像が見つかりません';
                    }}
                  />
                </div>
              )}
              {previewWork.media_type === 'audio' && (
                <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
                  <audio
                    src={getSafeMediaUrl(previewWork.media_url)}
                    controls
                    className="w-full"
                    onError={(e) => {
                      e.currentTarget.parentElement!.innerHTML = '<div class="flex items-center justify-center h-20 bg-gray-100 rounded-lg"><p class="text-gray-500">音声を読み込めませんでした</p></div>';
                    }}
                  />
                </div>
              )}
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">説明</h4>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{previewWork.description || "説明はありません"}</p>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500 mb-6 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(previewWork.created_at)}</span>
              </div>
              <a 
                href={getSafeMediaUrl(previewWork.media_url)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 transition-colors px-2 py-1 rounded hover:bg-white"
              >
                <ExternalLink className="h-4 w-4" />
                <span>元のサイズで開く</span>
              </a>
            </div>
            
            {/* フィードバック一覧 */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-indigo-500" />
                <span>フィードバック</span>
                {feedbackList.length > 0 && (
                  <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded-full ml-2">
                    {feedbackList.length}
                  </span>
                )}
              </h4>
              {feedbackLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                </div>
              ) : feedbackList.length > 0 ? (
                <div className="space-y-3">
                  {feedbackList.map((item) => (
                    <div key={item.id} className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-700 flex items-center gap-2">
                          <span className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                            {item.username ? item.username.charAt(0).toUpperCase() : '先'}
                          </span>
                          {item.username || '先生'}
                        </span>
                        <span className="text-xs text-gray-500">{formatDate(item.created_at)}</span>
                      </div>
                      <p className="text-gray-600 pl-10">{item.feedback}</p>
                      <div className="mt-3 pl-10 flex items-center justify-between">
                        <button 
                          onClick={() => handleLikeToggle(item.id)}
                          disabled={likesLoading[item.id]}
                          data-feedback-id={item.id}
                          className={`flex items-center gap-1 text-sm px-2 py-1 rounded-full transition-colors ${
                            item.liked_by_me 
                              ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                              : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
                          }`}
                        >
                          {likesLoading[item.id] ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                          ) : (
                            <Heart className={`h-4 w-4 heart-icon ${item.liked_by_me ? 'fill-current' : ''}`} />
                          )}
                          <span>{item.likes || 0}</span>
                        </button>
                        <div className="text-xs text-gray-400">
                          {item.user_id === previewWork.user_id ? '作成者' : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-100">
                  <div className="text-gray-400 mx-auto mb-3">
                    <MessageCircle className="h-12 w-12 mx-auto opacity-50" />
                  </div>
                  <p className="text-gray-500">まだフィードバックはありません</p>
                  {isParentMode && (
                    <p className="text-gray-500 text-sm mt-2">「フィードバックを送る」ボタンをクリックして、最初のフィードバックを送りましょう。</p>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setSelectedWork(previewWork);
                  setPreviewWork(null);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <MessageCircle className="h-5 w-5" />
                <span>フィードバックを送る</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {workToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4 text-red-600">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-xl font-bold">作品の削除</h3>
            </div>
            <p className="text-gray-600 mb-6">
              「{workToDelete.title}」を削除します。<br />
              この操作は取り消せません。本当に削除しますか？
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setWorkToDelete(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}