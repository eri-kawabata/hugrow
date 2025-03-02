import React, { useState, useEffect } from 'react';
import { Layout } from './Layout';
import { Calendar, TrendingUp, MessageCircle, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { SELResponse } from '../lib/types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { toast } from 'react-hot-toast';

const emotions = [
  { name: 'とてもうれしい', color: '#FCD34D', intensity: 5 },
  { name: 'うれしい', color: '#F472B6', intensity: 4 },
  { name: 'ふつう', color: '#A78BFA', intensity: 3 },
  { name: 'すこしかなしい', color: '#60A5FA', intensity: 2 },
  { name: 'かなしい', color: '#818CF8', intensity: 1 },
];

type TimeRange = 'week' | 'month' | 'year';

export function SELAnalytics() {
  const [responses, setResponses] = useState<SELResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [childName, setChildName] = useState<string>('');

  useEffect(() => {
    fetchResponses();
  }, [timeRange]);

  const fetchResponses = async () => {
    if (!supabase) return;

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 期間に応じたデータ取得
      const now = new Date();
      const startDate = new Date();
      switch (timeRange) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      // 自分の感情記録を取得
      const { data, error } = await supabase
        .from('sel_responses')
        .select(`
          *,
          sel_feedback (
            id,
            feedback_text,
            created_at
          )
        `)
        .eq('user_id', user.id) // 認証ユーザーのIDを使用
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // プロフィール情報を取得
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('user_id', user.id)
        .single();

      setChildName(profile?.username || '');
      setResponses(data || []);
    } catch (error) {
      console.error('Error fetching responses:', error);
      toast.error('データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 感情の推移データを作成
  const emotionTrendData = responses.map(response => ({
    date: new Date(response.created_at).toLocaleDateString('ja-JP'),
    intensity: emotions.find(e => e.name === response.emotion)?.intensity || 3,
    emotion: response.emotion
  }));

  // 感情の割合データを作成
  const emotionDistributionData = emotions.map(emotion => ({
    name: emotion.name,
    value: responses.filter(r => r.emotion === emotion.name).length,
    color: emotion.color
  })).filter(data => data.value > 0);

  const handleExport = () => {
    const csvData = responses.map(response => ({
      日付: new Date(response.created_at).toLocaleDateString('ja-JP'),
      感情: response.emotion,
      メモ: response.note || '',
      AIフィードバック: response.sel_feedback?.[0]?.feedback_text || ''
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '感情記録.csv';
    link.click();
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-8 text-white shadow-lg mb-8">
          <h1 className="text-3xl font-bold mb-2">感情分析レポート</h1>
          <p className="text-lg opacity-90">
            {childName ? `${childName}さんの` : 'お子様の'}感情の変化を分析
          </p>
        </div>

        <div className="flex justify-between items-center mb-8">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="week">1週間</option>
            <option value="month">1ヶ月</option>
            <option value="year">1年</option>
          </select>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="h-5 w-5 text-gray-600" />
            <span>エクスポート</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 感情の推移グラフ */}
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              感情の推移
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={emotionTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} />
                  <Tooltip
                    content={({ payload }) => {
                      if (!payload?.length) return null;
                      return (
                        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow">
                          <p className="font-medium">{payload[0].payload.emotion}</p>
                          <p className="text-gray-500">{payload[0].payload.date}</p>
                        </div>
                      );
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="intensity"
                    stroke="#6366F1"
                    strokeWidth={2}
                    dot={{ fill: '#6366F1' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 感情の分布 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <PieChart className="h-5 w-5 text-indigo-600" />
              感情の分布
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={emotionDistributionData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => 
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {emotionDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 詳細な記録 */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-indigo-600" />
            詳細な記録
          </h2>
          <div className="space-y-4">
            {responses.map((response) => {
              const emotion = emotions.find(e => e.name === response.emotion);
              return (
                <div
                  key={response.id}
                  className="p-4 rounded-lg bg-gray-50 border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-gray-500" />
                      <span className="text-gray-900">
                        {new Date(response.created_at).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                    <span
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      style={{
                        backgroundColor: emotion?.color + '33',
                        color: emotion?.color
                      }}
                    >
                      {response.emotion}
                    </span>
                  </div>
                  {response.note && (
                    <p className="text-gray-700 mb-2">{response.note}</p>
                  )}
                  {response.sel_feedback && response.sel_feedback[0] && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">AIフィードバック: </span>
                      {response.sel_feedback[0].feedback_text}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
} 