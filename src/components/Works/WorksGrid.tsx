import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Image, Video, Calendar, Plus, Trash2 } from 'lucide-react';
import { useParentMode } from '../../hooks/useParentMode';
import type { Work } from '../../types/work';

interface Props {
  works: Work[];
  onDelete: (workId: string) => Promise<void>;
}

export function WorksGrid({ works, onDelete }: Props) {
  const { isParentMode } = useParentMode();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (workId: string, e: React.MouseEvent) => {
    e.preventDefault(); // Linkのクリックを防止
    e.stopPropagation();
    
    if (deletingId) return; // 削除処理中は新たな削除を防止
    
    if (confirm('この作品を削除してもよろしいですか？')) {
      try {
        setDeletingId(workId);
        await onDelete(workId);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* 新規作成カード */}
      <Link
        to="/works/new"
        className="aspect-square bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 hover:border-indigo-500 transition-colors flex flex-col items-center justify-center gap-4 group"
      >
        <div className="p-4 rounded-full bg-gray-100 group-hover:bg-indigo-100 transition-colors">
          <Plus className="h-8 w-8 text-gray-400 group-hover:text-indigo-600" />
        </div>
        <span className="text-gray-600 group-hover:text-indigo-600 font-medium">
          新しい作品を作る
        </span>
      </Link>

      {/* 作品カード */}
      {works.map(work => (
        <div key={work.id} className="relative">
          <Link
            to={isParentMode ? `/works/${work.id}` : '#'}
            className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            onClick={e => !isParentMode && e.preventDefault()}
          >
            {/* サムネイル */}
            <div className="aspect-square relative bg-gray-100">
              {work.media_type === 'image' ? (
                <img
                  src={work.media_url}
                  alt={work.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Video className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>

            {/* 作品情報 */}
            <div className="p-4">
              <h3 className="font-medium text-gray-900 mb-1">
                {work.title}
              </h3>
              {work.description && (
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                  {work.description}
                </p>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Calendar className="h-4 w-4" />
                <time dateTime={work.created_at}>
                  {new Date(work.created_at).toLocaleDateString('ja-JP')}
                </time>
              </div>
            </div>
          </Link>

          {/* 削除ボタン - 子供モードのみ表示 */}
          {!isParentMode && (
            <button
              onClick={(e) => handleDelete(work.id, e)}
              disabled={deletingId === work.id}
              className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors shadow-sm"
              aria-label="作品を削除"
            >
              {deletingId === work.id ? (
                <div className="h-5 w-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Trash2 className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
      ))}
    </div>
  );
} 