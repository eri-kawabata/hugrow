import React, { useState, useEffect } from 'react';
import { Layout } from './Layout';
import { Heart, Star, Frown, Smile, Meh, ThumbsUp, MessageCircle, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import type { SELQuest, SELResponse } from '../lib/types';

const emotions = [
  { name: 'とてもうれしい', icon: Star, color: 'text-yellow-500', intensity: 5 },
  { name: 'うれしい', icon: Heart, color: 'text-pink-500', intensity: 4 },
  { name: 'ふつう', icon: Meh, color: 'text-gray-500', intensity: 3 },
  { name: 'すこしかなしい', icon: Frown, color: 'text-blue-500', intensity: 2 },
  { name: 'かなしい', icon: Smile, color: 'text-purple-500', intensity: 1 },
];

export function SELQuest() {
  const [quests, setQuests] = useState<SELQuest[]>([]);
  const [selectedQuest, setSelectedQuest] = useState<SELQuest | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState<SELResponse[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetchQuests();
    fetchResponses();
  }, []);

  useEffect(() => {
    if (selectedEmotion) {
      fetchAIFeedback(selectedEmotion);
    } else {
      setFeedback(null);
    }
  }, [selectedEmotion]);

  const fetchQuests = async () => {
    if (!supabase) return;

    const { data, error } = await supabase
      .from('sel_quests')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching quests:', error);
      toast.error('クエストの読み込みに失敗しました');
      return;
    }

    setQuests(data);
    if (data.length > 0) {
      setSelectedQuest(data[0]);
    }
  };

  const fetchAIFeedback = async (emotion: string) => {
    if (!supabase) return;

    const selectedEmotionData = emotions.find(e => e.name === emotion);
    if (!selectedEmotionData) return;

    const { data, error } = await supabase
      .from('sel_ai_feedback_templates')
      .select('feedback_template')
      .eq('emotion', emotion)
      .eq('intensity', selectedEmotionData.intensity)
      .single();

    if (error) {
      console.error('Error fetching AI feedback:', error);
      return;
    }

    if (data) {
      setFeedback(data.feedback_template);
    }
  };

  const fetchResponses = async () => {
    if (!supabase) return;

    const { data, error } = await supabase
      .from('sel_responses')
      .select('*, sel_feedback(*)')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching responses:', error);
      return;
    }

    setResponses(data);
  };

  const handleSubmit = async () => {
    if (!supabase || !selectedQuest || !selectedEmotion) {
      toast.error('感情を選択してください');
      return;
    }

    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('ログインが必要です');
        return;
      }

      const emotion = emotions.find(e => e.name === selectedEmotion);
      if (!emotion) return;

      const { error: responseError, data: responseData } = await supabase
        .from('sel_responses')
        .insert([{
          quest_id: selectedQuest.id,
          emotion: selectedEmotion,
          intensity: emotion.intensity,
          note: note.trim() || null,
          user_id: user.id
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
      fetchResponses();
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
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            きもちクエスト
          </h1>
          
          {selectedQuest && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">{selectedQuest.title}</h2>
              <p className="text-gray-600">{selectedQuest.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            {emotions.map((emotion) => (
              <button
                key={emotion.name}
                onClick={() => setSelectedEmotion(emotion.name)}
                className={`p-4 rounded-xl border-2 flex flex-col items-center space-y-2 transition-all ${
                  selectedEmotion === emotion.name
                    ? 'border-indigo-600 bg-indigo-50 scale-105'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                <emotion.icon className={`h-8 w-8 ${emotion.color}`} />
                <span className="text-sm font-medium">{emotion.name}</span>
              </button>
            ))}
          </div>

          {feedback && (
            <div className="mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                <span className="font-medium text-indigo-900">AIからのメッセージ</span>
              </div>
              <p className="text-indigo-700">{feedback}</p>
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
              メモ（できごとや理由）
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={3}
              placeholder="今日あったことを書いてみよう"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !selectedEmotion}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <ThumbsUp className="h-5 w-5" />
            <span>きろくする</span>
          </button>
        </div>

        {responses.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-indigo-600" />
              さいきんのきろく
            </h2>
            <div className="space-y-4">
              {responses.map((response) => {
                const emotion = emotions.find(e => e.name === response.emotion);
                return (
                  <div
                    key={response.id}
                    className="p-4 rounded-lg bg-gray-50 border border-gray-100"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {emotion && <emotion.icon className={`h-5 w-5 ${emotion.color}`} />}
                      <span className="font-medium">{response.emotion}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(response.created_at).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                    {response.note && (
                      <p className="text-gray-600 text-sm mb-2">{response.note}</p>
                    )}
                    {response.sel_feedback && response.sel_feedback[0] && (
                      <div className="mt-2 p-3 bg-indigo-50 rounded border border-indigo-100">
                        <div className="flex items-center gap-2 mb-1">
                          <Sparkles className="h-4 w-4 text-indigo-600" />
                          <span className="text-sm font-medium text-indigo-900">AIからのメッセージ</span>
                        </div>
                        <p className="text-sm text-indigo-700">{response.sel_feedback[0].feedback_text}</p>
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