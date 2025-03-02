import React, { memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Image, Music, Camera, Plus } from 'lucide-react';
import { useWorks, Work } from '@/hooks/useWorks';
import { LoadingSpinner } from '@/components/Common/LoadingSpinner';
import { ErrorMessage } from '@/components/Common/ErrorMessage';
import { EmptyState } from '@/components/Common/EmptyState';

const WorkTypeIcon = memo(({ type }: { type: Work['type'] }) => {
  const icons = {
    drawing: <Image className="h-6 w-6 text-indigo-600" />,
    audio: <Music className="h-6 w-6 text-indigo-600" />,
    photo: <Camera className="h-6 w-6 text-indigo-600" />,
  };

  return icons[type] || null;
});

WorkTypeIcon.displayName = 'WorkTypeIcon';

const CreateWorkButton = memo(() => (
  <Link
    to="/child/works/new"
    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
  >
    <Plus className="h-5 w-5" />
    <span>新しい作品を作る</span>
  </Link>
));

CreateWorkButton.displayName = 'CreateWorkButton';

const WorkCard = memo(({ work }: { work: Work }) => (
  <Link
    to={`/child/works/${work.id}`}
    className="group block bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 hover:scale-[1.02]"
  >
    <div className="flex items-start gap-4">
      <div className="p-3 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
        <WorkTypeIcon type={work.type} />
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="font-semibold text-gray-900 truncate">{work.title}</h2>
        <p className="text-sm text-gray-500">
          {new Date(work.created_at).toLocaleDateString('ja-JP')}
        </p>
      </div>
    </div>
  </Link>
));

WorkCard.displayName = 'WorkCard';

const WorksGrid = memo(({ works }: { works: Work[] }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
    {works.map((work) => (
      <WorkCard key={work.id} work={work} />
    ))}
  </div>
));

WorksGrid.displayName = 'WorksGrid';

const Header = memo(() => (
  <div className="flex justify-between items-center mb-8">
    <h1 className="text-2xl font-bold text-gray-900">わたしの作品</h1>
    <CreateWorkButton />
  </div>
));

Header.displayName = 'Header';

export function MyWorks() {
  const { works, loading, error, fetchWorks } = useWorks();

  const handleRetry = useCallback(() => {
    fetchWorks();
  }, [fetchWorks]);

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  if (error) {
    return (
      <ErrorMessage
        title="作品の読み込みに失敗しました"
        message="作品の読み込み中にエラーが発生しました。"
        onRetry={handleRetry}
      />
    );
  }

  if (works.length === 0) {
    return (
      <div className="space-y-8">
        <Header />
        <EmptyState
          title="まだ作品がありません"
          message="新しい作品を作ってみましょう！"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Header />
      <WorksGrid works={works} />
    </div>
  );
} 