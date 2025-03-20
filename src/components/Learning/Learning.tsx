import React, { useMemo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Microscope, 
  Cpu, 
  Wrench, 
  Palette, 
  Calculator,
  Star,
  Trophy
} from 'lucide-react';
import { GradientHeader } from '@/components/Common/GradientHeader';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

type SubjectProgress = {
  subject: 'science' | 'technology' | 'engineering' | 'art' | 'math';
  progress: number;
};

type SubjectCardProps = {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  type: 'science' | 'technology' | 'engineering' | 'art' | 'math';
  progress?: number;
};

const SubjectCard = React.memo(({ to, icon, title, description, progress = 0 }: SubjectCardProps) => (
  <motion.div
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: "spring", stiffness: 400, damping: 17 }}
  >
    <Link
      to={to}
      className="block bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative space-y-4">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl transform group-hover:rotate-6 transition-transform duration-300">
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-xl text-gray-900 group-hover:text-indigo-600 transition-colors duration-300">{title}</h3>
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-500">進捗: {progress}%</span>
            {progress === 100 && (
              <Trophy className="h-5 w-5 text-yellow-500" />
            )}
          </div>
        </div>
      </div>
    </Link>
  </motion.div>
));

SubjectCard.displayName = 'SubjectCard';

// メインコンポーネント
export function Learning() {
  const [progresses, setProgresses] = useState<SubjectProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgresses();
  }, []);

  const fetchProgresses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // データベースから全ての進捗データを取得
      const { data: progressData, error } = await supabase
        .from('learning_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // 各科目のレッスン数を定義
      const lessonCounts = {
        science: 5,
        technology: 5,
        engineering: 5,
        art: 5,
        math: 5
      };

      // 各科目の進捗を計算
      const results = Object.entries(lessonCounts).map(([subject, totalLessons]) => {
        const subjectLessons = progressData?.filter(
          progress => progress.lesson_id.startsWith(subject) && progress.completed
        ) || [];
        const progress = Math.round((subjectLessons.length / totalLessons) * 100);

        return {
          subject: subject as SubjectProgress['subject'],
          progress
        };
      });

      setProgresses(results);
    } catch (error) {
      console.error('進捗データの取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgress = (type: SubjectProgress['subject']) => {
    const progress = progresses.find(p => p.subject === type);
    return progress?.progress || 0;
  };

  const subjects: SubjectCardProps[] = [
    {
      to: '/child/learning/science',
      type: 'science',
      icon: <Microscope className="h-8 w-8 text-indigo-600" />,
      title: 'りか',
      description: 'しぜんのふしぎをたんけんしよう',
      progress: getProgress('science'),
    },
    {
      to: '/child/learning/technology',
      type: 'technology',
      icon: <Cpu className="h-8 w-8 text-indigo-600" />,
      title: 'ぎじゅつ',
      description: 'コンピュータのしくみをまなぼう',
      progress: getProgress('technology'),
    },
    {
      to: '/child/learning/engineering',
      type: 'engineering',
      icon: <Wrench className="h-8 w-8 text-indigo-600" />,
      title: 'こうがく',
      description: 'ものづくりのげんりをしろう',
      progress: getProgress('engineering'),
    },
    {
      to: '/child/learning/art',
      type: 'art',
      icon: <Palette className="h-8 w-8 text-indigo-600" />,
      title: 'げいじゅつ',
      description: 'そうぞうりょくをのばそう',
      progress: getProgress('art'),
    },
    {
      to: '/child/learning/math',
      type: 'math',
      icon: <Calculator className="h-8 w-8 text-indigo-600" />,
      title: 'すうがく',
      description: 'かずとけいさんをたのしもう',
      progress: getProgress('math'),
    },
  ];

  const subjectCards = useMemo(() => (
    <motion.div 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {subjects.map((subject, index) => (
        <motion.div
          key={subject.to}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <SubjectCard {...subject} />
        </motion.div>
      ))}
    </motion.div>
  ), [progresses]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-28">
      <GradientHeader 
        title="がくしゅう" 
        gradientColors={{
          from: '#8ec5d6',
          via: '#f7c5c2',
          to: '#f5f6bf'
        }}
      />

      <div className="px-6">
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2">すきなかもくをえらんでがくしゅうをはじめよう！</h2>
            <p className="text-lg text-gray-600">がんばってがくしゅうすると、トロフィーがもらえるよ！</p>
          </motion.div>
          {subjectCards}
        </div>
      </div>
    </div>
  );
} 