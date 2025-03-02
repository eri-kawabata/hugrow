import React from 'react';
import { Layout } from './Layout';
import { useNavigate } from 'react-router-dom';
import { Award, ArrowLeft } from 'lucide-react';

export function ArtsComplete() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block p-6 bg-pink-100 rounded-full mb-6">
            <Award className="h-12 w-12 text-pink-600" />
          </div>
          <h1 className="text-3xl font-bold mb-4">おめでとうございます！</h1>
          <p className="text-xl text-gray-600 mb-8">
            すべてのレッスンを完了しました
          </p>
          <button
            onClick={() => navigate('/learning')}
            className="inline-flex items-center gap-2 bg-pink-500 text-white px-6 py-3 rounded-xl hover:bg-pink-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            学習メニューに戻る
          </button>
        </div>
      </div>
    </Layout>
  );
} 