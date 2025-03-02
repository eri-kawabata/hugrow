import { Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  progress: number;
  icon: LucideIcon;
  color: string;
  textColor: string;
  borderColor: string;
  path: string;
}

interface Props {
  lesson: Lesson;
}

export function RecommendedLesson({ lesson }: Props) {
  const Icon = lesson.icon;

  return (
    <div className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border ${lesson.borderColor}`}>
      <div className="relative">
        <img
          src={lesson.thumbnail_url}
          alt={lesson.title}
          className="w-full h-48 object-cover rounded-t-xl"
        />
        <div className="absolute top-4 right-4">
          <Sparkles className="h-5 w-5 text-yellow-400" />
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-lg ${lesson.color}`}>
            <Icon className={`h-5 w-5 ${lesson.textColor}`} />
          </div>
          <h3 className="text-lg font-semibold">{lesson.title}</h3>
        </div>
        <p className="text-gray-600 text-sm mb-4">{lesson.description}</p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>進捗</span>
            <span>{lesson.progress}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full">
            <div
              className={`h-full rounded-full transition-all ${lesson.textColor.replace('text-', 'bg-')}`}
              style={{ width: `${lesson.progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 