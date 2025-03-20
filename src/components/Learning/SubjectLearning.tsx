import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { GradientHeader } from '@/components/Common/GradientHeader';
import { ArrowLeft, Trophy, Star, Clock, Award } from 'lucide-react';

type Lesson = {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration?: string;
  points?: number;
  icon?: React.ReactNode;
  color?: string;
};

type SubjectConfig = {
  science: {
    title: string;
    description: string;
    icon: React.ReactNode;
    gradientColors?: {
      from: string;
      via: string;
      to: string;
    };
    lessons: Lesson[];
  };
  technology: {
    title: string;
    description: string;
    icon: React.ReactNode;
    lessons: Lesson[];
  };
  engineering: {
    title: string;
    description: string;
    icon: React.ReactNode;
    lessons: Lesson[];
  };
  art: {
    title: string;
    description: string;
    icon: React.ReactNode;
    lessons: Lesson[];
  };
  math: {
    title: string;
    description: string;
    icon: React.ReactNode;
    lessons: Lesson[];
  };
};

type LessonProgress = {
  lesson_id: string;
  completed: boolean;
  score: number;
  last_position: number;
};

export function SubjectLearning({ config }: { config: SubjectConfig }) {
  const { subject } = useParams<{ subject: keyof SubjectConfig }>();
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, [subject]);

  const fetchProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('learning_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', `subject_${subject}`);

      if (data) {
        setProgress(data);
      }
    } catch (error) {
      console.error('進捗データの取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (lessonId: string, newProgress: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('learning_progress')
        .upsert({
          user_id: user.id,
          lesson_id: `subject_${subject}`,
          progress_data: {
            total_sections: 100,
            current_section: newProgress,
            completed_sections: newProgress === 100 ? Array.from({ length: 100 }, (_, i) => i + 1) : []
          },
          status: newProgress === 100 ? 'completed' : 'in_progress',
          last_activity_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      fetchProgress();
    } catch (error) {
      console.error('進捗の更新に失敗しました:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const subjectConfig = config[subject!];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-28">
      <div className="px-6">
        <Link
          to="/child/learning"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          もどる
        </Link>

        <GradientHeader 
          title={subjectConfig.title}
          gradientColors={subjectConfig.gradientColors || {
            from: '#8ec5d6',
            via: '#f7c5c2',
            to: '#f5f6bf'
          }}
        />

        <p className="text-lg text-gray-600 text-center mb-8">
          {subjectConfig.description}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjectConfig.lessons.map((lesson, index) => {
            const lessonProgress = progress.find(p => p.lesson_id === lesson.id);
            const progressPercentage = lessonProgress?.last_position || 0;

            return (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`bg-gradient-to-br ${lesson.color || 'from-gray-50 to-gray-100'} rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {lesson.icon && (
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        {lesson.icon}
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-gray-900">{lesson.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {lessonProgress?.completed && (
                      <Trophy className="h-5 w-5 text-yellow-500" />
                    )}
                    <Star className={`h-5 w-5 ${
                      lesson.difficulty === 'easy' ? 'text-green-500' :
                      lesson.difficulty === 'medium' ? 'text-yellow-500' :
                      'text-red-500'
                    }`} />
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{lesson.description}</p>
                <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                  {lesson.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{lesson.duration}</span>
                    </div>
                  )}
                  {lesson.points && (
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      <span>{lesson.points}ポイント</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">進捗: {progressPercentage}%</span>
                    <button
                      onClick={() => updateProgress(lesson.id, Math.min(progressPercentage + 20, 100))}
                      className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors duration-200 shadow-sm"
                    >
                      つづける
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 