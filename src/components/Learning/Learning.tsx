import React, { useEffect, useState, ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wrench, 
  Palette, 
  Calculator,
  Star,
  Sparkles,
  Atom,
  Cpu
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
  icon: ReactElement;
  title: string;
  description: string;
  progress: number;
  gradientColors: {
    from: string;
    via: string;
    to: string;
  };
};

function SubjectCard({ to, type, icon, title, description, progress, gradientColors }: SubjectCardProps) {
  return (
    <Link to={to}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="relative block"
      >
        <GlowCard
          gradientColors={gradientColors}
          className="relative block p-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <div className="relative">
            <div className="flex flex-col items-center text-center">
              <motion.div
                whileHover={{ 
                  scale: 1.1,
                  rotate: [0, -5, 5, 0],
                  transition: { duration: 0.3 }
                }}
                className="p-4 rounded-xl mb-4"
                style={{
                  background: `linear-gradient(135deg, ${gradientColors.from}10, ${gradientColors.to}10)`
                }}
              >
                {React.cloneElement(icon, {
                  className: `h-12 w-12 transform transition-transform duration-300`,
                  style: { color: gradientColors.from }
                })}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-xl font-bold mb-2"
                  style={{
                    background: `linear-gradient(to right, ${gradientColors.from}, ${gradientColors.to})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >{title}</h3>
                <p className="text-gray-600 text-base">{description}</p>
              </motion.div>
            </div>

            {/* 進捗バー */}
            <div className="w-full mt-3">
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(to right, ${gradientColors.from}, ${gradientColors.to})`
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1.5">進捗: {progress}%</p>
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

      const { data: progressData, error } = await supabase
        .from('learning_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const lessonCounts = {
        science: 5,
        technology: 5,
        engineering: 5,
        art: 5,
        math: 5
      };

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
      icon: <Atom className="w-6 h-6" />,
      title: 'りか',
      description: 'しぜんのふしぎをまなぼう',
      progress: getProgress('science'),
      gradientColors: {
        from: '#3b82f6',
        via: '#60a5fa',
        to: '#93c5fd'
      }
    },
    {
      to: '/child/learning/technology',
      type: 'technology',
      icon: <Cpu className="w-6 h-6" />,
      title: 'ぎじゅつ',
      description: 'コンピュータのしくみをしろう',
      progress: getProgress('technology'),
      gradientColors: {
        from: '#8b5cf6',
        via: '#a78bfa',
        to: '#c4b5fd'
      }
    },
    {
      to: '/child/learning/engineering',
      type: 'engineering',
      icon: <Wrench className="w-6 h-6" />,
      title: 'こうがく',
      description: 'ものづくりのせかいをたのしもう',
      progress: getProgress('engineering'),
      gradientColors: {
        from: '#f97316',
        via: '#fb923c',
        to: '#fdba74'
      }
    },
    {
      to: '/child/learning/art',
      type: 'art',
      icon: <Palette className="w-6 h-6" />,
      title: 'びじゅつ',
      description: 'そうぞうりょくをはっきしよう',
      progress: getProgress('art'),
      gradientColors: {
        from: '#ec4899',
        via: '#f472b6',
        to: '#f9a8d4'
      }
    },
    {
      to: '/child/learning/math',
      type: 'math',
      icon: <Calculator className="w-6 h-6" />,
      title: 'すうがく',
      description: 'かずとかたちでかんがえよう',
      progress: getProgress('math'),
      gradientColors: {
        from: '#10b981',
        via: '#34d399',
        to: '#6ee7b7'
      }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* 背景の装飾要素 */}
      <div className="absolute inset-0 pointer-events-none">
        {/* STEAM要素を表現する光の輪 */}
        <div className="absolute w-[900px] h-[900px] -top-[300px] -left-[300px] bg-gradient-to-r from-pink-400/40 via-blue-400/40 to-emerald-400/40 rounded-full blur-3xl animate-slow-spin"></div>
        <div className="absolute w-[700px] h-[700px] -bottom-[200px] -right-[200px] bg-gradient-to-r from-orange-400/40 via-indigo-400/40 to-green-400/40 rounded-full blur-3xl animate-slow-spin-reverse"></div>
        
        {/* 追加の光の輪 */}
        <div className="absolute w-[600px] h-[600px] top-[30%] right-[20%] bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-pink-400/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute w-[500px] h-[500px] bottom-[40%] left-[15%] bg-gradient-to-r from-emerald-400/30 via-orange-400/30 to-indigo-400/30 rounded-full blur-3xl animate-float-reverse"></div>

        {/* アート要素 - 筆のストローク */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={`stroke-${i}`}
            className="absolute"
            style={{
              width: `${Math.random() * 200 + 100}px`,
              height: `${Math.random() * 3 + 1}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `${['#ec4899', '#f43f5e', '#e879f9'][Math.floor(Math.random() * 3)]}40`,
              borderRadius: '999px',
              transformOrigin: 'left',
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
            animate={{
              opacity: [0.2, 0.4, 0.2],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* 技術要素 - デジタル回路 */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`circuit-${i}`}
            className="absolute"
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: '2px',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `${['#6366f1', '#4f46e5', '#4338ca'][Math.floor(Math.random() * 3)]}40`,
              transformOrigin: 'left',
              transform: `rotate(${Math.floor(Math.random() * 4) * 90}deg)`,
            }}
            animate={{
              opacity: [0.2, 0.4, 0.2],
              boxShadow: ['0 0 5px #6366f1', '0 0 10px #4f46e5', '0 0 5px #4338ca'],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}

        {/* 工学要素 - 歯車のような形 */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`gear-${i}`}
            className="absolute"
            style={{
              width: `${Math.random() * 40 + 20}px`,
              height: `${Math.random() * 40 + 20}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              border: `2px solid ${['#f97316', '#fb923c', '#fdba74'][Math.floor(Math.random() * 3)]}40`,
              borderRadius: '50%',
              background: 'transparent',
            }}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <div className="absolute inset-0 border-2 border-orange-400/30 rounded-full transform rotate-45"></div>
          </motion.div>
        ))}

        {/* 科学要素 - 分子構造のような形 */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={`molecule-${i}`}
            className="absolute"
            style={{
              width: `${Math.random() * 30 + 15}px`,
              height: `${Math.random() * 30 + 15}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `${['#3b82f6', '#2563eb', '#1d4ed8'][Math.floor(Math.random() * 3)]}30`,
              borderRadius: '50%',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <motion.div
              className="absolute w-20 h-0.5 bg-blue-400/20 origin-left"
              style={{ transform: `rotate(${Math.random() * 360}deg)` }}
            />
          </motion.div>
        ))}

        {/* 数学要素 - 数式や記号 */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`math-${i}`}
            className="absolute text-xl font-bold"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              color: `${['#10b981', '#059669', '#047857'][Math.floor(Math.random() * 3)]}40`,
            }}
            animate={{
              y: [0, -20],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {['+', '-', '×', '÷', '=', 'π', '∑', '∫'][Math.floor(Math.random() * 8)]}
          </motion.div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto pb-12 relative">
      <GradientHeader 
        title="がくしゅう" 
        gradientColors={{
          from: '#60a5fa',
          via: '#ec4899',
          to: '#a855f7'
        }}
      />

        <div className="px-6 py-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
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
                <Link
                  to={subject.to}
                  className="relative group block"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r rounded-[28px] opacity-30 group-hover:opacity-50 blur transition duration-500"
                    style={{
                      backgroundImage: `linear-gradient(to right, ${subject.gradientColors.from}, ${subject.gradientColors.via}, ${subject.gradientColors.to})`
                    }}
                  ></div>
                  <motion.div
                    whileHover={{ 
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                    className="relative block bg-gradient-to-br from-white to-white/20 rounded-[24px] shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2"
                    style={{
                      borderColor: subject.gradientColors.from
                    }}
                  >
                    <div className="absolute inset-0 bg-white/90 transition-opacity group-hover:opacity-95"></div>
                    <div className="relative p-3">
                      <div className="flex flex-col items-center text-center">
                        <motion.div
                          whileHover={{ 
                            scale: 1.1,
                            rotate: [0, -5, 5, 0],
                            transition: { duration: 0.3 }
                          }}
                          className="p-2.5 rounded-lg mb-2 relative overflow-hidden group-hover:shadow-lg transition-all duration-300"
                          style={{
                            background: `linear-gradient(135deg, ${subject.gradientColors.from}10, ${subject.gradientColors.to}10)`
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 group-hover:translate-x-full transition-all duration-1000"></div>
                          {React.cloneElement(subject.icon as ReactElement, {
                            className: `h-8 w-8 transform transition-transform group-hover:scale-110 duration-300`,
                            style: { color: subject.gradientColors.from }
                          })}
                        </motion.div>
            <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <h3 className="text-base font-bold mb-1"
                            style={{
                              background: `linear-gradient(to right, ${subject.gradientColors.from}, ${subject.gradientColors.to})`,
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent'
                            }}
                          >{subject.title}</h3>
                          <p className="text-gray-600 text-xs">{subject.description}</p>
                        </motion.div>
                        {/* 進捗バー */}
                        <div className="w-full mt-3">
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${subject.progress}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className="h-full rounded-full"
                              style={{
                                background: `linear-gradient(to right, ${subject.gradientColors.from}, ${subject.gradientColors.to})`
                              }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1.5">進捗: {subject.progress}%</p>
                        </div>
                      </div>
                    </div>
            </motion.div>
                </Link>
          </motion.div>
            ))}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes slow-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes slow-spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-20px, -20px); }
        }
        
        @keyframes float-reverse {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -20px); }
        }
        
        .animate-slow-spin {
          animation: slow-spin 20s linear infinite;
        }
        
        .animate-slow-spin-reverse {
          animation: slow-spin-reverse 25s linear infinite;
        }
        
        .animate-float {
          animation: float 15s ease-in-out infinite;
        }
        
        .animate-float-reverse {
          animation: float-reverse 18s ease-in-out infinite;
        }
        `
      }} />
    </div>
  );
} 
