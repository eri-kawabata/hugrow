import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { BarChart2, Heart, Image, User, BookOpen, Home } from 'lucide-react';
import { BaseLayout } from './BaseLayout';

export const ParentLayout: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <BaseLayout>
      <Outlet />
      {/* Footer Navigation */}
      <footer className="fixed bottom-0 w-full bg-white border-t border-gray-100 shadow-lg z-10">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="h-16 flex items-center justify-around">
            <li>
              <Link
                to="/parent/dashboard"
                className={`flex flex-col items-center space-y-1 ${
                  isActive('/parent/dashboard') 
                    ? 'text-indigo-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                aria-label="ダッシュボード"
              >
                <div className={`p-2 rounded-full ${isActive('/parent/dashboard') ? 'bg-indigo-100' : ''}`}>
                  <Home className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium">ホーム</span>
              </Link>
            </li>
            <li>
              <Link
                to="/parent/analytics/sel"
                className={`flex flex-col items-center space-y-1 ${
                  isActive('/parent/analytics/sel') 
                    ? 'text-pink-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                aria-label="感情分析"
              >
                <div className={`p-2 rounded-full ${isActive('/parent/analytics/sel') ? 'bg-pink-100' : ''}`}>
                  <Heart className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium">感情分析</span>
              </Link>
            </li>
            <li>
              <Link
                to="/parent/analytics/learning"
                className={`flex flex-col items-center space-y-1 ${
                  isActive('/parent/analytics/learning') 
                    ? 'text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                aria-label="学習進捗"
              >
                <div className={`p-2 rounded-full ${isActive('/parent/analytics/learning') ? 'bg-blue-100' : ''}`}>
                  <BookOpen className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium">学習</span>
              </Link>
            </li>
            <li>
              <Link
                to="/parent/works"
                className={`flex flex-col items-center space-y-1 ${
                  isActive('/parent/works') 
                    ? 'text-purple-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                aria-label="作品一覧"
              >
                <div className={`p-2 rounded-full ${isActive('/parent/works') ? 'bg-purple-100' : ''}`}>
                  <Image className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium">作品</span>
              </Link>
            </li>
            <li>
              <Link
                to="/parent/profile"
                className={`flex flex-col items-center space-y-1 ${
                  isActive('/parent/profile') 
                    ? 'text-green-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                aria-label="プロフィール"
              >
                <div className={`p-2 rounded-full ${isActive('/parent/profile') ? 'bg-green-100' : ''}`}>
                  <User className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium">設定</span>
              </Link>
            </li>
          </ul>
        </nav>
      </footer>
    </BaseLayout>
  );
}; 