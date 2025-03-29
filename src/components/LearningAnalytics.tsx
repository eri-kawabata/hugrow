import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Book, CheckCircle, Clock, Star, BarChart, Award, ArrowLeft, Lightbulb, User, Calendar, TrendingUp, BookOpen, ChevronDown, ChevronUp, Brain, Cpu } from 'lucide-react';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Link, useNavigate } from 'react-router-dom';

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
  { id: 'science', name: '理科', color: 'from-green-400 to-green-600', textColor: 'text-green-600', bgColor: 'bg-green-100', icon: Lightbulb },
  { id: 'technology', name: '技術', color: 'from-blue-400 to-blue-600', textColor: 'text-blue-600', bgColor: 'bg-blue-100', icon: Cpu },
  { id: 'engineering', name: '工学', color: 'from-purple-400 to-purple-600', textColor: 'text-purple-600', bgColor: 'bg-purple-100', icon: Brain },
  { id: 'art', name: '芸術', color: 'from-pink-400 to-pink-600', textColor: 'text-pink-600', bgColor: 'bg-pink-100', icon: Star },
  { id: 'math', name: '数学', color: 'from-yellow-400 to-yellow-600', textColor: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: BarChart },
];

export function LearningAnalytics() {
  const navigate = useNavigate();
  const [childId, setChildId] = useState<string | null>(null);
  const [childName, setChildName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState<LearningProgress[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month');
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  // フェッチ関数を共通化
  const fetchChildrenData = async () => {
    if (!supabase) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // 親のプロファイルIDを取得
      const { data: parentProfile, error: parentError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .eq('role', 'parent')
        .single();

      if (parentError) {
        console.error('親プロファイル取得エラー:', parentError);
        return;
      }

      // 親に関連付けられた子供を取得
      const { data: childProfiles, error: childrenError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, user_id')
        .eq('parent_id', parentProfile.id)
        .eq('role', 'child');

      if (childrenError) {
        console.error('子供プロファイル取得エラー:', childrenError);
        return;
      }

      setChildren(childProfiles || []);
      
      // 最初の子供を選択
      if (childProfiles && childProfiles.length > 0) {
        setSelectedChildId(childProfiles[0].id);
        setChildId(childProfiles[0].user_id);
        setChildName(childProfiles[0].username);
      }
    } catch (err) {
      console.error('子供データ取得エラー:', err);
    }
  };

  // 子供一覧を取得
  useEffect(() => {
    fetchChildrenData();
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

        setProgressData(progressData || []);
        setLessons(lessonData || []);
        setLoading(false);
      } catch (error) {
        console.error('データ取得エラー:', error);
        toast.error('データの取得に失敗しました');
        setLoading(false);
      }
    };

    fetchData();
  }, [childId, timeRange]);

  // 子供選択変更ハンドラー
  const handleChildChange = (id: string, user_id: string, name: string) => {
    setSelectedChildId(id);
    setChildId(user_id);
    setChildName(name);
  };

  // 子供選択コンポーネント
  const ChildSelector = () => (
    <div className="bg-white rounded-xl shadow-md p-4 mb-6">
      <h3 className="text-lg font-semibold text-[#5d7799] mb-4">お子様を選択</h3>
      <div className="flex flex-wrap gap-3">
        {children.map(child => (
          <button
            key={child.id}
            onClick={() => handleChildChange(child.id, child.user_id, child.username)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
              selectedChildId === child.id 
                ? 'bg-[#5d7799] text-white' 
                : 'bg-gray-100 text-[#5d7799] hover:bg-gray-200'
            }`}
          >
            {child.avatar_url ? (
              <img 
                src={child.avatar_url} 
                alt={child.username} 
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <User className="w-5 h-5" />
            )}
            <span>{child.username}</span>
          </button>
        ))}
      </div>
    </div>
  );

  // 科目ごとの進捗
  const subjectProgress = subjects.map(subject => {
    const subjectLessons = lessons.filter(lesson => lesson.subject === subject.id);
    const completedLessons = progressData.filter(
      p => subjectLessons.some(l => l.id === p.lesson_id) && p.status === 'completed'
    );
    
    const totalLessons = subjectLessons.length || 1; // Division by 0を避ける
    const progress = (completedLessons.length / totalLessons) * 100;
    
    // 平均スコア計算
    const completedWithScore = completedLessons.filter(p => p.score !== null);
    const avgScore = completedWithScore.length > 0
      ? completedWithScore.reduce((acc, curr) => acc + (curr.score || 0), 0) / completedWithScore.length
      : 0;
    
    // 総合ポイント
    const totalPoints = completedLessons.reduce((acc, curr) => acc + (curr.score || 0), 0);
    
    return {
      ...subject,
      progress,
      completedCount: completedLessons.length,
      totalCount: totalLessons,
      avgScore,
      totalPoints,
    };
  });

  // 最近完了したレッスン
  const recentCompletedLessons = progressData
    .filter(p => p.status === 'completed')
    .sort((a, b) => {
      const dateA = a.completed_at ? new Date(a.completed_at).getTime() : 0;
      const dateB = b.completed_at ? new Date(b.completed_at).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  // 進行中のレッスン
  const inProgressLessons = progressData
    .filter(p => p.status === 'in_progress')
    .sort((a, b) => {
      const dateA = a.last_activity_at ? new Date(a.last_activity_at).getTime() : 0;
      const dateB = b.last_activity_at ? new Date(b.last_activity_at).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 3);

  // 総合達成率
  const totalLessons = lessons.length || 1;
  const completedCount = progressData.filter(p => p.status === 'completed').length;
  const overallProgress = (completedCount / totalLessons) * 100;

  // 総合スコア
  const totalScore = progressData
    .filter(p => p.status === 'completed')
    .reduce((acc, curr) => acc + (curr.score || 0), 0);

  // 総学習時間（秒）
  const totalTimeSpent = progressData.reduce((acc, curr) => acc + (curr.time_spent || 0), 0);

  // 時間をフォーマット: 秒→時間:分:秒
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}秒`;
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}時間${minutes}分`;
    } else {
      return `${minutes}分${remainingSeconds}秒`;
    }
  };

  // レッスン情報を取得
  const getLessonInfo = (lessonId: string) => {
    return lessons.find(lesson => lesson.id === lessonId) || null;
  };

  // 科目情報を取得
  const getSubjectInfo = (subjectId: string) => {
    return subjects.find(subject => subject.id === subjectId) || null;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 pb-32">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">学習進捗レポート</h1>
            <p className="opacity-90">
              {childName ? `${childName}さん` : 'お子様'}の学習の進捗状況を確認できます
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>

      {/* 子供選択 */}
      <ChildSelector />

      {/* 期間選択 */}
      <div className="mb-6 bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-500" />
            <h2 className="text-lg font-medium text-gray-900">期間</h2>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                timeRange === 'week'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              1週間
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                timeRange === 'month'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              1ヶ月
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                timeRange === 'all'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              全期間
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-500">データを読み込み中...</p>
        </div>
      ) : progressData.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 mb-4">
            <BookOpen size={24} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">学習データがありません</h3>
          <p className="text-gray-500 mb-6">
            この期間には学習の記録がありません。別の期間を選択するか、新しい学習を開始してください。
          </p>
          <button
            onClick={() => navigate('/child/learning')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            学習を始める
          </button>
        </div>
      ) : (
        <div className="space-y-8 mb-16">
          {/* ダッシュボード概要 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">総合進捗</h3>
                <div className="p-2 bg-blue-100 rounded-full">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="mb-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">完了率</span>
                  <span className="text-sm font-medium text-gray-900">{Math.round(overallProgress)}%</span>
                </div>
                <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-indigo-600 rounded-full"
                    style={{ width: `${overallProgress}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{completedCount} / {totalLessons} レッスン完了</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">獲得ポイント</h3>
                <div className="p-2 bg-purple-100 rounded-full">
                  <Award className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-gray-900">{totalScore}</span>
                <span className="text-sm text-gray-600 mb-1">ポイント</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                レベル: {Math.floor(totalScore / 1000) + 1}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 border border-green-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">学習時間</h3>
                <div className="p-2 bg-green-100 rounded-full">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-gray-900">{formatTime(totalTimeSpent)}</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                平均: {formatTime(Math.round(totalTimeSpent / (completedCount || 1)))} / レッスン
              </p>
            </div>
          </div>

          {/* 科目別進捗 */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-medium text-gray-900">科目別進捗</h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {subjectProgress.map((subject) => {
                  const SubjectIcon = subject.icon;
                  return (
                    <div key={subject.id} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 ${subject.bgColor} rounded-lg`}>
                            <SubjectIcon className={`h-5 w-5 ${subject.textColor}`} />
                          </div>
                          <span className="font-medium text-gray-900">{subject.name}</span>
                        </div>
                        <div className="text-sm">
                          <span className={`font-semibold ${subject.textColor}`}>{subject.completedCount}</span>
                          <span className="text-gray-500">/{subject.totalCount}完了</span>
                        </div>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden group-hover:h-3 transition-all">
                        <div
                          className={`h-full bg-gradient-to-r ${subject.color} rounded-full`}
                          style={{ width: `${subject.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 最近完了したレッスン */}
          {recentCompletedLessons.length > 0 && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-medium text-gray-900">最近完了したレッスン</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {recentCompletedLessons.map(lesson => {
                  const lessonInfo = getLessonInfo(lesson.lesson_id);
                  const subject = lessonInfo ? getSubjectInfo(lessonInfo.subject) : null;
                  
                  return (
                    <div key={lesson.id} className="p-5 hover:bg-gray-50">
                      <div className="flex justify-between">
                        <div className="flex items-start gap-4">
                          {subject && (
                            <div className={`p-2 ${subject.bgColor} rounded-lg shrink-0 mt-1`}>
                              <subject.icon className={`h-5 w-5 ${subject.textColor}`} />
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-1">
                              {lessonInfo?.title || 'レッスン名不明'}
                            </h4>
                            <p className="text-sm text-gray-500 mb-2">
                              {subject?.name || '科目不明'} • 難易度: {lessonInfo?.difficulty || '?'}/5
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{formatTime(lesson.time_spent || 0)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Award className="h-4 w-4" />
                                <span>{lesson.score || 0}ポイント</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <span>{lesson.completed_at ? format(new Date(lesson.completed_at), 'M月d日', { locale: ja }) : ''}</span>
                          <div className="flex items-center gap-1 justify-end mt-1 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span>完了</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 進行中のレッスン */}
          {inProgressLessons.length > 0 && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-medium text-gray-900">進行中のレッスン</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {inProgressLessons.map(lesson => {
                  const lessonInfo = getLessonInfo(lesson.lesson_id);
                  const subject = lessonInfo ? getSubjectInfo(lessonInfo.subject) : null;
                  
                  return (
                    <div key={lesson.id} className="p-5 hover:bg-gray-50">
                      <div className="flex justify-between">
                        <div className="flex items-start gap-4">
                          {subject && (
                            <div className={`p-2 ${subject.bgColor} rounded-lg shrink-0 mt-1`}>
                              <subject.icon className={`h-5 w-5 ${subject.textColor}`} />
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-1">
                              {lessonInfo?.title || 'レッスン名不明'}
                            </h4>
                            <p className="text-sm text-gray-500 mb-2">
                              {subject?.name || '科目不明'} • 難易度: {lessonInfo?.difficulty || '?'}/5
                            </p>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Clock className="h-4 w-4" />
                              <span>現在の学習時間: {formatTime(lesson.time_spent || 0)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <div className="mb-1">最終活動日: {lesson.last_activity_at ? format(new Date(lesson.last_activity_at), 'M月d日', { locale: ja }) : ''}</div>
                          <button className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium hover:bg-indigo-200 transition-colors">
                            続ける
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* 下部の余白 */}
      <div className="h-8"></div>
    </div>
  );
} 