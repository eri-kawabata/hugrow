import { useRecommendations } from '../../hooks/useRecommendations';
import { RecommendedLesson } from './RecommendedLesson';
import { RecentWorks } from './RecentWorks';

export function ChildHome() {
  const { recommendations } = useRecommendations();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* ウェルカムメッセージ */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-8 mb-8 text-white">
        <h1 className="text-3xl font-bold mb-2">おかえりなさい！</h1>
        <p>今日も一緒に楽しく学びましょう</p>
      </div>

      {/* 今日のおすすめ */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="text-purple-600">✨</span>
            今日のおすすめ
          </h2>
          <a href="/recommendations" className="text-sm text-purple-600 hover:text-purple-700">
            もっと見る →
          </a>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recommendations.map(lesson => (
            <RecommendedLesson key={lesson.id} lesson={lesson} />
          ))}
        </div>
      </section>

      {/* 最近の作品 */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="text-pink-600">🎨</span>
            最近の作品
          </h2>
          <a href="/works" className="text-sm text-pink-600 hover:text-pink-700">
            すべて見る →
          </a>
        </div>
        <RecentWorks />
      </section>
    </div>
  );
} 