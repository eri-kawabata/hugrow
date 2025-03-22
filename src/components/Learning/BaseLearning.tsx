import React, { memo, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Clock, Trophy, Sparkles, Brain, Target, Award } from 'lucide-react';
import { GradientHeader } from '@/components/Common/GradientHeader';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { PointsDisplay } from './PointsDisplay';
import toast from 'react-hot-toast';
import { playSound, preloadAudio } from '@/utils/audio';
import { supabase } from '@/lib/supabase';

// 進捗データの型定義
type ProgressData = {
  completedLessons: string[];
  totalPoints: number;
  level: number;
  badges: string[];
  subjectProgress: {
    [key: string]: {
      totalLessons: number;
      completedLessons: number;
      averageScore: number;
      skillAcquisition: {
        [key: string]: number;
      };
    };
  };
};

export type LessonCardProps = {
  id: string;
  title: string;
  description: string;
  difficulty: 1 | 2 | 3;
  duration: number;
  points: number;
  completed?: boolean;
  onClick: () => void;
  color?: string;
  icon?: React.ElementType;
  subjectCategory?: 'science' | 'technology' | 'engineering' | 'art' | 'math' | 'integrated';
  learningType?: 'theory' | 'practice' | 'experiment' | 'project' | 'quiz' | 'game' | 'simulation' | 'interactive';
  skillTags?: string[];
  prerequisites?: string[];
  nextLessons?: string[];
  learningObjectives?: string[];
  achievementCriteria?: Record<string, number>;
  skillAcquisition?: Record<string, number>;
};

