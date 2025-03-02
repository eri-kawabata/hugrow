import { useEffect, useState, useMemo } from 'react';
import { LearningLayout } from '../LearningLayout';
import { db } from '../../../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '../../../hooks/useAuth';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Trophy, Brain, Clock, TrendingUp, BookOpen, Calendar, ArrowUp, ArrowDown } from 'lucide-react';
import { LEARNING_ROUTES } from '../../../constants/navigation';

type AnalyticsData = {
  category: string;
  topic: string;
  totalQuestions: number;
  correctAnswers: number;
  bestStreak: number;
  lastUpdated: Date;
};

type CategoryAnalysis = {
  category: string;
  totalQuestions: number;
  correctRate: number;
  recentProgress: number;
  needsAttention: boolean;
};

// 学習時間帯の分析用の型
type TimeSlotAnalysis = {
  hour: number;
  count: number;
  correctRate: number;
};

export function LearningAnalytics() {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;

      try {
        const progressRef = collection(db, 'learningProgress');
        const progressSnap = await getDocs(query(
          progressRef,
          where('userId', '==', user.uid)
        ));

        const data: AnalyticsData[] = [];
        progressSnap.forEach(doc => {
          const progressData = doc.data();
          Object.entries(progressData).forEach(([category, topics]) => {
            Object.entries(topics as any).forEach(([topic, stats]) => {
              data.push({
                category,
                topic,
                ...stats as any
              });
            });
          });
        });

        setAnalyticsData(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  // カテゴリー別の分析データを計算
  const categoryAnalysis = useMemo(() => {
    const analysis: CategoryAnalysis[] = [];
    const categories = new Map<string, AnalyticsData[]>();

    // データをカテゴリーごとにグループ化
    analyticsData.forEach(data => {
      if (!categories.has(data.category)) {
        categories.set(data.category, []);
      }
      categories.get(data.category)?.push(data);
    });

    // カテゴリーごとの分析
    categories.forEach((data, category) => {
      const totalQuestions = data.reduce((sum, d) => sum + d.totalQuestions, 0);
      const correctAnswers = data.reduce((sum, d) => sum + d.correctAnswers, 0);
      const correctRate = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

      // 最近の進捗（直近5問の正答率）
      const recentProgress = data
        .slice(-5)
        .reduce((sum, d) => sum + (d.correctAnswers / d.totalQuestions), 0) / 5 * 100;

      analysis.push({
        category,
        totalQuestions,
        correctRate,
        recentProgress,
        needsAttention: correctRate < 70 || recentProgress < correctRate
      });
    });

    return analysis;
  }, [analyticsData]);

  // 時間帯別の学習効率分析
  const timeSlotAnalysis = useMemo(() => {
    const slots: TimeSlotAnalysis[] = [];
    const timeData = new Map<number, { total: number; correct: number }>();

    analyticsData.forEach(data => {
      const hour = new Date(data.lastUpdated).getHours();
      if (!timeData.has(hour)) {
        timeData.set(hour, { total: 0, correct: 0 });
      }
      const current = timeData.get(hour)!;
      current.total += data.totalQuestions;
      current.correct += data.correctAnswers;
    });

    timeData.forEach((data, hour) => {
      slots.push({
        hour,
        count: data.total,
        correctRate: (data.correct / data.total) * 100
      });
    });

    return slots.sort((a, b) => b.correctRate - a.correctRate);
  }, [analyticsData]);

  // 最適な学習時間帯の提案
  const bestTimeSlots = useMemo(() => {
    return timeSlotAnalysis
      .filter(slot => slot.count >= 5) // 十分なデータがある時間帯のみ
      .slice(0, 3); // 上位3つの時間帯
  }, [timeSlotAnalysis]);

  // 学習傾向の分析
  const learningTrends = useMemo(() => {
    const trends = categoryAnalysis.map(cat => ({
      category: cat.category,
      trend: cat.recentProgress - cat.correctRate,
      currentRate: cat.correctRate
    }));

    return {
      improving: trends.filter(t => t.trend > 5),
      declining: trends.filter(t => t.trend < -5)
    };
  }, [categoryAnalysis]);

  // 推奨コンテンツの生成
  const recommendations = useMemo(() => {
    const needsWork = categoryAnalysis
      .filter(a => a.needsAttention)
      .map(a => a.category);

    return LEARNING_ROUTES.child.routes[0].children
      ?.filter(route => needsWork.includes(route.path.split('/').pop() || ''))
      .slice(0, 3);
  }, [categoryAnalysis]);

  return (
    <LearningLayout title="学習分析" showBackButton={false}>
      <div className="space-y-8">
        {/* 概要カード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Brain className="h-5 w-5 text-blue-500" />
              <h3 className="font-bold">総学習問題数</h3>
            </div>
            <p className="text-2xl font-bold">
              {analyticsData.reduce((sum, data) => sum + data.totalQuestions, 0)}問
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="h-5 w-5 text-blue-500" />
              <h3 className="font-bold">最高連続正解</h3>
            </div>
            <p className="text-2xl font-bold">
              {Math.max(...analyticsData.map(data => data.bestStreak))}回
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <h3 className="font-bold">最近の学習</h3>
            </div>
            <p className="text-lg">
              {analyticsData.length > 0 
                ? new Date(Math.max(...analyticsData.map(data => data.lastUpdated.getTime())))
                    .toLocaleDateString('ja-JP')
                : '未学習'}
            </p>
          </div>
        </div>

        {/* 期間選択 */}
        <div className="flex gap-2">
          {(['week', 'month', 'all'] as const).map(period => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg ${
                selectedPeriod === period 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {period === 'week' ? '週間' : period === 'month' ? '月間' : '全期間'}
            </button>
          ))}
        </div>

        {/* 進捗トレンド */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <h3 className="font-bold">学習の進み具合</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={categoryAnalysis}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="correctRate" 
                  stroke="#3B82F6" 
                  name="正答率"
                />
                <Line 
                  type="monotone" 
                  dataKey="recentProgress" 
                  stroke="#10B981" 
                  name="最近の進捗"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 学習傾向 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 上昇傾向 */}
          {learningTrends.improving.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <ArrowUp className="h-5 w-5 text-green-500" />
                <h3 className="font-bold">上達している分野</h3>
              </div>
              <ul className="space-y-3">
                {learningTrends.improving.map(trend => (
                  <li key={trend.category} className="flex justify-between items-center">
                    <span>{trend.category}</span>
                    <span className="text-green-500">+{trend.trend.toFixed(1)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 下降傾向 */}
          {learningTrends.declining.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <ArrowDown className="h-5 w-5 text-red-500" />
                <h3 className="font-bold">復習をおすすめする分野</h3>
              </div>
              <ul className="space-y-3">
                {learningTrends.declining.map(trend => (
                  <li key={trend.category} className="flex justify-between items-center">
                    <span>{trend.category}</span>
                    <span className="text-red-500">{trend.trend.toFixed(1)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 最適な学習時間 */}
        {bestTimeSlots.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="h-5 w-5 text-blue-500" />
              <h3 className="font-bold">おすすめの学習時間</h3>
            </div>
            <div className="space-y-4">
              {bestTimeSlots.map(slot => (
                <div key={slot.hour} className="flex justify-between items-center">
                  <span>{`${slot.hour}:00 - ${slot.hour + 1}:00`}</span>
                  <span className="text-blue-500">
                    正答率 {slot.correctRate.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 推奨コンテンツ */}
        {recommendations && recommendations.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="h-5 w-5 text-blue-500" />
              <h3 className="font-bold">おすすめの学習</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendations.map(rec => (
                <a
                  key={rec.path}
                  href={rec.path}
                  className="p-4 border rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <h4 className="font-bold mb-2">{rec.label}</h4>
                  <p className="text-sm text-gray-600">
                    もう少し練習してみましょう
                  </p>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </LearningLayout>
  );
} 