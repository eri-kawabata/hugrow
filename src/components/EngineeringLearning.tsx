import React, { useState, useEffect } from 'react';
import { Layout } from './Layout';
import { Wrench, Play, Clock, Star, ArrowLeft, CheckCircle, Lock, X, Award, HelpCircle, Share2, TrendingUp, PenTool as Tool, Ruler, Hammer, Lightbulb, Cog } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import type { LearningProgress, Badge } from '../lib/types';
import * as confetti from 'canvas-confetti';

export function EngineeringLearning() {
  const [currentLesson, setCurrentLesson] = useState(0);
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showProject, setShowProject] = useState(false);
  const [loading, setLoading] = useState(true);

  const lessons = [
    {
      id: 'eng-1',
      title: '橋を作って強度を試そう',
      description: '紙や木材を使って橋を作り、どうすれば丈夫な構造になるのか実験しながら学びます。',
      projectUrl: 'https://example.com/bridge-builder',
      points: 100,
      duration: '30分',
      materials: ['紙', '木材', 'テープ', 'はさみ'],
      concepts: ['構造力学', '材料強度', '設計プロセス']
    },
    {
      id: 'eng-2',
      title: 'リサイクル材で作品を作ろう',
      description: '身近なリサイクル材料を使って、環境に優しい創造的な作品を作ります。',
      projectUrl: 'https://example.com/recycling-art',
      points: 150,
      duration: '35分',
      materials: ['ペットボトル', '段ボール', '空き缶', '布'],
      concepts: ['リサイクル', '創造性', '環境配慮']
    },
    {
      id: 'eng-3',
      title: '風で動く装置を作ろう',
      description: '風の力を利用して動く装置を作り、自然エネルギーの活用方法を学びます。',
      projectUrl: 'https://example.com/wind-power',
      points: 200,
      duration: '40分',
      materials: ['プロペラ', '軸', 'モーター', '電池'],
      concepts: ['エネルギー変換', '機械設計', '効率化'],
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
        .eq('category', 'engineering');

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
            <div className="bg-orange-100 p-4 rounded-xl">
              <Wrench className="h-8 w-8 text-orange-600" />
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
                    <Tool className="h-5 w-5 text-orange-600" />
                    必要な材料
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {lessons[currentLesson].materials.map((material, index) => (
                      <div
                        key={index}
                        className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        <span>・{material}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-orange-600" />
                    学習する概念
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {lessons[currentLesson].concepts.map((concept, index) => (
                      <div
                        key={index}
                        className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        <Cog className="h-4 w-4" />
                        {concept}
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
                  onClick={() => setShowProject(true)}
                  className="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors flex items-center gap-2"
                >
                  <Hammer className="h-5 w-5" />
                  プロジェクトを始める
                </button>
                <button
                  onClick={() => setShowQuiz(true)}
                  className="bg-white border-2 border-orange-600 text-orange-600 px-6 py-3 rounded-xl font-bold hover:bg-orange-50 transition-colors flex items-center gap-2"
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
                  ? 'border-orange-600 bg-orange-50'
                  : lesson.locked
                  ? 'border-gray-200 opacity-50 cursor-not-allowed'
                  : 'border-gray-200 hover:border-orange-300'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
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
            <Award className="h-6 w-6 text-orange-600" />
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

        {/* Project Modal */}
        {showProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xl font-bold">
                  {lessons[currentLesson].title}
                </h3>
                <button
                  onClick={() => setShowProject(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="h-[600px] bg-gray-100 p-4">
                <iframe
                  src={lessons[currentLesson].projectUrl}
                  className="w-full h-full rounded-lg"
                  title="Project Viewer"
                />
              </div>
              <div className="p-6 flex justify-end">
                <button
                  onClick={() => {
                    handleLessonComplete();
                    setShowProject(false);
                  }}
                  className="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors flex items-center gap-2"
                >
                  <CheckCircle className="h-5 w-5" />
                  プロジェクトを完了
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}