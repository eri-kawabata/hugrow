import React, { memo, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Clock, Trophy, Sparkles } from 'lucide-react';
import { GradientHeader } from '@/components/Common/GradientHeader';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { PointsDisplay } from './PointsDisplay';
import toast from 'react-hot-toast';
import { playSound, preloadAudio } from '@/utils/audio';

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
  icon: Icon
}: LessonCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.03 }}
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
      </div>
    </motion.button>
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
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [level, setLevel] = useState(1);
  const [badges, setBadges] = useState<string[]>([]);

  useEffect(() => {
    // 音声ファイルのプリロード
    preloadAudio();

    // 進捗状態の読み込み
    const savedProgress = localStorage.getItem('lessonProgress');
    const savedPoints = localStorage.getItem('totalPoints');
    const savedLevel = localStorage.getItem('userLevel');
    const savedBadges = localStorage.getItem('userBadges');

    if (savedProgress) setCompletedLessons(JSON.parse(savedProgress));
    if (savedPoints) setTotalPoints(Number(savedPoints));
    if (savedLevel) setLevel(Number(savedLevel));
    if (savedBadges) setBadges(JSON.parse(savedBadges));
  }, []);

  const handleLessonClick = async (lessonId: string) => {
    // クリック音を再生
    await playSound('click');

    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) return;

    if (!completedLessons.includes(lessonId)) {
      // レッスン完了時の演出と音声
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      await playSound('complete');
      
      // ポイントの加算
      const newPoints = totalPoints + lesson.points;
      setTotalPoints(newPoints);
      localStorage.setItem('totalPoints', String(newPoints));

      // レベルアップの確認
      const newLevel = Math.floor(newPoints / 1000) + 1;
      if (newLevel > level) {
        setLevel(newLevel);
        localStorage.setItem('userLevel', String(newLevel));
        
        // レベルアップ時の演出と音声
        confetti({
          particleCount: 200,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FFA500', '#FF4500']
        });
        await playSound('levelUp');
        
        toast.success(`レベル${newLevel}になりました！`, {
          icon: '🎉',
          duration: 3000
        });

        // 新しいバッジの獲得
        if (newLevel % 3 === 0) {
          const newBadge = `level-${newLevel}-badge`;
          setBadges([...badges, newBadge]);
          localStorage.setItem('userBadges', JSON.stringify([...badges, newBadge]));
          
          // バッジ獲得時の音声
          await playSound('badge');
          
          toast.success('新しいバッジをげっとしました！', {
            icon: '🏆',
            duration: 3000
          });
        }
      }

      const newCompletedLessons = [...completedLessons, lessonId];
      setCompletedLessons(newCompletedLessons);
      localStorage.setItem('lessonProgress', JSON.stringify(newCompletedLessons));
    }
    
    navigate(`/child/learning/lesson/${lessonId}`);
  };

  const totalProgress = (completedLessons.length / lessons.length) * 100;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link
        to="/child/learning"
        className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        もどる
      </Link>

      <GradientHeader 
        title={title}
        gradientColors={gradientColors}
      />

      <p className="text-xl text-center mb-6 text-gray-600">
        {description}
      </p>

      <PointsDisplay
        totalPoints={totalPoints}
        level={level}
        badges={badges}
      />

      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-bold text-gray-700">
            がんばりゆ！
          </span>
          <span className="text-lg text-gray-600">
            {completedLessons.length} / {lessons.length}
          </span>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-green-400 to-blue-400"
            initial={{ width: 0 }}
            animate={{ width: `${totalProgress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessons.map((lesson) => (
          <LessonCard
            key={lesson.id}
            {...lesson}
            completed={completedLessons.includes(lesson.id)}
            onClick={() => handleLessonClick(lesson.id)}
          />
        ))}
      </div>
    </div>
  );
} 