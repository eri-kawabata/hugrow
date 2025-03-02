import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './Layout';
import { Image, MessageCircle, Heart, Calendar, Filter, Search, Trash2, AlertTriangle, X, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import type { Work } from '../lib/types';

type Feedback = {
  id: string;
  feedback: string;
  created_at: string;
  user_id: string;
  username: string | null;
};

export function ParentWorks() {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [feedback, setFeedback] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'image' | 'video' | 'audio'>('all');
  const [isParentMode, setIsParentMode] = useState(false);
  const [workToDelete, setWorkToDelete] = useState<Work | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [currentWorkId, setCurrentWorkId] = useState<string | null>(null);

  useEffect(() => {
    checkParentMode();
    fetchWorks();
  }, []);

  useEffect(() => {
    if (currentWorkId) {
      fetchFeedback(currentWorkId);
    }
  }, [currentWorkId]);

  const checkParentMode = async () => {
    if (!supabase) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      setIsParentMode(profile?.role === 'parent');
    } catch (error) {
      console.error('Error checking parent mode:', error);
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
      setWorks(data || []);
    } catch (error) {
      console.error('Error fetching works:', error);
      toast.error('作品の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedback = useCallback(async (workId: string) => {
    if (!isParentMode) return;

    try {
      const { data, error } = await supabase
        .from('work_feedback')
        .select('id, feedback, created_at, user_id, profiles:user_id(username)')
        .eq('work_id', workId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching feedback:', err);
      return [];
    }
  }, [isParentMode]);

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

      const { error } = await supabase
        .from('work_feedback')
        .insert([{
          work_id: selectedWork.id,
          user_id: user.id,
          feedback: feedback.trim()
        }]);

      if (error) throw error;

      toast.success('フィードバックを送信しました');
      setFeedback('');
      setSelectedWork(null);

      // フィードバックリストを更新
      if (showFeedback && currentWorkId) {
        await fetchFeedback(currentWorkId);
      }
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
    const matchesSearch = work.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (work.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || work.media_type === filter;
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

  const handleShowFeedback = (workId: string) => {
    setShowFeedback(true);
    setCurrentWorkId(workId);
  };

  return (
    <Layout>
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 h-5 w-5" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">すべて</option>
                <option value="image">絵・写真</option>
                <option value="video">動画</option>
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorks.map((work) => (
              <div
                key={work.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {work.media_url && work.media_type === 'image' && (
                  <img
                    src={work.media_url}
                    alt={work.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                {work.media_url && work.media_type === 'video' && (
                  <video
                    src={work.media_url}
                    controls
                    className="w-full h-48 object-cover"
                  />
                )}
                {work.media_url && work.media_type === 'audio' && (
                  <audio
                    src={work.media_url}
                    controls
                    className="w-full mt-4 px-4"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{work.title}</h3>
                  {work.description && (
                    <p className="text-gray-600 text-sm mb-3">{work.description}</p>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(work.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleShowFeedback(work.id)}
                        className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>コメント</span>
                      </button>
                      {isParentMode && (
                        <button
                          onClick={() => setSelectedWork(work)}
                          className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span>フィードバック</span>
                        </button>
                      )}
                      {!isParentMode && (
                        <button
                          onClick={() => setWorkToDelete(work)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>削除</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Feedback Modal - Only shown in parent mode */}
        {isParentMode && selectedWork && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-6">
              <h3 className="text-xl font-bold mb-4">{selectedWork.title}へのフィードバック</h3>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="子どもへのメッセージを書いてください..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={4}
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setSelectedWork(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleFeedbackSubmit}
                  disabled={!feedback.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  送信する
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Feedback List Modal */}
        {showFeedback && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">フィードバック</h3>
                <button
                  onClick={() => {
                    setShowFeedback(false);
                    setCurrentWorkId(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {feedbackLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">読み込み中...</p>
                </div>
              ) : feedbackList.length > 0 ? (
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {feedbackList.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-lg bg-gray-50 border border-gray-100"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">
                          {item.username || '先生'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(item.created_at)}
                        </span>
                      </div>
                      <p className="text-gray-700">{item.feedback}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-600 py-8">
                  まだフィードバックはありません
                </p>
              )}
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {workToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-6">
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
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  削除する
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}