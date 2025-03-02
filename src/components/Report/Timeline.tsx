import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Trophy, Heart } from 'lucide-react';

interface TimelineItem {
  id: string;
  date: Date;
  title: string;
  description: string;
  icon?: string;
}

interface TimelineProps {
  items: TimelineItem[];
}

export function Timeline({ items }: TimelineProps) {
  return (
    <div className="relative">
      {/* 縦線 */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />

      <div className="space-y-6">
        {items.map((item) => (
          <div key={item.id} className="relative flex items-start gap-4">
            {/* アイコン */}
            <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center bg-white rounded-full border-2 border-gray-200 z-10">
              {item.icon ? (
                <img src={item.icon} alt="" className="w-8 h-8" />
              ) : (
                item.title.includes('実績') ? (
                  <Trophy className="w-8 h-8 text-yellow-500" />
                ) : (
                  <Heart className="w-8 h-8 text-pink-500" />
                )
              )}
            </div>

            {/* コンテンツ */}
            <div className="flex-grow pt-2">
              <div className="text-sm text-gray-500">
                {format(item.date, 'M月d日 HH:mm', { locale: ja })}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-1">
                {item.title}
              </h3>
              <p className="text-gray-600 mt-1">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 