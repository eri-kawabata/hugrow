import { useMemo } from 'react';
import { Book, TrendingUp, Award } from 'lucide-react';
import type { SubjectProgressType } from '../../lib/types';

interface SubjectsSectionProps {
  progress: SubjectProgressType[];
}

function SubjectCard({ subject, progress, color, icon }: SubjectProgressType) {
  const level = Math.floor(progress / 20);
  const nextLevel = (level + 1) * 20;
  const progressToNext = progress % 20;

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
            {icon}
          </div>
          <h3 className="font-medium text-gray-900">{subject}</h3>
        </div>
        <div className="flex items-center gap-1">
          <Award className="h-5 w-5 text-yellow-500" />
          <span className="font-medium">Lv.{level}</span>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>次のレベルまで</span>
          <span>{progressToNext}/20</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full ${color}`}
            style={{ width: `${(progressToNext / 20) * 100}%` }}
          />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">総進捗: {progress}%</span>
          <div className="flex items-center gap-1 text-sm text-green-600">
            <TrendingUp className="h-4 w-4" />
            <span>+5%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SubjectsSection({ progress }: SubjectsSectionProps) {
  const sortedProgress = useMemo(() => 
    [...progress].sort((a, b) => b.progress - a.progress)
  , [progress]);

  return (
    <section className="bg-gray-50 rounded-xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <Book className="h-6 w-6 text-gray-700" />
        <h2 className="text-xl font-bold text-gray-900">教科別の進捗</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedProgress.map((subject) => (
          <SubjectCard key={subject.subject} {...subject} />
        ))}
      </div>
    </section>
  );
} 