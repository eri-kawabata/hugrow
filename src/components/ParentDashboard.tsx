import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart2, Heart, Image } from 'lucide-react';

export const ParentDashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/parent/analytics/sel"
          className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-lg">
              <Heart className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">感情分析</h2>
              <p className="text-sm text-gray-500">お子様の感情の変化を確認</p>
            </div>
          </div>
        </Link>

        <Link
          to="/parent/analytics/arts"
          className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-lg">
              <BarChart2 className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">学習分析</h2>
              <p className="text-sm text-gray-500">学習の進捗を確認</p>
            </div>
          </div>
        </Link>

        <Link
          to="/parent/works"
          className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-lg">
              <Image className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">作品一覧</h2>
              <p className="text-sm text-gray-500">お子様の作品を確認</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}; 