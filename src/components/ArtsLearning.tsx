import React, { useState, useEffect } from 'react';
import { Layout } from './Layout';
import { Palette, Play, Clock, Star, ArrowLeft, CheckCircle, Lock, X, Award, HelpCircle, Share2, TrendingUp, Brush, Music, Scissors, Camera, Sticker as ColorPicker } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import type { LearningProgress, Badge } from '../lib/types';
import * as confetti from 'canvas-confetti';

export function ArtsLearning() {
  const [currentLesson, setCurrentLesson] = useState(0);
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);
  const [loading, setLoading] = useState(true);

  const lessons = [
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

  useEffect(() => {
    fetchProgress();
    fetchBadges();
  }, [currentLesson]);

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

      if (error) {
        console.error('Error fetching progress:', error);
        return;
      }

      setProgress(data || null);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBadges = async () => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .eq('category', 'arts');

      if (error) {
        console.error('Error fetching badges:', error);
        return;
      }

      setBadges(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

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

      confetti.default({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      toast.success('レッスンを完了しました！');
      fetchProgress();
    } catch (error) {
      console.error('Error:', error);
      toast.error('進捗の保存に失敗しました');
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/learning"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span>学習メニューに戻る</span>
          </Link>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <Share2 className="h-5 w-5" />
              <span>共有</span>
            </button>
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <TrendingUp className="h-5 w-5" />
              <span>分析</span>
            </button>
          </div>
        </div>

        {/* Current Lesson */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="bg-pink-100 p-4 rounded-xl">
              <Palette className="h-8 w-8 text-pink-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {lessons[currentLesson].title}
              </h1>
              <p className="text-gray-600 mb-6">
                {lessons[currentLesson].description}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Brush className="h-5 w-5 text-pink-600" />
                    必要な材料
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {lessons[currentLesson].materials.map((material, index) => (
                      <div
                        key={index}
                        className="bg-pink-50 text-pink-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        <span>・{material}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <ColorPicker className="h-5 w-5 text-pink-600" />
                    学習する技法
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {lessons[currentLesson].techniques.map((technique, index) => (
                      <div
                        key={index}
                        className="bg-pink-50 text-pink-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        <Camera className="h-4 w-4" />
                        {technique}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span>{lessons[currentLesson].points} ポイント</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <span>{lessons[currentLesson].duration}</span>
                </div>
                {progress?.completed && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span>完了済み</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowCanvas(true)}
                  className="bg-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-pink-700 transition-colors flex items-center gap-2"
                >
                  <Brush className="h-5 w-5" />
                  作品を作る
                </button>
                <button
                  onClick={() => setShowQuiz(true)}
                  className="bg-white border-2 border-pink-600 text-pink-600 px-6 py-3 rounded-xl font-bold hover:bg-pink-50 transition-colors flex items-center gap-2"
                >
                  <HelpCircle className="h-5 w-5" />
                  クイズに挑戦
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lesson Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {lessons.map((lesson, index) => (
            <button
              key={lesson.id}
              onClick={() => !lesson.locked && setCurrentLesson(index)}
              className={`p-6 rounded-xl border-2 text-left transition-all ${
                currentLesson === index
                  ? 'border-pink-600 bg-pink-50'
                  : lesson.locked
                  ? 'border-gray-200 opacity-50 cursor-not-allowed'
                  : 'border-gray-200 hover:border-pink-300'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
                    {index + 1}
                  </div>
                  {lesson.locked ? (
                    <Lock className="h-5 w-5 text-gray-400" />
                  ) : progress?.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : null}
                </div>
                <Star className="h-5 w-5 text-yellow-500" />
              </div>
              <h3 className="font-bold mb-2">{lesson.title}</h3>
              <p className="text-sm text-gray-600">{lesson.description}</p>
            </button>
          ))}
        </div>

        {/* Badges */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Award className="h-6 w-6 text-pink-600" />
            獲得したバッジ
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="text-center p-4 rounded-xl border-2 border-gray-100"
              >
                <img
                  src={badge.icon_url}
                  alt={badge.name}
                  className="w-16 h-16 mx-auto mb-3"
                />
                <div className="font-bold mb-1">{badge.name}</div>
                <div className="text-sm text-gray-600">{badge.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Canvas Modal */}
        {showCanvas && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xl font-bold">
                  {lessons[currentLesson].title}
                </h3>
                <button
                  onClick={() => setShowCanvas(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="h-[600px] bg-gray-100 p-4">
                <iframe
                  src={lessons[currentLesson].canvasUrl}
                  className="w-full h-full rounded-lg"
                  title="Canvas"
                />
              </div>
              <div className="p-6 flex justify-end">
                <button
                  onClick={() => {
                    handleLessonComplete();
                    setShowCanvas(false);
                  }}
                  className="bg-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-pink-700 transition-colors flex items-center gap-2"
                >
                  <CheckCircle className="h-5 w-5" />
                  作品を完成
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}