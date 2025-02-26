import React, { useState, useEffect } from 'react';
import { Layout } from './Layout';
import {
  Cpu, Play, Clock, Star, ArrowLeft, CheckCircle, Lock,
  X, Award, HelpCircle, Share2, TrendingUp, Code,
  MonitorSmartphone, Laptop, Terminal
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import type { LearningProgress, Badge } from '../lib/types';
import * as confetti from 'canvas-confetti';

export function TechnologyLearning() {
  const [currentLesson, setCurrentLesson] = useState(0);
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [loading, setLoading] = useState(true);

  const lessons = [
    {
      id: 'tech-1',
      title: 'お絵描きソフトで絵を描こう',
      description: 'デジタルツールを使って自由に絵を描き、色や形を自由に表現する方法を学びます。',
      demoUrl: 'https://example.com/paint-app',
      points: 100,
      duration: '20分',
      tools: ['ペイントツール', 'カラーパレット', '図形ツール']
    },
    {
      id: 'tech-2',
      title: '簡単なアニメーションを作ろう',
      description: 'コマ送りアニメーションの原理を学び、簡単なアニメーションを作成します。',
      demoUrl: 'https://example.com/animation-maker',
      points: 150,
      duration: '25分',
      tools: ['アニメーションツール', 'タイムライン', 'レイヤー']
    },
    {
      id: 'tech-3',
      title: 'プログラミングで図形を描こう',
      description: '簡単なプログラミングを使って、様々な図形を描く方法を学びます。',
      demoUrl: 'https://example.com/code-shapes',
      points: 200,
      duration: '30分',
      tools: ['コードエディタ', '実行環境', 'デバッガー'],
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
        .eq('category', 'technology');

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
            <div className="bg-purple-100 p-4 rounded-xl">
              <Cpu className="h-8 w-8 text-purple-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {lessons[currentLesson].title}
              </h1>
              <p className="text-gray-600 mb-6">
                {lessons[currentLesson].description}
              </p>
              <div className="flex flex-wrap gap-4 mb-6">
                {lessons[currentLesson].tools.map((tool, index) => (
                  <div
                    key={index}
                    className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    <Code className="h-4 w-4" />
                    {tool}
                  </div>
                ))}
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
                  onClick={() => setShowCodeEditor(true)}
                  className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <Terminal className="h-5 w-5" />
                  レッスンを始める
                </button>
                <button
                  onClick={() => setShowQuiz(true)}
                  className="bg-white border-2 border-purple-600 text-purple-600 px-6 py-3 rounded-xl font-bold hover:bg-purple-50 transition-colors flex items-center gap-2"
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
                  ? 'border-purple-600 bg-purple-50'
                  : lesson.locked
                  ? 'border-gray-200 opacity-50 cursor-not-allowed'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
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
            <Award className="h-6 w-6 text-purple-600" />
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

        {/* Code Editor Modal */}
        {showCodeEditor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xl font-bold">
                  {lessons[currentLesson].title}
                </h3>
                <button
                  onClick={() => setShowCodeEditor(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="h-[600px] bg-gray-900 p-4">
                <iframe
                  src={lessons[currentLesson].demoUrl}
                  className="w-full h-full rounded-lg"
                  title="Code Editor"
                />
              </div>
              <div className="p-6 flex justify-end">
                <button
                  onClick={() => {
                    handleLessonComplete();
                    setShowCodeEditor(false);
                  }}
                  className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors flex items-center gap-2"
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