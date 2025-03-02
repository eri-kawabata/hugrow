import { SubjectBase } from '../SubjectBase';

const SCIENCE_TOPICS = [
  {
    id: 'plants',
    title: 'しょくぶつのせいちょう',
    description: 'たねからめがでて、はっぱがそだつようすをしらべよう',
    difficulty: 1,
    estimatedTime: '15ぷん',
    thumbnailUrl: '/images/learning/science/plants.jpg'
  },
  {
    id: 'weather',
    title: 'てんきとくらし',
    description: 'いちにちのてんきのかわりかたをかんさつしよう',
    difficulty: 2,
    estimatedTime: '20ぷん',
    thumbnailUrl: '/images/learning/science/weather.jpg'
  }
  // ... 他のトピック
];

export function ScienceLearning() {
  return (
    <SubjectBase
      subject="science"
      title="りかのせかい"
      description="しぜんのふしぎをたんけんしよう！"
      topics={SCIENCE_TOPICS}
    >
      {/* 理科特有のコンテンツをここに追加 */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-bold mb-4">今日のかんさつ</h2>
        {/* 観察日記などの理科特有の機能 */}
      </div>
    </SubjectBase>
  );
}