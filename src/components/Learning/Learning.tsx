import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Microscope, 
  Cpu, 
  Wrench, 
  Palette, 
  Calculator 
} from 'lucide-react';

type SubjectCardProps = {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  type: 'science' | 'technology' | 'engineering' | 'art' | 'math';
};

const SubjectCard = React.memo(({ to, icon, title, description }: SubjectCardProps) => (
  <Link
    to={to}
    className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 hover:scale-[1.02]"
  >
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-indigo-50 rounded-lg">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </div>
  </Link>
));

SubjectCard.displayName = 'SubjectCard';

// 科目一覧
const subjects: SubjectCardProps[] = [
  {
    to: '/child/learning/science',
    type: 'science',
    icon: <Microscope className="h-6 w-6 text-indigo-600" />,
    title: 'りか',
    description: 'しぜんのふしぎをたんけんしよう',
  },
  {
    to: '/child/learning/technology',
    type: 'technology',
    icon: <Cpu className="h-6 w-6 text-indigo-600" />,
    title: 'ぎじゅつ',
    description: 'コンピュータのしくみをまなぼう',
  },
  {
    to: '/child/learning/engineering',
    type: 'engineering',
    icon: <Wrench className="h-6 w-6 text-indigo-600" />,
    title: 'こうがく',
    description: 'ものづくりのげんりをしろう',
  },
  {
    to: '/child/learning/art',
    type: 'art',
    icon: <Palette className="h-6 w-6 text-indigo-600" />,
    title: 'げいじゅつ',
    description: 'そうぞうりょくをのばそう',
  },
  {
    to: '/child/learning/math',
    type: 'math',
    icon: <Calculator className="h-6 w-6 text-indigo-600" />,
    title: 'すうがく',
    description: 'かずとけいさんをたのしもう',
  },
];

// メインコンポーネント
export function Learning() {
  const subjectCards = useMemo(() => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {subjects.map((subject) => (
        <SubjectCard key={subject.to} {...subject} />
      ))}
    </div>
  ), []);

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-28">
      {/* ヘッダーセクション */}
      <div className="bg-gradient-to-r from-[#8ec5d6] via-[#f7c5c2] to-[#f5f6bf] -mx-4 px-4 py-10 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 rounded-b-[40px] shadow-lg">
        <h1 className="text-4xl font-bold text-white text-center drop-shadow-md">がくしゅう</h1>
      </div>

      <div className="px-6">
        <div className="space-y-8">
          <div>
            <p className="text-lg text-gray-600 text-center">すきなかもくをえらんでがくしゅうをはじめよう！</p>
          </div>
          {subjectCards}
        </div>
      </div>
    </div>
  );
} 