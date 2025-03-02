import React, { useState, useEffect } from 'react';
import { Layout } from './Layout';
import {
  Palette, Clock, Star, ArrowLeft, CheckCircle,
  Lock, X, Award, Share2, TrendingUp, Brush
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import type { LearningProgress, Badge } from '../lib/types';
import confetti from 'canvas-confetti';
import { BadgeDetailModal } from './BadgeDetailModal';

type Lesson = {
  id: string;
  title: string;
  description: string;
  canvasUrl: string;
  points: number;
  duration: string;
  materials: string[];
  techniques: string[];
  locked?: boolean;
};

// 共通の型定義
type LessonComponentProps = {
  lesson: Lesson;
  progress: LearningProgress | null;
};

type CurrentLessonProps = LessonComponentProps & {
  onShowCanvas: () => void;
  isParentMode: boolean;
};

type LessonNavigationProps = {
  lessons: Lesson[];
  currentLesson: number;
  progress: LearningProgress | null;
  onLessonSelect: (index: number) => void;
  isParentMode: boolean;
};

type BadgeSectionProps = {
  badges: Badge[];
  isParentMode: boolean;
};

type CanvasModalProps = {
  lesson: Lesson;
  onClose: () => void;
  onComplete: () => void;
  isParentMode: boolean;
};

export function ArtsLearning() {
  const navigate = useNavigate();
  const [currentLesson, setCurrentLesson] = useState(0);
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [showCanvas, setShowCanvas] = useState(false);

  const lessons: Lesson[] = [
    {
      id: 'arts-1',
      title: '色の組み合わせで感情を表現',
      description: '色が持つ意味や感情との関係を学び、自分の気持ちを色で表現する方法を探ります。',
      canvasUrl: 'https://example.com/color-emotions',
      points: 100,
      duration: '25分',
      materials: ['絵の具', '筆', '画用紙', 'パレット'],
      techniques: ['色彩理論', '感情表現', 'グラデーション']
    },
    {
      id: 'arts-2',
      title: '自然物でコラージュを作ろう',
      description: '葉っぱや花びらなど、自然の素材を使って独創的なコラージュアートを制作します。',
      canvasUrl: 'https://example.com/nature-collage',
      points: 150,
      duration: '30分',
      materials: ['自然素材', 'のり', 'はさみ', '台紙'],
      techniques: ['構図', 'テクスチャー', 'バランス']
    },
    {
      id: 'arts-3',
      title: '音楽を絵で表現してみよう',
      description: '音楽を聴いて感じたイメージや感情を、線や色、形で表現する抽象画に挑戦します。',
      canvasUrl: 'https://example.com/music-painting',
      points: 200,
      duration: '35分',
      materials: ['画材セット', 'イヤホン', 'スケッチブック'],
      techniques: ['リズム表現', '抽象化', '即興'],
      locked: true
    }
  ];

  const fetchProgress = async () => {
    if (!supabase) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('ログインが必要です');
        return;
      }

      const { data, error } = await supabase
        .from('learning_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lessons[currentLesson].id)
        .maybeSingle();

      if (error) throw error;
      setProgress(data);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [currentLesson]); // currentLessonが変更されたときに実行

  useEffect(() => {
    const fetchBadges = async () => {
      if (!supabase) return;

      try {
        const { data, error } = await supabase
          .from('badges')
          .select('*')
          .eq('category', 'arts');

        if (error) throw error;
        setBadges(data || []);
      } catch (error) {
        console.error('Error fetching badges:', error);
      }
    };

    fetchBadges();
  }, []); // 初回のみ実行

  const handleLessonComplete = async () => {
    if (!supabase) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('learning_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessons[currentLesson].id,
          completed: true,
          last_position: 100,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      toast.success('レッスンを完了しました！');
      await fetchProgress();

      if (lessons[currentLesson + 1] && !lessons[currentLesson + 1].locked) {
        setTimeout(() => {
          setCurrentLesson(currentLesson + 1);
          setShowCanvas(false);
        }, 2000);
      } else if (currentLesson === lessons.length - 1) {
        setTimeout(() => {
          navigate('/learning/arts/complete');
        }, 2000);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('進捗の保存に失敗しました');
    }
  };

  const currentLessonData = lessons[currentLesson];

  return (
    <Layout>
      {({ isParentMode }) => (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <NavigationHeader isParentMode={isParentMode} />
          <CurrentLesson
            lesson={currentLessonData}
            progress={progress}
            onShowCanvas={() => setShowCanvas(true)}
            isParentMode={isParentMode}
          />
          <LessonNavigation
            lessons={lessons}
            currentLesson={currentLesson}
            progress={progress}
            onLessonSelect={setCurrentLesson}
            isParentMode={isParentMode}
          />
          <BadgeSection badges={badges} isParentMode={isParentMode} />
          {showCanvas && (
            <CanvasModal
              lesson={currentLessonData}
              onClose={() => setShowCanvas(false)}
              onComplete={handleLessonComplete}
              isParentMode={isParentMode}
            />
          )}
        </div>
      )}
    </Layout>
  );
}

function NavigationHeader({ isParentMode }: { isParentMode: boolean }) {
  const navigate = useNavigate();

  const handleShare = () => {
    toast.success(isParentMode ? '共有機能は準備中です' : 'きょうゆうきのうは じゅんびちゅうです');
  };

  const handleAnalytics = () => {
    if (isParentMode) {
      navigate('/learning/arts/analytics');
    }
  };

  return (
    <div className="flex items-center justify-between mb-8">
      <Link
        to="/learning"
        className="flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        <span>{isParentMode ? '学習メニューに戻る' : 'がくしゅうメニューにもどる'}</span>
      </Link>
      {isParentMode && (
        <div className="flex items-center gap-4">
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <Share2 className="h-5 w-5" />
            <span>共有</span>
          </button>
          <button 
            onClick={handleAnalytics}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <TrendingUp className="h-5 w-5" />
            <span>分析</span>
          </button>
        </div>
      )}
    </div>
  );
}

function CurrentLesson({ lesson, progress, onShowCanvas, isParentMode }: CurrentLessonProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
      <div className="flex flex-col md:flex-row items-start gap-6">
        <div className={`p-6 rounded-xl ${isParentMode ? 'bg-gray-100' : 'bg-pink-100'}`}>
          <Palette className={`h-8 w-8 ${isParentMode ? 'text-gray-600' : 'text-pink-600'}`} />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {lesson.title}
          </h1>
          <p className="text-gray-600 mb-6">
            {lesson.description}
          </p>
          <div className="grid grid-cols-1 gap-4 mb-6">
            <div className="space-y-3">
              <h3 className="font-bold flex items-center gap-2">
                <Brush className={`h-5 w-5 ${isParentMode ? 'text-gray-600' : 'text-pink-600'}`} />
                {isParentMode ? '必要な道具' : 'ひつような どうぐ'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {lesson.materials.map((material, index) => (
                  <div
                    key={index}
                    className={`px-4 py-2 rounded-lg text-sm ${
                      isParentMode 
                        ? 'bg-gray-50 text-gray-700' 
                        : 'bg-pink-50 text-pink-700'
                    }`}
                  >
                    {material}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6 mb-8">
            <div className="flex items-center gap-3 bg-yellow-50 px-6 py-3 rounded-2xl">
              <Star className="h-8 w-8 text-yellow-500" />
              <span className="text-xl">{lesson.points} ポイント</span>
            </div>
            <div className="flex items-center gap-3 bg-blue-50 px-6 py-3 rounded-2xl">
              <Clock className="h-8 w-8 text-blue-500" />
              <span className="text-xl">{lesson.duration}</span>
            </div>
            {progress?.completed && (
              <div className="flex items-center gap-3 bg-green-50 px-6 py-3 rounded-2xl">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <span className="text-xl">かんせい！</span>
              </div>
            )}
          </div>
          <button
            onClick={onShowCanvas}
            className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 ${
              isParentMode
                ? 'bg-indigo-600 hover:bg-indigo-700'
                : 'bg-pink-500 hover:bg-pink-600 text-xl'
            } text-white transition-colors`}
          >
            <Brush className="h-5 w-5" />
            {isParentMode ? '作品を作成' : 'さくひんを つくる'}
          </button>
        </div>
      </div>
    </div>
  );
}

function LessonNavigation({ lessons, currentLesson, progress, onLessonSelect, isParentMode }: LessonNavigationProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {lessons.map((lesson: Lesson, index: number) => (
        <button
          key={lesson.id}
          onClick={() => !lesson.locked && onLessonSelect(index)}
          className={`p-8 rounded-3xl border-4 text-left transition-all transform hover:-translate-y-1 ${
            currentLesson === index
              ? `border-${isParentMode ? 'indigo' : 'pink'}-400 bg-${isParentMode ? 'indigo' : 'pink'}-50 shadow-lg`
              : lesson.locked
              ? 'border-gray-200 opacity-50 cursor-not-allowed'
              : `border-gray-200 hover:border-${isParentMode ? 'indigo' : 'pink'}-300 shadow-md hover:shadow-lg`
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-xl font-bold">
                {index + 1}
              </div>
              {lesson.locked ? (
                <Lock className="h-8 w-8 text-gray-400" />
              ) : progress?.completed ? (
                <CheckCircle className="h-8 w-8 text-green-500" />
              ) : null}
            </div>
            <Star className="h-8 w-8 text-yellow-500" />
          </div>
          <h3 className="text-xl font-bold mb-3">{lesson.title}</h3>
          <p className="text-lg text-gray-600">{lesson.description}</p>
        </button>
      ))}
    </div>
  );
}

function BadgeSection({ badges, isParentMode }: BadgeSectionProps) {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm ${isParentMode ? 'border-indigo-100' : 'border-pink-100'}`}>
      <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Award className="h-6 w-6 text-pink-600" />
        獲得したバッジ
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {badges.map((badge: Badge) => (
          <button
            key={badge.id}
            onClick={() => setSelectedBadge(badge)}
            className="text-center p-4 rounded-xl border-2 border-gray-100 hover:border-pink-200 transition-colors"
          >
            <img
              src={badge.icon_url}
              alt={badge.name}
              className="w-16 h-16 mx-auto mb-3"
            />
            <div className="font-bold mb-1">{badge.name}</div>
            <div className="text-sm text-gray-600">{badge.description}</div>
          </button>
        ))}
      </div>
      
      {selectedBadge && (
        <BadgeDetailModal
          badge={selectedBadge}
          onClose={() => setSelectedBadge(null)}
        />
      )}
    </div>
  );
}

function CanvasModal({ lesson, onClose, onComplete, isParentMode }: CanvasModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full border-4 border-pink-200">
        <div className="p-8 border-b-4 border-pink-100 flex items-center justify-between">
          <h3 className="text-2xl font-bold">
            {lesson.title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            <X className="h-8 w-8" />
          </button>
        </div>
        <div className="h-[600px] bg-gray-50 p-6">
          <iframe
            src={lesson.canvasUrl}
            className="w-full h-full rounded-2xl border-4 border-gray-100"
            title="Canvas"
          />
        </div>
        <div className="p-8 flex justify-end">
          <button
            onClick={onComplete}
            className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 ${
              isParentMode
                ? 'bg-indigo-600 hover:bg-indigo-700'
                : 'bg-pink-500 hover:bg-pink-600 text-xl'
            } text-white transition-colors`}
          >
            <CheckCircle className="h-6 w-6" />
            {isParentMode ? '作品を作成' : 'さくひんを つくる'}
          </button>
        </div>
      </div>
    </div>
  );
}