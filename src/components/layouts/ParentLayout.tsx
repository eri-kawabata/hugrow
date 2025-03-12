import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { BarChart2, Heart, Image, User, BookOpen } from 'lucide-react';
import { BaseLayout } from './BaseLayout';

export const ParentLayout: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <BaseLayout>
      <Outlet />
      {/* Footer Navigation */}
      <footer className="fixed bottom-0 w-full bg-white border-t border-gray-100 shadow-lg">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="h-16 flex items-center justify-around">
            <li>
              <Link
                to="/parent/dashboard"
                className={`flex flex-col items-center space-y-1 ${
                  isActive('/parent/dashboard') ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <BarChart2 className="h-6 w-6" />
                <span className="text-xs">ダッシュボード</span>
              </Link>
            </li>
            <li>
              <Link
                to="/parent/analytics/sel"
                className={`flex flex-col items-center space-y-1 ${
                  isActive('/parent/analytics/sel') ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Heart className="h-6 w-6" />
                <span className="text-xs">感情分析</span>
              </Link>
            </li>
            <li>
              <Link
                to="/parent/analytics/learning"
                className={`flex flex-col items-center space-y-1 ${
                  isActive('/parent/analytics/learning') ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <BookOpen className="h-6 w-6" />
                <span className="text-xs">学習進捗</span>
              </Link>
            </li>
            <li>
              <Link
                to="/parent/works"
                className={`flex flex-col items-center space-y-1 ${
                  isActive('/parent/works') ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Image className="h-6 w-6" />
                <span className="text-xs">作品一覧</span>
              </Link>
            </li>
            <li>
              <Link
                to="/parent/profile"
                className={`flex flex-col items-center space-y-1 ${
                  isActive('/parent/profile') ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <User className="h-6 w-6" />
                <span className="text-xs">プロフィール</span>
              </Link>
            </li>
          </ul>
        </nav>
      </footer>
    </BaseLayout>
  );
}; 