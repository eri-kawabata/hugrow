import React, { useState, useEffect, useCallback } from 'react';
import { BaseLayout } from './layouts/BaseLayout';
import { Heart, Star, Frown, Smile, Meh, ThumbsUp, MessageCircle, Sparkles, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import type { SELQuest, SELResponse } from '../lib/types';
import { GradientHeader } from './GradientHeader';

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
  const [expandedResponseId, setExpandedResponseId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const responsesPerPage = 5;
  // カレンダー表示用の状態
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

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

      // 選択された感情からintensityを取得
      const selectedEmotionData = emotions.find(e => e.name === selectedEmotion);
      if (!selectedEmotionData) {
        toast.error('感情データが不正です');
        return;
      }

      // quest_idを取得（選択されたクエストまたはデフォルトクエスト）
      let questId = selectedQuest?.id;
      
      // quest_idがない場合、デフォルトのクエストを取得
      if (!questId) {
        try {
          const { data, error } = await supabase
            .from('sel_quests')
            .select('id')
            .eq('emotion_type', 'daily_mood')
            .limit(1)
            .single();
            
          if (error) throw error;
          questId = data?.id;
        } catch (err) {
          console.error('デフォルトクエスト取得エラー:', err);
          toast.error('クエスト情報の取得に失敗しました');
          setLoading(false);
          return;
        }
      }
      
      // quest_idがない場合はエラー
      if (!questId) {
        toast.error('クエスト情報が見つかりません');
        setLoading(false);
        return;
      }

      const { error: responseError, data: responseData } = await supabase
        .from('sel_responses')
        .insert([{
          user_id: userId,
          quest_id: questId,
          emotion: selectedEmotion,
          intensity: selectedEmotionData.intensity,
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

  // 月を変更する関数
  const changeMonth = (increment: number) => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() + increment);
      return newMonth;
    });
  };

  // ページネーション関連の計算
  const totalPages = Math.ceil(responses.length / responsesPerPage);
  const paginatedResponses = responses.slice(
    (currentPage - 1) * responsesPerPage,
    currentPage * responsesPerPage
  );

  // 次のページへ
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // 前のページへ
  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // レスポンスの展開/折りたたみを切り替える
  const toggleResponseExpand = (id: string) => {
    setExpandedResponseId(expandedResponseId === id ? null : id);
  };

  // 日付ごとにレスポンスをグループ化する関数
  const getResponsesByDate = useCallback(() => {
    const responseMap: Record<string, SELResponse[]> = {};
    
    responses.forEach(response => {
      const date = new Date(response.created_at);
      const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      
      if (!responseMap[dateKey]) {
        responseMap[dateKey] = [];
      }
      
      responseMap[dateKey].push(response);
    });
    
    return responseMap;
  }, [responses]);

  // カレンダーの日付を生成する関数
  const generateCalendarDays = useCallback(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // 月の最初の日の曜日を取得（0: 日曜日, 1: 月曜日, ...）
    const firstDay = new Date(year, month, 1).getDay();
    
    // 月の最終日を取得
    const lastDate = new Date(year, month + 1, 0).getDate();
    
    // カレンダーの日付配列を生成
    const days = [];
    
    // 前月の日付を埋める
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // 当月の日付を埋める
    for (let i = 1; i <= lastDate; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  }, [currentMonth]);

  // 日付ごとのレスポンスを取得
  const responsesByDate = getResponsesByDate();
  const calendarDays = generateCalendarDays();

  return (
    <BaseLayout hideHeader={true}>
      <div className="max-w-5xl mx-auto pb-28">
        <GradientHeader 
          title="きもちクエスト" 
          gradientColors={{
            from: '#8ec5d6',
            via: '#f7c5c2',
            to: '#f5f6bf'
          }}
        />

        <div className="px-6">
          <div className="space-y-8">
            {selectedQuest && (
              <div className="bg-white rounded-[32px] shadow-md p-8">
          <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl">
              <Heart className="h-8 w-8 text-pink-500" />
            </div>
                  <h2 className="text-2xl font-bold text-[#5d7799]">{selectedQuest.title}</h2>
          </div>
              <p className="text-lg text-gray-700">{selectedQuest.description}</p>
            </div>
          )}

            <div className="bg-white rounded-[32px] shadow-md p-6">
              <h3 className="text-lg font-bold text-[#5d7799] mb-4">いまのきもちは？</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
            {emotions.map((emotion) => (
              <button
                key={emotion.name}
                onClick={() => setSelectedEmotion(emotion.name)}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all duration-300 transform ${
                  selectedEmotion === emotion.name
                        ? `${emotion.bgColor} ${emotion.borderColor} scale-105 shadow-md`
                        : `bg-white/70 border-gray-100 ${emotion.hoverBorderColor} hover:scale-102 hover:shadow-sm`
                }`}
              >
                    <emotion.icon className={`h-8 w-8 ${emotion.color}`} />
                    <span className="text-sm font-medium">{emotion.name}</span>
              </button>
            ))}
          </div>

          {feedback && (
                <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 transform hover:scale-102 transition-transform">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-white rounded-lg">
                      <Sparkles className="h-4 w-4 text-indigo-600" />
                </div>
                    <span className="text-base font-bold text-indigo-900">AIからのメッセージ</span>
              </div>
                  <p className="text-sm text-indigo-700 leading-relaxed">{feedback}</p>
            </div>
          )}

              <div className="mb-6">
                <label className="block text-base font-bold text-[#5d7799] mb-2">
              きょうのできごと
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
                  className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
                  rows={3}
              placeholder="どんなことがあったかな？"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !selectedEmotion}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 px-4 rounded-xl text-base font-bold hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
                <ThumbsUp className="h-5 w-5" />
            <span>きろくする</span>
          </button>
        </div>

        {responses.length > 0 && (
              <div className="bg-white rounded-[32px] shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold flex items-center gap-2 text-[#5d7799]">
                    <MessageCircle className="h-5 w-5 text-indigo-600" />
              <span>これまでのきろく</span>
                    <span className="ml-2 text-sm font-normal text-gray-500">({responses.length}件)</span>
            </h2>
                  
                  {/* 表示切替ボタン */}
                  <div className="flex rounded-lg overflow-hidden border border-indigo-200">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 py-1.5 text-xs font-medium ${
                        viewMode === 'list' 
                          ? 'bg-indigo-500 text-white' 
                          : 'bg-white text-indigo-500 hover:bg-indigo-50'
                      }`}
                    >
                      リスト
                    </button>
                    <button
                      onClick={() => setViewMode('calendar')}
                      className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1 ${
                        viewMode === 'calendar' 
                          ? 'bg-indigo-500 text-white' 
                          : 'bg-white text-indigo-500 hover:bg-indigo-50'
                      }`}
                    >
                      <Calendar className="h-3 w-3" />
                      カレンダー
                    </button>
                  </div>
                </div>
                
                {viewMode === 'list' ? (
                  <>
                    <div className="space-y-3">
              {responses.map((response) => {
                const emotion = emotions.find(e => e.name === response.emotion);
                        const isExpanded = expandedResponseId === response.id;
                        
                return (
                  <div
                    key={response.id}
                            className={`rounded-xl border-2 ${
                      emotion?.borderColor || 'border-gray-100'
                            } ${emotion?.bgColor || 'bg-gray-50'} transition-all`}
                          >
                            <div 
                              className="p-3 flex items-center justify-between cursor-pointer hover:bg-opacity-80"
                              onClick={() => toggleResponseExpand(response.id)}
                            >
                              <div className="flex items-center gap-2">
                                {emotion && <emotion.icon className={`h-5 w-5 ${emotion.color}`} />}
                                <span className="font-bold text-sm">{response.emotion}</span>
                                <span className="text-gray-600 text-xs">
                        {new Date(response.created_at).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                              {isExpanded ? 
                                <ChevronUp className="h-4 w-4 text-gray-500" /> : 
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              }
                            </div>
                            
                            {isExpanded && (
                              <div className="px-3 pb-3">
                    {response.note && (
                                  <div className="mb-3">
                                    <p className="text-xs text-gray-500 mb-1">きょうのできごと:</p>
                                    <p className="text-sm text-gray-700">{response.note}</p>
                                  </div>
                    )}
                                
                    {response.sel_feedback && response.sel_feedback[0] && (
                                  <div className="p-3 bg-white/80 rounded-lg border border-indigo-100">
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                      <Sparkles className="h-4 w-4 text-indigo-600" />
                                      <span className="font-bold text-xs text-indigo-900">AIからのメッセージ</span>
                                    </div>
                                    <p className="text-xs text-indigo-700">{response.sel_feedback[0].feedback_text}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                        <div className="text-xs text-gray-500">
                          {currentPage} / {totalPages} ページ
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={goToPrevPage}
                            disabled={currentPage === 1}
                            className={`p-1.5 rounded-full ${
                              currentPage === 1 
                                ? 'text-gray-300 cursor-not-allowed' 
                                : 'text-indigo-600 hover:bg-indigo-50'
                            }`}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <button
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages}
                            className={`p-1.5 rounded-full ${
                              currentPage === totalPages 
                                ? 'text-gray-300 cursor-not-allowed' 
                                : 'text-indigo-600 hover:bg-indigo-50'
                            }`}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="calendar-view">
                    {/* カレンダーヘッダー */}
                    <div className="flex items-center justify-between mb-4">
                      <button 
                        onClick={() => changeMonth(-1)}
                        className="p-1.5 rounded-full text-indigo-600 hover:bg-indigo-50"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <h3 className="text-base font-bold text-gray-700">
                        {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
                      </h3>
                      <button 
                        onClick={() => changeMonth(1)}
                        className="p-1.5 rounded-full text-indigo-600 hover:bg-indigo-50"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {/* 曜日ヘッダー */}
                    <div className="grid grid-cols-7 gap-1 mb-1 text-center">
                      {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
                        <div 
                          key={day} 
                          className={`text-xs font-medium py-1 ${
                            index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-500'
                          }`}
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                    
                    {/* カレンダー本体 */}
                    <div className="grid grid-cols-7 gap-1">
                      {calendarDays.map((day, index) => {
                        if (!day) {
                          return <div key={`empty-${index}`} className="h-16 bg-gray-50 rounded-lg"></div>;
                        }
                        
                        const dateKey = `${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()}`;
                        const dayResponses = responsesByDate[dateKey] || [];
                        const hasResponses = dayResponses.length > 0;
                        
                        return (
                          <div 
                            key={dateKey}
                            className={`h-16 p-1 rounded-lg border ${
                              hasResponses 
                                ? 'border-indigo-200 bg-indigo-50 hover:bg-indigo-100 cursor-pointer' 
                                : 'border-gray-100 bg-white'
                            } relative`}
                            onClick={() => {
                              if (hasResponses && dayResponses[0]) {
                                toggleResponseExpand(dayResponses[0].id);
                              }
                            }}
                          >
                            <div className="text-xs font-medium mb-1">
                              {day.getDate()}
                            </div>
                            
                            {hasResponses && (
                              <div className="flex flex-wrap gap-0.5">
                                {dayResponses.slice(0, 3).map((response) => {
                                  const emotion = emotions.find(e => e.name === response.emotion);
                                  return (
                                    <div 
                                      key={response.id}
                                      className={`w-4 h-4 rounded-full ${emotion?.bgColor || 'bg-gray-200'} border ${emotion?.borderColor || 'border-gray-300'}`}
                                    >
                                      {expandedResponseId === response.id && (
                                        <div className="absolute top-full left-0 z-10 w-64 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 p-3">
                                          <div className="flex items-center gap-2 mb-2">
                                            {emotion && <emotion.icon className={`h-5 w-5 ${emotion.color}`} />}
                                            <span className="font-bold text-sm">{response.emotion}</span>
                                            <span className="text-gray-600 text-xs">
                                              {new Date(response.created_at).toLocaleDateString('ja-JP')}
                                            </span>
                                          </div>
                                          
                                          {response.note && (
                                            <div className="mb-3">
                                              <p className="text-xs text-gray-500 mb-1">きょうのできごと:</p>
                                              <p className="text-sm text-gray-700">{response.note}</p>
                                            </div>
                                          )}
                                          
                                          {response.sel_feedback && response.sel_feedback[0] && (
                                            <div className="p-2 bg-white/80 rounded-lg border border-indigo-100">
                                              <div className="flex items-center gap-1.5 mb-1">
                                                <Sparkles className="h-3 w-3 text-indigo-600" />
                                                <span className="font-bold text-xs text-indigo-900">AIからのメッセージ</span>
                                              </div>
                                              <p className="text-xs text-indigo-700">{response.sel_feedback[0].feedback_text}</p>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                                
                                {dayResponses.length > 3 && (
                                  <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-[8px] text-gray-600">
                                    +{dayResponses.length - 3}
                                  </div>
                                )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
            )}
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}