const LessonCard = memo(({ 
  id,
  title, 
  description, 
  difficulty, 
  duration, 
  points,
  completed,
  onClick,
  color = 'from-blue-400 to-indigo-400',
  icon: Icon,
  subjectCategory,
  learningType,
  skillTags,
  prerequisites,
  learningObjectives,
  skillAcquisition,
  nextLessons
}: LessonCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const getCategoryColor = (category: string) => {
    const colors = {
      science: 'from-green-400 to-teal-400',
      technology: 'from-blue-400 to-indigo-400',
      engineering: 'from-purple-400 to-pink-400',
      art: 'from-red-400 to-orange-400',
      math: 'from-yellow-400 to-amber-400',
      integrated: 'from-indigo-400 to-purple-400'
    };
    return colors[category] || color;
  };

  const getCategoryName = (category: string): string => {
    const categories = {
      science: 'りか',
      technology: 'テクノロジー',
      engineering: 'こうがく',
      art: 'びじゅつ',
      math: 'さんすう',
      integrated: 'そうごう'
    };
    return categories[category] || 'そうごう';
  };

  const getLearningTypeIcon = (type: string) => {
    const icons = {
      theory: '📚',
      practice: '✏️',
      experiment: '🧪',
      project: '🎯',
      quiz: '❓',
      game: '🎮',
      simulation: '💻',
      interactive: '🤝'
    };
    return icons[type] || '📖';
  };

  const getLearningTypeName = (type: string): string => {
    const types = {
      theory: 'がくしゅう',
      practice: 'れんしゅう',
      experiment: 'じっけん',
      project: 'プロジェクト',
      quiz: 'クイズ',
      game: 'ゲーム',
      simulation: 'シミュレーション',
      interactive: 'たいけん'
    };
    return types[type] || 'がくしゅう';
  };

  return (
    <motion.div
      onClick={() => setShowDetails(!showDetails)}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.03 }}
      className="w-full"
    >
      <motion.button
        onClick={onClick}
        className={`
          w-full text-left block bg-white rounded-3xl shadow-lg 
          transition-all duration-300 p-8 relative
          ${completed ? 'border-4 border-green-400' : 'border-2 border-transparent'}
        `}
      >
        <div className="absolute -top-2 -right-2">
          <AnimatePresence>
            {completed && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className={`bg-gradient-to-br ${color} p-3 rounded-full shadow-lg`}
              >
                <Trophy className="h-6 w-6 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            {Icon && (
              <div className={`bg-gradient-to-br ${color} p-3 rounded-2xl`}>
                <Icon className="h-8 w-8 text-white" />
              </div>
            )}
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
              <p className="mt-2 text-lg text-gray-600">{description}</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-gray-600">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400" />
              <motion.span 
                className="text-lg"
                animate={{ scale: isHovered ? 1.1 : 1 }}
              >
                {'★'.repeat(difficulty)}
                {'☆'.repeat(3 - difficulty)}
              </motion.span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span className="text-lg">{duration}ぷん</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              <span className="text-lg">{points}ポイント</span>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500">きょうか:</span>
              <span className={`px-2 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r ${getCategoryColor(subjectCategory || 'integrated')}`}>
                {getCategoryName(subjectCategory || 'integrated')}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500">がくしゅうタイプ:</span>
              <span className="flex items-center gap-1">
                {getLearningTypeIcon(learningType || 'theory')}
                <span className="text-sm">{getLearningTypeName(learningType || 'theory')}</span>
              </span>
            </div>

            {skillTags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skillTags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.button>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-2 p-6 bg-white rounded-2xl shadow-lg"
          >
            {prerequisites?.length > 0 && (
              <div className="mb-4">
                <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  前提レッスン
                </h4>
                <ul className="mt-2 space-y-1">
                  {prerequisites.map(prereq => (
                    <li key={prereq} className="text-gray-600">• {prereq}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mb-4">
              <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                学習目標
              </h4>
              <ul className="mt-2 space-y-1">
                {learningObjectives?.map((objective, index) => (
                  <li key={index} className="text-gray-600">• {objective}</li>
                ))}
              </ul>
            </div>

            {skillAcquisition && Object.keys(skillAcquisition).length > 0 && (
              <div className="mb-4">
                <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Award className="h-5 w-5 text-green-500" />
                  獲得スキル
                </h4>
                <div className="mt-2 space-y-2">
                  {Object.entries(skillAcquisition).map(([skill, level]) => (
                    <div key={skill} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-600">{skill}</span>
                        <span className="text-gray-500">{level}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-400 to-teal-400 rounded-full transition-all duration-500"
                          style={{ width: `${level}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {nextLessons && nextLessons.length > 0 && (
              <div className="mb-4">
                <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <ArrowLeft className="h-5 w-5 text-indigo-500" />
                  次のレッスン
                </h4>
                <ul className="mt-2 space-y-1">
                  {nextLessons.map(lesson => (
                    <li key={lesson} className="text-gray-600">• {lesson}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

LessonCard.displayName = 'LessonCard';

export type Lesson = Omit<LessonCardProps, 'onClick'>;

type BaseLearningProps = {
  title: string;
  description: string;
  lessons: readonly Lesson[];
  gradientColors?: {
    from: string;
    via?: string;
    to: string;
  };
};

export function BaseLearning({ 
  title, 
  description, 
  lessons,
  gradientColors = {
    from: '#8ec5d6',
    via: '#f7c5c2',
    to: '#f5f6bf'
  }
}: BaseLearningProps) {
  const navigate = useNavigate();
  const [progressData, setProgressData] = useState<ProgressData>({
    completedLessons: [],
    totalPoints: 0,
    level: 1,
    badges: [],
    subjectProgress: {}
  });

  useEffect(() => {
    // 音声ファイルのプリロード
    preloadAudio();
    
    // データベースから進捗データを読み込む
    loadProgress();

    // リアルタイム更新のサブスクリプションを設定
    setupSubscriptions();
  }, []);

  const loadProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 親プロフィールの取得
      const { data: parentProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .eq('role', 'parent')
        .single();

      if (!parentProfile) return;

      // 子プロフィールの取得
      const { data: childProfiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('parent_id', parentProfile.id)
        .eq('role', 'child');

      if (!childProfiles || childProfiles.length === 0) return;

      // 進捗データの取得
      const { data: progress } = await supabase
        .from('learning_progress')
        .select('*')
        .in('user_id', childProfiles.map(p => p.id));

      if (progress) {
        const newProgressData: ProgressData = {
          completedLessons: progress
            .filter(p => p.status === 'completed')
            .map(p => p.lesson_id),
          totalPoints: progress.reduce((sum, p) => sum + (p.score || 0), 0),
          level: calculateLevel(progress),
          badges: extractBadges(progress),
          subjectProgress: calculateSubjectProgress(progress)
        };
        setProgressData(newProgressData);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const setupSubscriptions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 親プロフィールの取得
      const { data: parentProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .eq('role', 'parent')
        .single();

      if (!parentProfile) return;

      // 子プロフィールの取得
      const { data: childProfiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('parent_id', parentProfile.id)
        .eq('role', 'child');

      if (!childProfiles || childProfiles.length === 0) return;

      // 進捗データのサブスクリプション
      const progressSubscription = supabase
        .channel('learning_progress')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'learning_progress',
            filter: `user_id=in.(${childProfiles.map(p => p.id).join(',')})`
          },
          (payload) => {
            handleProgressUpdate(payload);
          }
        )
        .subscribe();

      return () => {
        progressSubscription.unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up subscriptions:', error);
    }
  };

  const handleProgressUpdate = (payload: any) => {
    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
      loadProgress();
    }
  };

  const calculateLevel = (progress: any[]): number => {
    const totalPoints = progress.reduce((sum, p) => sum + (p.score || 0), 0);
    return Math.floor(totalPoints / 1000) + 1;
  };

  const extractBadges = (progress: any[]): string[] => {
    const badges: string[] = [];
    const completedLessons = progress.filter(p => p.status === 'completed').length;
    
    if (completedLessons >= 10) badges.push('初心者');
    if (completedLessons >= 30) badges.push('中級者');
    if (completedLessons >= 50) badges.push('上級者');
    if (completedLessons >= 100) badges.push('マスター');

    return badges;
  };

  const calculateSubjectProgress = (progress: any[]) => {
    const subjectProgress: ProgressData['subjectProgress'] = {};
    
    progress.forEach(p => {
      const subject = p.lesson_id.split('-')[0];
      if (!subjectProgress[subject]) {
        subjectProgress[subject] = {
          totalLessons: 0,
          completedLessons: 0,
          averageScore: 0,
          skillAcquisition: {}
        };
      }
      
      subjectProgress[subject].totalLessons++;
      if (p.status === 'completed') {
        subjectProgress[subject].completedLessons++;
      }
      subjectProgress[subject].averageScore = 
        (subjectProgress[subject].averageScore * (subjectProgress[subject].completedLessons - 1) + (p.score || 0)) / 
        subjectProgress[subject].completedLessons;
    });

    return subjectProgress;
  };

  const handleLessonClick = async (lesson: Lesson) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('ログインが必要です');
        return;
      }

      // 親プロフィールの取得
      const { data: parentProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .eq('role', 'parent')
        .single();

      if (!parentProfile) {
        toast.error('親プロフィールが見つかりません');
        return;
      }

      // 子プロフィールの取得
      const { data: childProfiles } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('parent_id', parentProfile.id)
        .eq('role', 'child');

      if (!childProfiles || childProfiles.length === 0) {
        toast.error('子プロフィールが見つかりません');
        return;
      }

      // 進捗データの保存
      const progressData = {
        completed: true,
        completed_at: new Date().toISOString(),
        score: 100,
        status: 'completed',
        time_spent: 30,
        attempts: 1,
        metadata: {
          skillAcquisition: lesson.skillAcquisition,
          achievementCriteria: lesson.achievementCriteria
        }
      };

      const { error } = await supabase
        .from('learning_progress')
        .upsert(
          childProfiles.map(child => ({
            user_id: child.id,
            lesson_id: lesson.id,
            ...progressData
          })),
          { onConflict: 'user_id,lesson_id' }
        );

      if (error) throw error;

      // 成功時の処理
      playSound('success');
      confetti();
      toast.success('レッスンを完了しました！');
      navigate(`/child/lesson/${lesson.id}`);
    } catch (error) {
      console.error('Error saving progress:', error);
      toast.error('進捗の保存に失敗しました');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <GradientHeader
        title={title}
        description={description}
        gradientColors={gradientColors}
        backButton={
          <Link to="/child/dashboard" className="flex items-center gap-2 text-white hover:text-white/80">
            <ArrowLeft className="h-5 w-5" />
            ダッシュボードに戻る
          </Link>
        }
      />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map(lesson => (
            <LessonCard
              key={lesson.id}
              {...lesson}
              completed={progressData.completedLessons.includes(lesson.id)}
              onClick={() => handleLessonClick(lesson)}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 