import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Microscope, 
  Cpu, 
  Wrench, 
  Palette, 
  Calculator,
  Star,
  Sparkles
} from 'lucide-react';
import { GradientHeader } from '@/components/Common/GradientHeader';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { GlowCard } from '@/components/Common/GlowCard';

type SubjectProgress = {
  subject: 'science' | 'technology' | 'engineering' | 'art' | 'math';
  progress: number;
  lastAccessed?: string;
};

type SubjectCardProps = {
  to: string;
  type: 'science' | 'technology' | 'engineering' | 'art' | 'math';
  icon: React.ReactNode;
  title: string;
  description: string;
  progress: number;
};

function SubjectCard({ to, type, icon, title, description, progress }: SubjectCardProps) {
  const gradientColors = {
    science: {
      from: '#60a5fa',
      via: '#818cf8',
      to: '#a78bfa'
    },
    technology: {
      from: '#c084fc',
      via: '#e879f9',
      to: '#f472b6'
    },
    engineering: {
      from: '#fb923c',
      via: '#fbbf24',
      to: '#facc15'
    },
    art: {
      from: '#fb7185',
      via: '#f472b6',
      to: '#e879f9'
    },
    math: {
      from: '#34d399',
      via: '#2dd4bf',
      to: '#22d3ee'
    }
  };

  return (
    <Link to={to}>
      <motion.div
        whileHover={{ 
          scale: 1.03,
          y: -5,
          rotateY: 5
        }}
        className="relative will-change-transform perspective-1000"
      >
        <GlowCard
          gradientColors={gradientColors[type as keyof typeof gradientColors]}
          className="h-full bg-white/90 backdrop-blur-sm border-2 border-white/70 shadow-[0_0_15px_rgba(255,255,255,0.5)] rounded-2xl overflow-hidden"
        >
          {/* 魔法の光エフェクト */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent animate-magic-glow" />
          
          {/* キラキラエフェクト */}
          <motion.div
            className="absolute -top-2 -right-2 text-yellow-300 pointer-events-none z-10"
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, 15, -15, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <Sparkles className="w-7 h-7 drop-shadow-[0_0_10px_rgba(253,224,71,0.7)]" />
          </motion.div>

          <div className="p-6 relative z-10">
            <div className="flex items-start gap-5">
              <motion.div 
                className={`p-4 rounded-2xl ${getBackgroundColor(type)} shadow-lg will-change-transform relative group overflow-hidden`}
                whileHover={{ 
                  scale: 1.1,
                  rotate: [0, -5, 5, 0]
                }}
                transition={{ 
                  type: "spring",
                  stiffness: 400,
                  damping: 17
                }}
              >
                {/* アイコン背景の光るエフェクト */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 group-hover:translate-x-full duration-1000 ease-in-out" />
                {React.cloneElement(icon as React.ReactElement, {
                  className: `h-12 w-12 ${getIconColor(type)} drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]`
                })}
              </motion.div>
              <div className="flex-1 min-w-0">
                <h3 className={`text-2xl font-black tracking-tight ${getTextColor(type)} mb-2 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]`}>
                  {title}
                </h3>
                <p className="text-gray-700 text-sm font-medium leading-relaxed">{description}</p>
              </div>
            </div>

            {/* 進捗バー */}
            <div className="mt-6">
              <div className="flex items-center justify-end mb-2">
                <div className="flex items-center gap-2">
                  <Star className={`w-5 h-5 ${getIconColor(type)} drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]`} />
                  <span className={`text-base font-black tracking-tight ${getTextColor(type)} drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]`}>
                    {progress}%
                  </span>
                </div>
              </div>
              <div className="relative h-5 w-full rounded-full bg-white/50 overflow-hidden shadow-inner backdrop-blur-sm border border-white/50">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`absolute h-full ${getProgressColor(type)} will-change-transform`}
                >
                  {/* 光の粒子エフェクト */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute inset-0 animate-particle-1 opacity-90 bg-white/40 rounded-full w-12 h-full will-change-transform" />
                    <div className="absolute inset-0 animate-particle-2 opacity-90 bg-white/40 rounded-full w-8 h-full will-change-transform" />
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </GlowCard>
      </motion.div>
    </Link>
  );
}

// 科目タイプに応じたアイコンの色を返す関数
function getIconColor(type: SubjectCardProps['type']) {
  const colors = {
    science: 'text-blue-400',
    technology: 'text-purple-400',
    engineering: 'text-orange-400',
    art: 'text-rose-400',
    math: 'text-emerald-400'
  };
  return colors[type];
}

// 科目タイプに応じたプログレスバーの色を返す関数
function getProgressColor(type: SubjectCardProps['type']) {
  const colors = {
    science: 'bg-gradient-to-r from-blue-400/80 via-indigo-400/80 to-purple-400/80',
    technology: 'bg-gradient-to-r from-purple-400/80 via-fuchsia-400/80 to-pink-400/80',
    engineering: 'bg-gradient-to-r from-orange-400/80 via-amber-400/80 to-yellow-400/80',
    art: 'bg-gradient-to-r from-rose-400/80 via-pink-400/80 to-fuchsia-400/80',
    math: 'bg-gradient-to-r from-emerald-400/80 via-teal-400/80 to-cyan-400/80'
  };
  return colors[type];
}

// 科目タイプに応じた背景色を返す関数
function getBackgroundColor(type: SubjectCardProps['type']) {
  const colors = {
    science: 'bg-gradient-to-br from-blue-100/90 to-indigo-100/90',
    technology: 'bg-gradient-to-br from-purple-100/90 to-fuchsia-100/90',
    engineering: 'bg-gradient-to-br from-orange-100/90 to-amber-100/90',
    art: 'bg-gradient-to-br from-rose-100/90 to-pink-100/90',
    math: 'bg-gradient-to-br from-emerald-100/90 to-teal-100/90'
  };
  return colors[type];
}

// 科目タイプに応じたテキストカラーを返す関数
function getTextColor(type: SubjectCardProps['type']) {
  const colors = {
    science: 'text-blue-600',
    technology: 'text-purple-600',
    engineering: 'text-orange-600',
    art: 'text-rose-600',
    math: 'text-emerald-600'
  };
  return colors[type];
}

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
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
          <div className="space-y-12">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="text-center space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 260,
                  damping: 20 
                }}
                className="inline-block relative"
              >
                <h2 className="text-3xl md:text-4xl font-black tracking-tight relative">
                  <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 [-webkit-text-stroke:0.5px_rgba(99,102,241,0.1)] [text-shadow:2px_2px_2px_rgba(99,102,241,0.1)]">
                    すきなかもくをえらんでがくしゅうをはじめよう！
                  </span>
                  <motion.div
                    className="absolute -top-6 -right-6 text-yellow-400 z-20"
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    <Star className="w-8 h-8 drop-shadow-lg" />
                  </motion.div>
                </h2>
              </motion.div>
              <p className="text-lg font-medium text-gray-700">がんばってがくしゅうすると、トロフィーがもらえるよ！</p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {subjects.map((subject, index) => (
                <motion.div
                  key={subject.to}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.5,
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 260,
                    damping: 20
                  }}
                >
                  <SubjectCard {...subject} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 
