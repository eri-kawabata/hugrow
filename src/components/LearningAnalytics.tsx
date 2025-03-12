import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Book, CheckCircle, Clock, Star, BarChart, Award, ArrowRight, Lightbulb, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Link } from 'react-router-dom';

// 学習進捗の型定義
type LearningProgress = {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at: string | null;
  started_at: string;
  last_activity_at: string | null;
  last_position: number;
  quiz_score: number | null;
  score: number | null;
  difficulty_level: number | null;
  time_spent: number | null;
  attempts: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'archived';
  progress_data: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
};

// レッスンの型定義
type Lesson = {
  id: string;
  subject: string;
  title: string;
  description: string;
  difficulty: number;
  duration: number;
  points: number;
  order: number;
  status: string;
  created_at: string;
  updated_at: string | null;
};

// 科目の定義
const subjects = [
  { id: 'science', name: '理科', color: 'bg-green-500', icon: Lightbulb },
  { id: 'technology', name: '技術', color: 'bg-blue-500', icon: BarChart },
  { id: 'engineering', name: '工学', color: 'bg-purple-500', icon: Book },
  { id: 'art', name: '芸術', color: 'bg-pink-500', icon: Star },
  { id: 'math', name: '数学', color: 'bg-yellow-500', icon: Clock },
];

