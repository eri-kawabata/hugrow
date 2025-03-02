import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './Layout';
import { Heart, Star, Frown, Smile, Meh, ThumbsUp, MessageCircle, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import type { SELQuest, SELResponse } from '../lib/types';

const emotions = [
  { 
    name: 'とてもうれしい', 
    icon: Star, 
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-200',
    hoverBorderColor: 'hover:border-yellow-400',
    intensity: 5 
  },
  { 
    name: 'うれしい', 
    icon: Heart, 
    color: 'text-pink-500',
    bgColor: 'bg-pink-100',
    borderColor: 'border-pink-200',
    hoverBorderColor: 'hover:border-pink-400',
    intensity: 4 
  },
  { 
    name: 'ふつう', 
    icon: Meh, 
    color: 'text-purple-500',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-200',
    hoverBorderColor: 'hover:border-purple-400',
    intensity: 3 
  },
  { 
    name: 'すこしかなしい', 
    icon: Frown, 
    color: 'text-blue-500',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
    hoverBorderColor: 'hover:border-blue-400',
    intensity: 2 
  },
  { 
    name: 'かなしい', 
    icon: Smile, 
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-100',
    borderColor: 'border-indigo-200',
    hoverBorderColor: 'hover:border-indigo-400',
    intensity: 1 
  },
] as const;

export function SELQuest() {
  const [selectedQuest, setSelectedQuest] = useState<SELQuest | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState<SELResponse[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchUserId = useCallback(async () => {
    if (!supabase) return null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('ログインが必要です');
        return null;
      }

      return user.id;
    } catch (error) {
      console.error('Error fetching user ID:', error);
      toast.error('ユーザー情報の取得に失敗しました');
      return null;
    }
  }, []);

  useEffect(() => {
    const initialize = async () => {
      const id = await fetchUserId();
      if (id) {
        setUserId(id);
        await Promise.all([
          fetchQuests(),
          fetchResponses(id)
        ]);
      }
    };

    initialize();
  }, [fetchUserId]);

  useEffect(() => {
    if (selectedEmotion) {
      fetchAIFeedback(selectedEmotion);
    } else {
      setFeedback(null);
    }
  }, [selectedEmotion]);

  const fetchQuests = async () => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('sel_quests')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (error) throw error;
      setSelectedQuest(data);
    } catch (error) {
      console.error('Error fetching quests:', error);
      toast.error('クエストの読み込みに失敗しました');
    }
  };

  const fetchResponses = async (id: string) => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('sel_responses')
        .select(`
          *,
          sel_feedback (
            id,
            feedback_text
          )
        `)
        .eq('user_id', id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setResponses(data || []);
    } catch (error) {
      console.error('Error fetching responses:', error);
      toast.error('記録の読み込みに失敗しました');
    }
  };

  const fetchAIFeedback = async (emotion: string) => {
    if (!supabase) return;

    const selectedEmotionData = emotions.find(e => e.name === emotion);
    if (!selectedEmotionData) return;

    try {
      const { data, error } = await supabase
        .from('sel_ai_feedback_templates')
        .select('feedback_template')
        .eq('emotion', emotion)
        .eq('intensity', selectedEmotionData.intensity)
        .single();

      if (error) throw error;
      setFeedback(data?.feedback_template || null);
    } catch (error) {
      console.error('Error fetching AI feedback:', error);
      setFeedback(null);
    }
  };

  const handleSubmit = async () => {
    if (!supabase || !selectedEmotion || !userId) {
      toast.error('感情を選択してください');
      return;
    }

    try {
      setLoading(true);

      const { error: responseError, data: responseData } = await supabase
        .from('sel_responses')
        .insert([{
          user_id: userId,
          emotion: selectedEmotion,
          note: note.trim() || null
        }])
        .select()
        .single();

      if (responseError) throw responseError;

      if (feedback && responseData) {
        const { error: feedbackError } = await supabase
          .from('sel_feedback')
          .insert([{
            response_id: responseData.id,
            feedback_text: feedback
          }]);

        if (feedbackError) throw feedbackError;
      }

      toast.success('気持ちを記録しました！');
      setNote('');
      setSelectedEmotion(null);
      setFeedback(null);
      fetchResponses(userId);
    } catch (error) {
      console.error('Error:', error);
      toast.error('記録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-white/50 rounded-2xl">
              <Heart className="h-8 w-8 text-pink-500" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
              きもちクエスト
            </h1>
          </div>
          
          {selectedQuest && (
            <div className="mb-8 bg-white/70 rounded-2xl p-6">
              <h2 className="text-2xl font-bold mb-3">{selectedQuest.title}</h2>
              <p className="text-lg text-gray-700">{selectedQuest.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            {emotions.map((emotion) => (
              <button
                key={emotion.name}
                onClick={() => setSelectedEmotion(emotion.name)}
                className={`p-6 rounded-2xl border-3 flex flex-col items-center gap-4 transition-all duration-300 transform ${
                  selectedEmotion === emotion.name
                    ? `${emotion.bgColor} ${emotion.borderColor} scale-105 shadow-lg`
                    : `bg-white/70 border-gray-100 ${emotion.hoverBorderColor} hover:scale-102 hover:shadow-md`
                }`}
              >
                <emotion.icon className={`h-12 w-12 ${emotion.color}`} />
                <span className="text-lg font-bold">{emotion.name}</span>
              </button>
            ))}
          </div>

          {feedback && (
            <div className="mb-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 transform hover:scale-102 transition-transform">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white rounded-xl">
                  <Sparkles className="h-6 w-6 text-indigo-600" />
                </div>
                <span className="text-xl font-bold text-indigo-900">AIからのメッセージ</span>
              </div>
              <p className="text-lg text-indigo-700 leading-relaxed">{feedback}</p>
            </div>
          )}

          <div className="mb-8">
            <label className="block text-lg font-bold text-gray-900 mb-3">
              きょうのできごと
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-6 py-4 text-lg border-3 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
              rows={4}
              placeholder="どんなことがあったかな？"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !selectedEmotion}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-4 px-6 rounded-2xl text-xl font-bold hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <ThumbsUp className="h-6 w-6" />
            <span>きろくする</span>
          </button>
        </div>

        {responses.length > 0 && (
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <MessageCircle className="h-7 w-7 text-indigo-600" />
              <span>これまでのきろく</span>
            </h2>
            <div className="space-y-6">
              {responses.map((response) => {
                const emotion = emotions.find(e => e.name === response.emotion);
                return (
                  <div
                    key={response.id}
                    className={`p-6 rounded-2xl border-2 ${
                      emotion?.borderColor || 'border-gray-100'
                    } ${emotion?.bgColor || 'bg-gray-50'} transform hover:scale-102 transition-all`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {emotion && <emotion.icon className={`h-8 w-8 ${emotion.color}`} />}
                      <span className="text-xl font-bold">{response.emotion}</span>
                      <span className="text-gray-600 text-lg">
                        {new Date(response.created_at).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                    {response.note && (
                      <p className="text-lg text-gray-700 mb-4">{response.note}</p>
                    )}
                    {response.sel_feedback && response.sel_feedback[0] && (
                      <div className="p-4 bg-white/80 rounded-xl border border-indigo-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="h-5 w-5 text-indigo-600" />
                          <span className="font-bold text-indigo-900">AIからのメッセージ</span>
                        </div>
                        <p className="text-indigo-700">{response.sel_feedback[0].feedback_text}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}