import React, { useState, useEffect } from 'react';
import { Layout } from './Layout';
import { Clock, Star, Image, Heart, Plus, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import type { Timecapsule, Work, SELResponse } from '../lib/types';

type CombinedItem = {
  id: string;
  capsule_id: string;
  note: string | null;
  created_at: string;
  type: 'work' | 'sel_response';
  work?: Work;
  sel_response?: SELResponse;
};

export function Timecapsule() {
  const [capsules, setCapsules] = useState<Timecapsule[]>([]);
  const [selectedCapsule, setSelectedCapsule] = useState<Timecapsule | null>(null);
  const [items, setItems] = useState<CombinedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDate, setNewDate] = useState('');

  useEffect(() => {
    fetchCapsules();
  }, []);

  useEffect(() => {
    if (selectedCapsule) {
      fetchItems(selectedCapsule.id);
    }
  }, [selectedCapsule]);

  const fetchCapsules = async () => {
    if (!supabase) return;

    const { data, error } = await supabase
      .from('timecapsules')
      .select('*')
      .order('milestone_date', { ascending: true });

    if (error) {
      console.error('Error fetching capsules:', error);
      toast.error('タイムカプセルの読み込みに失敗しました');
      return;
    }

    setCapsules(data);
    if (data.length > 0 && !selectedCapsule) {
      setSelectedCapsule(data[0]);
    }
  };

  const fetchItems = async (capsuleId: string) => {
    if (!supabase) return;

    try {
      // Fetch work items
      const { data: workItems, error: workError } = await supabase
        .from('timecapsule_work_items')
        .select(`
          id,
          capsule_id,
          note,
          created_at,
          work:work_id(*)
        `)
        .eq('capsule_id', capsuleId);

      if (workError) throw workError;

      // Fetch SEL items
      const { data: selItems, error: selError } = await supabase
        .from('timecapsule_sel_items')
        .select(`
          id,
          capsule_id,
          note,
          created_at,
          sel_response:sel_response_id(*)
        `)
        .eq('capsule_id', capsuleId);

      if (selError) throw selError;

      // Transform and combine items
      const combinedItems: CombinedItem[] = [
        ...(workItems?.map(item => ({
          ...item,
          type: 'work' as const
        })) || []),
        ...(selItems?.map(item => ({
          ...item,
          type: 'sel_response' as const
        })) || [])
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setItems(combinedItems);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('アイテムの読み込みに失敗しました');
    }
  };

  const handleCreateCapsule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('ログインが必要です');
        return;
      }

      const { error } = await supabase
        .from('timecapsules')
        .insert([{
          user_id: user.id,
          title: newTitle,
          description: newDescription.trim() || null,
          milestone_date: newDate
        }]);

      if (error) throw error;

      toast.success('タイムカプセルを作成しました！');
      setShowNewForm(false);
      setNewTitle('');
      setNewDescription('');
      setNewDate('');
      fetchCapsules();
    } catch (error) {
      console.error('Error:', error);
      toast.error('作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="h-6 w-6 text-indigo-600" />
            タイムカプセル
          </h1>
          <button
            onClick={() => setShowNewForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            <span>新しいカプセル</span>
          </button>
        </div>

        {showNewForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">新しいタイムカプセル</h2>
            <form onSubmit={handleCreateCapsule} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  タイトル
                </label>
                <input
                  id="title"
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  説明
                </label>
                <textarea
                  id="description"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  記念日
                </label>
                <input
                  id="date"
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNewForm(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                >
                  作成する
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Capsule List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              思い出リスト
            </h2>
            {capsules.map((capsule) => (
              <button
                key={capsule.id}
                onClick={() => setSelectedCapsule(capsule)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${
                  selectedCapsule?.id === capsule.id
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                <h3 className="font-medium">{capsule.title}</h3>
                <p className="text-sm text-gray-600">
                  {formatDate(capsule.milestone_date)}
                </p>
              </button>
            ))}
          </div>

          {/* Item List */}
          <div className="md:col-span-2">
            {selectedCapsule && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-2">{selectedCapsule.title}</h2>
                  <p className="text-gray-600">{selectedCapsule.description}</p>
                  <p className="text-sm text-indigo-600 mt-2">
                    {formatDate(selectedCapsule.milestone_date)}
                  </p>
                </div>

                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-lg bg-gray-50 border border-gray-100"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {item.type === 'work' ? (
                          <Image className="h-5 w-5 text-indigo-600" />
                        ) : (
                          <Heart className="h-5 w-5 text-pink-600" />
                        )}
                        <span className="font-medium">
                          {item.work?.title || item.sel_response?.emotion}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(item.created_at)}
                        </span>
                      </div>
                      {item.note && (
                        <p className="text-gray-600 text-sm">{item.note}</p>
                      )}
                      {item.work?.media_url && (
                        <img
                          src={item.work.media_url}
                          alt={item.work.title}
                          className="mt-2 rounded-lg max-h-48 object-cover"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}