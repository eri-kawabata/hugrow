import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from './Layout';
import { LoadingState } from './Common/LoadingState';
import { ErrorState } from './Common/ErrorState';
import { useWorks } from '../hooks/useWorks';
import { useParentMode } from '../hooks/useParentMode';
import { useAuth } from '../hooks/useAuth';
import { Loader2, ArrowLeft } from 'lucide-react';

export function Works() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isParentMode } = useParentMode();
  const { works, loading, error, fetchWorks } = useWorks();

  // 認証チェック
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [authLoading, user, navigate]);

  if (authLoading || loading) {
    return <LoadingState />;
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <ErrorState
        message="作品の読み込みに失敗しました"
        onRetry={fetchWorks}
      />
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="もどる"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold">
            {isParentMode ? "作品一覧" : "わたしのさくひん"}
          </h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : works.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {works.map((work) => (
              <div
                key={work.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <img
                  src={work.media_url}
                  alt={work.title}
                  className="w-full aspect-video object-cover"
                />
                <div className="p-4">
                  <h2 className="font-bold text-lg mb-1">{work.title}</h2>
                  {work.description && (
                    <p className="text-gray-600 text-sm">{work.description}</p>
                  )}
                  <div className="mt-2 text-sm text-gray-500">
                    {new Date(work.created_at).toLocaleDateString('ja-JP')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {isParentMode ? 
                "まだ作品がありません" : 
                "まださくひんがないよ！"
              }
            </p>
            <p className="text-gray-500 mt-2">
              {isParentMode ? 
                "子供が作品を作成すると、ここに表示されます" : 
                "おえかきやしゃしんをとってみよう！"
              }
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
} 