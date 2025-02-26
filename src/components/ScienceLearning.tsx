import React, { useState, useEffect } from 'react';
import { Layout } from './Layout';
import {
  Beaker, Play, Clock, Star, ArrowLeft, CheckCircle, Lock,
  X, Award, HelpCircle, ChevronRight, ChevronLeft, Share2,
  TrendingUp, Brain, BookOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import type { LearningProgress, Badge, Quiz } from '../lib/types';
import * as confetti from 'canvas-confetti';

export function ScienceLearning() {
  const [currentLesson, setCurrentLesson] = useState(0);
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const lessons = [
    {
      id: 'science-1',
      title: '水の状態変化を観察しよう',
      description: '水が氷になったり、蒸気になったりする様子を観察して、温度による物質の状態変化について学びます。',
      videoUrl: 'https://example.com/science-1.mp4',
      points: 100,
      duration: '15分'
    },
    {
      id: 'science-2',
      title: '植物の成長を記録しよう',
      description: '種から芽が出て、葉が育つまでの過程を観察日記につけて、植物の生長について理解を深めます。',
      videoUrl: 'https://example.com/science-2.mp4',
      points: 150,
      duration: '20分'
    },
    {
      id: 'science-3',
      title: '光の性質を調べよう',
      description: 'プリズムや鏡を使って光の反射や屈折を観察し、光の基本的な性質について学びます。',
      videoUrl: 'https://example.com/science-3.mp4',
      points: 200,
      duration: '25分',
      locked: true
    }
  ];

  useEffect(() => {
    fetchProgress();
    fetchBadges();
  }, [currentLesson]); // currentLessonが変更されたときにも進捗を再取得

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
        .maybeSingle(); // singleの代わりにmaybeSingleを使用

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
        .eq('category', 'science');

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

      // バッジ獲得のアニメーション
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
            <div className="bg-blue-100 p-4 rounded-xl">
              <Beaker className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {lessons[currentLesson].title}
              </h1>
              <p className="text-gray-600 mb-6">
                {lessons[currentLesson].description}
              </p>
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
                  onClick={() => setShowVideoModal(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Play className="h-5 w-5" />
                  レッスンを始める
                </button>
                <button
                  onClick={() => setShowQuiz(true)}
                  className="bg-white border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors flex items-center gap-2"
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
                  ? 'border-blue-600 bg-blue-50'
                  : lesson.locked
                  ? 'border-gray-200 opacity-50 cursor-not-allowed'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
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
            <Award className="h-6 w-6 text-indigo-600" />
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

        {/* Video Modal */}
        {showVideoModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xl font-bold">
                  {lessons[currentLesson].title}
                </h3>
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="aspect-video bg-black">
                <video
                  src={lessons[currentLesson].videoUrl}
                  controls
                  className="w-full h-full"
                />
              </div>
              <div className="p-6 flex justify-end">
                <button
                  onClick={() => {
                    handleLessonComplete();
                    setShowVideoModal(false);
                  }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <CheckCircle className="h-5 w-5" />
                  レッスンを完了
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}