export function LearningAnalytics() {
  const [childId, setChildId] = useState<string | null>(null);
  const [childName, setChildName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState<LearningProgress[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month');

  // 子供のIDを取得
  useEffect(() => {
    const fetchChildId = async () => {
      if (!supabase) return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 親に関連付けられた子供を取得
        const { data, error } = await supabase
          .from('parent_child_relations')
          .select('child_id')
          .eq('parent_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        if (error) {
          console.error('子供の情報取得エラー:', error.message, error.details, error.hint);
          toast.error('子供の情報取得に失敗しました');
          return;
        }

        if (data) {
          setChildId(data.child_id);
          
          // 子供の名前を取得
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('username')
            .eq('user_id', data.child_id)
            .maybeSingle();
            
          if (profileError) {
            console.error('プロフィール取得エラー:', profileError.message, profileError.details);
          } else if (profileData) {
            setChildName(profileData.username);
          }
        } else {
          // データが見つからない場合の処理
          console.log('子供の情報が見つかりませんでした。親子関係が設定されていない可能性があります。');
          toast.warning('子供の情報が見つかりませんでした');
        }
      } catch (error) {
        console.error('エラー:', error);
        toast.error('データ取得中にエラーが発生しました');
      }
    };

    fetchChildId();
  }, []);

  // 学習進捗とレッスンデータを取得
  useEffect(() => {
    if (!childId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // 期間に応じたデータ取得
        const now = new Date();
        let startDate = new Date();
        
        if (timeRange === 'week') {
          startDate.setDate(now.getDate() - 7);
        } else if (timeRange === 'month') {
          startDate.setMonth(now.getMonth() - 1);
        } else {
          // 全期間の場合は日付制限なし
          startDate = new Date(0); // 1970年1月1日
        }

        // 学習進捗を取得
        const { data: progressData, error: progressError } = await supabase
          .from('learning_progress')
          .select('*')
          .eq('user_id', childId)
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: false });

        if (progressError) {
          console.error('学習進捗取得エラー:', progressError.message, progressError.details);
          toast.error('学習データの取得に失敗しました');
          setLoading(false);
          return;
        }

        // レッスン情報を取得
        const { data: lessonData, error: lessonError } = await supabase
          .from('lessons')
          .select('*')
          .order('order', { ascending: true });

        if (lessonError) {
          console.error('レッスン取得エラー:', lessonError.message, lessonError.details);
          toast.error('レッスンデータの取得に失敗しました');
          setLoading(false);
          return;
        }

        // データが存在しない場合はダミーデータを使用
        if ((!progressData || progressData.length === 0) && (!lessonData || lessonData.length === 0)) {
          console.log('学習データとレッスンデータが両方とも存在しません。ダミーデータを使用します。');
          
          // ダミーのレッスンデータ
          const dummyLessons: Lesson[] = [
            {
              id: 'lesson-science-1',
              subject: 'science',
              title: '植物の成長と光合成',
              description: '植物がどのように成長し、光合成を行うかを学びます。',
              difficulty: 1,
              duration: 30,
              points: 100,
              order: 1,
              status: 'active',
              created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: null
            },
            {
              id: 'lesson-science-2',
              subject: 'science',
              title: '動物の生態系',
              description: '様々な動物の生態系と環境への適応について学びます。',
              difficulty: 2,
              duration: 45,
              points: 150,
              order: 2,
              status: 'active',
              created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: null
            },
            {
              id: 'lesson-technology-1',
              subject: 'technology',
              title: 'コンピュータの仕組み',
              description: 'コンピュータがどのように動作するかの基本を学びます。',
              difficulty: 1,
              duration: 40,
              points: 120,
              order: 1,
              status: 'active',
              created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: null
            },
            {
              id: 'lesson-engineering-1',
              subject: 'engineering',
              title: '橋の設計と構造',
              description: '橋の設計原理と構造力学の基本を学びます。',
              difficulty: 3,
              duration: 60,
              points: 200,
              order: 1,
              status: 'active',
              created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: null
            },
            {
              id: 'lesson-art-1',
              subject: 'art',
              title: '色彩理論の基礎',
              description: '色の組み合わせと感情表現について学びます。',
              difficulty: 1,
              duration: 35,
              points: 110,
              order: 1,
              status: 'active',
              created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: null
            },
            {
              id: 'lesson-math-1',
              subject: 'math',
              title: '図形と空間認識',
              description: '2次元と3次元の図形について学びます。',
              difficulty: 2,
              duration: 50,
              points: 180,
              order: 1,
              status: 'active',
              created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: null
            }
          ];
          
          // ダミーの学習進捗データ
          const dummyProgress: LearningProgress[] = [
            {
              id: 'progress-1',
              user_id: childId,
              lesson_id: 'lesson-science-1',
              completed: true,
              completed_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
              started_at: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
              last_activity_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
              last_position: 100,
              quiz_score: 85,
              score: 90,
              difficulty_level: 1,
              time_spent: 1800, // 30分
              attempts: 1,
              status: 'completed',
              progress_data: { total_sections: 5, current_section: 5, completed_sections: [1, 2, 3, 4, 5] },
              metadata: {},
              created_at: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 'progress-2',
              user_id: childId,
              lesson_id: 'lesson-technology-1',
              completed: true,
              completed_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
              started_at: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
              last_activity_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
              last_position: 100,
              quiz_score: 90,
              score: 95,
              difficulty_level: 1,
              time_spent: 2400, // 40分
              attempts: 1,
              status: 'completed',
              progress_data: { total_sections: 4, current_section: 4, completed_sections: [1, 2, 3, 4] },
              metadata: {},
              created_at: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 'progress-3',
              user_id: childId,
              lesson_id: 'lesson-art-1',
              completed: true,
              completed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              started_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
              last_activity_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              last_position: 100,
              quiz_score: 80,
              score: 85,
              difficulty_level: 1,
              time_spent: 2100, // 35分
              attempts: 1,
              status: 'completed',
              progress_data: { total_sections: 3, current_section: 3, completed_sections: [1, 2, 3] },
              metadata: {},
              created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 'progress-4',
              user_id: childId,
              lesson_id: 'lesson-science-2',
              completed: false,
              completed_at: null,
              started_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              last_activity_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              last_position: 60,
              quiz_score: null,
              score: null,
              difficulty_level: 2,
              time_spent: 1500, // 25分
              attempts: 1,
              status: 'in_progress',
              progress_data: { total_sections: 5, current_section: 3, completed_sections: [1, 2] },
              metadata: {},
              created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 'progress-5',
              user_id: childId,
              lesson_id: 'lesson-math-1',
              completed: false,
              completed_at: null,
              started_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              last_activity_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              last_position: 30,
              quiz_score: null,
              score: null,
              difficulty_level: 2,
              time_spent: 900, // 15分
              attempts: 1,
              status: 'in_progress',
              progress_data: { total_sections: 4, current_section: 2, completed_sections: [1] },
              metadata: {},
              created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            }
          ];
          
          setLessons(dummyLessons);
          setProgressData(dummyProgress);
        } else {
          setProgressData(progressData || []);
          console.log('取得した学習進捗データ:', progressData?.length || 0, '件');
          setLessons(lessonData || []);
          console.log('取得したレッスンデータ:', lessonData?.length || 0, '件');
        }
      } catch (error) {
        console.error('データ取得エラー:', error);
        toast.error('データの取得中にエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [childId, timeRange]);

  // 科目ごとの進捗を計算
  const subjectProgress = subjects.map(subject => {
    const subjectLessons = lessons.filter(lesson => lesson.subject === subject.id);
    const completedLessons = progressData.filter(
      progress => 
        subjectLessons.some(lesson => lesson.id === progress.lesson_id) && 
        progress.status === 'completed'
    );
    
    const totalLessons = subjectLessons.length;
    const completedCount = completedLessons.length;
    const completionRate = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
    
    // 総学習時間（秒）
    const totalTimeSpent = progressData
      .filter(progress => subjectLessons.some(lesson => lesson.id === progress.lesson_id))
      .reduce((sum, progress) => sum + (progress.time_spent || 0), 0);
    
    // 平均スコア
    const scores = completedLessons
      .map(progress => progress.score)
      .filter((score): score is number => score !== null);
    
    const averageScore = scores.length > 0 
      ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) 
      : null;
    
    return {
      ...subject,
      totalLessons,
      completedCount,
      completionRate,
      totalTimeSpent,
      averageScore,
      lastActivity: completedLessons.length > 0 
        ? completedLessons.sort((a, b) => 
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          )[0].updated_at
        : null
    };
  });

  // 最近完了したレッスン
  const recentCompletedLessons = progressData
    .filter(progress => progress.status === 'completed')
    .sort((a, b) => new Date(b.completed_at || '').getTime() - new Date(a.completed_at || '').getTime())
    .slice(0, 5)
    .map(progress => {
      const lesson = lessons.find(l => l.id === progress.lesson_id);
      const subject = subjects.find(s => lesson?.subject === s.id);
      
      return {
        ...progress,
        lessonTitle: lesson?.title || '不明なレッスン',
        subjectName: subject?.name || '不明',
        subjectColor: subject?.color || 'bg-gray-500'
      };
    });

  // 現在進行中のレッスン
  const inProgressLessons = progressData
    .filter(progress => progress.status === 'in_progress')
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 3)
    .map(progress => {
      const lesson = lessons.find(l => l.id === progress.lesson_id);
      const subject = subjects.find(s => lesson?.subject === s.id);
      
      return {
        ...progress,
        lessonTitle: lesson?.title || '不明なレッスン',
        subjectName: subject?.name || '不明',
        subjectColor: subject?.color || 'bg-gray-500'
      };
    });

  // 総合統計
  const totalStats = {
    completedLessons: progressData.filter(p => p.status === 'completed').length,
    totalTimeSpent: progressData.reduce((sum, p) => sum + (p.time_spent || 0), 0),
    averageScore: (() => {
      const scores = progressData
        .filter(p => p.status === 'completed')
        .map(p => p.score)
        .filter((score): score is number => score !== null);
      
      return scores.length > 0 
        ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) 
        : null;
    })(),
    startedLessons: progressData.filter(p => p.status === 'in_progress').length
  };

  // 時間を表示用にフォーマット
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}時間${minutes > 0 ? ` ${minutes}分` : ''}`;
    }
    return `${minutes}分`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">学習進捗</h1>
        <p className="text-gray-600 mt-1">
          {childName ? `${childName}さん` : 'お子様'}の学習進捗状況を確認できます
        </p>
      </div>

      {/* 期間選択 */}
      <div className="mb-6 flex justify-end">
        <div className="inline-flex rounded-md shadow-sm">
          <button
            type="button"
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
              timeRange === 'week'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-200`}
          >
            週間
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 text-sm font-medium ${
              timeRange === 'month'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border-t border-b border-gray-200`}
          >
            月間
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('all')}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
              timeRange === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-200`}
          >
            全期間
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : !childId ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-yellow-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">親子関係が設定されていません</h3>
          <p className="text-gray-500 mb-4">
            子供のアカウントとの関連付けが必要です。プロフィール設定から親子関係を設定してください。
          </p>
          <Link to="/parent/profile" className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            プロフィール設定へ
          </Link>
        </div>
      ) : progressData.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Book className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">まだ学習データがありません</h3>
          <p className="text-gray-500">
            {childName ? `${childName}さん` : 'お子様'}がレッスンを開始すると、ここに進捗が表示されます。
          </p>
        </div>
      ) : (
        <>
          {/* 総合統計 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="rounded-full bg-green-100 p-3 mr-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">完了レッスン</p>
                  <p className="text-2xl font-bold text-gray-900">{totalStats.completedLessons}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="rounded-full bg-blue-100 p-3 mr-4">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">総学習時間</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalStats.totalTimeSpent > 0 
                      ? formatTime(totalStats.totalTimeSpent)
                      : '0分'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="rounded-full bg-yellow-100 p-3 mr-4">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">平均スコア</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalStats.averageScore !== null 
                      ? `${totalStats.averageScore}点`
                      : '-'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="rounded-full bg-purple-100 p-3 mr-4">
                  <Book className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">進行中レッスン</p>
                  <p className="text-2xl font-bold text-gray-900">{totalStats.startedLessons}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 科目別進捗 */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">科目別進捗</h3>
              <BarChart className="h-5 w-5 text-indigo-600" />
            </div>
            
            <div className="space-y-6">
              {subjectProgress.map((subject) => {
                const Icon = subject.icon;
                return (
                  <div key={subject.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className={`rounded-full ${subject.color} p-2 mr-3`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <h4 className="font-medium text-gray-800">{subject.name}</h4>
                      </div>
                      <span className="text-sm font-medium">
                        {subject.completedCount}/{subject.totalLessons} 完了
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
                      <div 
                        className={`h-2.5 rounded-full ${subject.color}`} 
                        style={{ width: `${subject.completionRate}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>
                        {subject.totalTimeSpent > 0 
                          ? `学習時間: ${formatTime(subject.totalTimeSpent)}`
                          : '未学習'}
                      </span>
                      {subject.averageScore !== null && (
                        <span>平均スコア: {subject.averageScore}点</span>
                      )}
                      {subject.lastActivity && (
                        <span>
                          最終活動: {format(parseISO(subject.lastActivity), 'MM/dd', { locale: ja })}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 最近完了したレッスン */}
          {recentCompletedLessons.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">最近完了したレッスン</h3>
                <Award className="h-5 w-5 text-green-600" />
              </div>
              
              <div className="space-y-4">
                {recentCompletedLessons.map((lesson) => (
                  <div key={lesson.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-2 h-10 ${lesson.subjectColor} rounded-l-full mr-4`}></div>
                      <div>
                        <h4 className="font-medium text-gray-800">{lesson.lessonTitle}</h4>
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-gray-500 mr-3">{lesson.subjectName}</span>
                          {lesson.score !== null && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                              {lesson.score}点
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm text-gray-600">完了</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {lesson.completed_at && format(parseISO(lesson.completed_at), 'yyyy/MM/dd', { locale: ja })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 進行中のレッスン */}
          {inProgressLessons.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">進行中のレッスン</h3>
                <ArrowRight className="h-5 w-5 text-indigo-600" />
              </div>
              
              <div className="space-y-4">
                {inProgressLessons.map((lesson) => (
                  <div key={lesson.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-2 h-10 ${lesson.subjectColor} rounded-l-full mr-4`}></div>
                      <div>
                        <h4 className="font-medium text-gray-800">{lesson.lessonTitle}</h4>
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-gray-500">{lesson.subjectName}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="w-32">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>進捗</span>
                          <span>{Math.round(lesson.last_position)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="h-1.5 rounded-full bg-indigo-500" 
                            style={{ width: `${lesson.last_position}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 