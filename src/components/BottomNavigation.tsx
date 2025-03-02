import { Link, useLocation } from 'react-router-dom';
import { Home, Image, Camera } from 'lucide-react';
import { useParentMode } from '../hooks/useParentMode';

export function BottomNavigation() {
  const location = useLocation();
  const { isParentMode } = useParentMode();

  // モードに応じたナビゲーション項目
  const navigationItems = isParentMode ? [
    { path: '/', icon: <Home className="h-6 w-6" />, label: 'ホーム' },
    { path: '/works', icon: <Image className="h-6 w-6" />, label: '作品一覧' }
  ] : [
    { path: '/', icon: <Home className="h-6 w-6" />, label: 'ホーム' },
    { path: '/my-works', icon: <Image className="h-6 w-6" />, label: 'さくひんしゅう' },
    { path: '/camera', icon: <Camera className="h-6 w-6" />, label: 'カメラ' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="max-w-md mx-auto px-4 py-2">
        <div className="flex justify-around items-center">
          {navigationItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center p-2 ${
                location.pathname === item.path ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 