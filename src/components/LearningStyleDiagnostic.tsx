import React, { useState } from 'react';
import { Layout } from './Layout';
import { Brain, Eye, Ear, Hand, ArrowRight, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

type Question = {
  id: string;
  text: string;
  category: 'visual' | 'auditory' | 'kinesthetic';
};

const questions: Question[] = [
  {
    id: 'q1',
    text: '新しい内容を学ぶとき、図や絵があると理解しやすい',
    category: 'visual'
  },
  {
    id: 'q2',
    text: '説明を聞いて理解するのが得意だ',
    category: 'auditory'
  },
  {
    id: 'q3',
    text: '実際に手を動かして体験しながら学ぶのが好きだ',
    category: 'kinesthetic'
  },
  // 他の質問も追加
];

export function LearningStyleDiagnostic() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAnswer = (score: number) => {
    const newAnswers = { ...answers, [questions[currentQuestion].id]: score };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitDiagnostic(newAnswers);
    }
  };

  const submitDiagnostic = async (finalAnswers: Record<string, number>) => {
    if (!supabase) return;

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('ログインが必要です');
        return;
      }

      // 各カテゴリーのスコアを計算
      const scores = {
        visual_score: calculateCategoryScore(finalAnswers, 'visual'),
        auditory_score: calculateCategoryScore(finalAnswers, 'auditory'),
        kinesthetic_score: calculateCategoryScore(finalAnswers, 'kinesthetic')
      };

      const { error } = await supabase
        .from('learning_styles')
        .upsert({
          user_id: user.id,
          ...scores,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('診断が完了しました！');
      navigate('/learning');
    } catch (error) {
      console.error('Error:', error);
      toast.error('診断の保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const calculateCategoryScore = (
    answers: Record<string, number>,
    category: string
  ): number => {
    const categoryQuestions = questions.filter(q => q.category === category);
    const totalScore = categoryQuestions.reduce(
      (sum, q) => sum + (answers[q.id] || 0),
      0
    );
    return Math.round((totalScore / (categoryQuestions.length * 5)) * 100);
  };

  const question = questions[currentQuestion];

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <Brain className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              学習スタイル診断
            </h1>
            <p className="text-gray-600">
              あなたに合った学習方法を見つけましょう
            </p>
          </div>

          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>質問 {currentQuestion + 1} / {questions.length}</span>
              <span>{Math.round((currentQuestion / questions.length) * 100)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${(currentQuestion / questions.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4">{question.text}</h2>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((score) => (
                <button
                  key={score}
                  onClick={() => handleAnswer(score)}
                  className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-indigo-300 transition-all text-left flex items-center justify-between group"
                >
                  <span className="font-medium">
                    {score === 5 ? 'とてもそう思う' :
                     score === 4 ? 'そう思う' :
                     score === 3 ? 'どちらでもない' :
                     score === 2 ? 'あまりそう思わない' :
                     'まったくそう思わない'}
                  </span>
                  <div className="w-8 h-8 rounded-full border-2 border-gray-200 group-hover:border-indigo-300 flex items-center justify-center">
                    {score}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4 text-blue-600" />
                <span>視覚的</span>
              </div>
              <div className="flex items-center gap-1">
                <Ear className="h-4 w-4 text-green-600" />
                <span>聴覚的</span>
              </div>
              <div className="flex items-center gap-1">
                <Hand className="h-4 w-4 text-orange-600" />
                <span>体験的</span>
              </div>
            </div>
            {loading && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600" />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}