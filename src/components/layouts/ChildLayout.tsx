import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, PlusSquare, BookOpen, Image, Heart } from 'lucide-react';
import { BaseLayout } from './BaseLayout';

export const ChildLayout: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => {
    if (path === '/child/works/new') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <BaseLayout>
      <div className="min-h-screen bg-[#f8fbfd] pb-32">
        <Outlet />
      </div>
      {/* Footer Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 w-full bg-gradient-to-t from-white to-[#f8fbfd] border-t-4 border-[#8ec5d6]/30 shadow-lg">
        <nav className="w-full max-w-3xl mx-auto">
          <ul className="h-24 grid grid-cols-5 items-center justify-items-center w-full px-2">
            <li className="w-full flex justify-center">
              <Link
                to="/child/home"
                className={`flex flex-col items-center gap-2 w-full ${
                  isActive('/child/home')
                    ? 'text-[#5d7799] scale-110 transition-transform'
                    : 'text-gray-400 hover:text-[#5d7799] hover:scale-105 transition-all'
                }`}
              >
                <div className={`p-3 rounded-full ${isActive('/child/home') ? 'bg-[#8ec5d6]/30' : 'hover:bg-[#8ec5d6]/20'}`}>
                  <Home className="h-7 w-7" />
                </div>
                <span className="text-sm font-bold">ほーむ</span>
              </Link>
            </li>
            <li className="w-full flex justify-center">
              <Link
                to="/child/learning"
                className={`flex flex-col items-center gap-2 w-full ${
                  isActive('/child/learning')
                    ? 'text-[#5d7799] scale-110 transition-transform'
                    : 'text-gray-400 hover:text-[#5d7799] hover:scale-105 transition-all'
                }`}
              >
                <div className={`p-3 rounded-full ${isActive('/child/learning') ? 'bg-[#f7c5c2]/30' : 'hover:bg-[#f7c5c2]/20'}`}>
                  <BookOpen className="h-7 w-7" />
                </div>
                <span className="text-sm font-bold">がくしゅう</span>
              </Link>
            </li>
            <li className="w-full flex justify-center">
              <Link
                to="/child/works/new"
                className={`flex flex-col items-center gap-2 w-full ${
                  isActive('/child/works/new')
                    ? 'text-[#5d7799] scale-110 transition-transform'
                    : 'text-gray-400 hover:text-[#5d7799] hover:scale-105 transition-all'
                }`}
              >
                <div className={`p-3 rounded-full ${isActive('/child/works/new') ? 'bg-[#f5f6bf]/40' : 'hover:bg-[#f5f6bf]/30'}`}>
                  <PlusSquare className="h-7 w-7" />
                </div>
                <span className="text-sm font-bold">さくひん</span>
              </Link>
            </li>
            <li className="w-full flex justify-center">
              <Link
                to="/child/works"
                className={`flex flex-col items-center gap-2 w-full ${
                  location.pathname === '/child/works'
                    ? 'text-[#5d7799] scale-110 transition-transform'
                    : 'text-gray-400 hover:text-[#5d7799] hover:scale-105 transition-all'
                }`}
              >
                <div className={`p-3 rounded-full ${location.pathname === '/child/works' ? 'bg-[#8ec5d6]/30' : 'hover:bg-[#8ec5d6]/20'}`}>
                  <Image className="h-7 w-7" />
                </div>
                <span className="text-sm font-bold">さくひんいちらん</span>
              </Link>
            </li>
            <li className="w-full flex justify-center">
              <Link
                to="/child/sel-quest"
                className={`flex flex-col items-center gap-2 w-full ${
                  isActive('/child/sel-quest')
                    ? 'text-[#5d7799] scale-110 transition-transform'
                    : 'text-gray-400 hover:text-[#5d7799] hover:scale-105 transition-all'
                }`}
              >
                <div className={`p-3 rounded-full ${isActive('/child/sel-quest') ? 'bg-[#f7c5c2]/30' : 'hover:bg-[#f7c5c2]/20'}`}>
                  <Heart className="h-7 w-7" />
                </div>
                <span className="text-sm font-bold">きもち</span>
              </Link>
            </li>
          </ul>
        </nav>
      </footer>
    </BaseLayout>
  );
}; 