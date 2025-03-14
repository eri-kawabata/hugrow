import { Menu } from '@headlessui/react';
import { Users, ChevronDown, UserPlus } from 'lucide-react';
import { useParentMode } from '../../hooks/useParentMode';
import { Link } from 'react-router-dom';

export function ChildSelector() {
  const { children, selectedChildId, switchChild } = useParentMode();

  const selectedChild = children.find(child => child.id === selectedChildId);

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        {selectedChild?.avatar_url ? (
          <img 
            src={selectedChild.avatar_url} 
            alt={selectedChild.username} 
            className="w-6 h-6 rounded-full object-cover"
          />
        ) : (
          <Users className="w-5 h-5" />
        )}
        {selectedChild?.username || '子供を選択'}
        <ChevronDown className="w-4 h-4" />
      </Menu.Button>

      <Menu.Items className="absolute right-0 w-64 mt-2 origin-top-right bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden z-50">
        <div className="py-2">
          <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-100">
            お子様を選択
          </div>
          {children.map(child => (
            <Menu.Item key={child.id}>
              {({ active }) => (
                <button
                  onClick={() => switchChild(child.id)}
                  className={`${
                    active ? 'bg-indigo-50' : ''
                  } flex items-center w-full px-4 py-3 text-sm ${
                    child.id === selectedChildId ? 'text-indigo-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center overflow-hidden ${
                      child.id === selectedChildId ? 'ring-2 ring-indigo-300' : ''
                    }`}>
                      {child.avatar_url ? (
                        <img 
                          src={child.avatar_url} 
                          alt={child.username} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-indigo-100 flex items-center justify-center">
                          <Users className="h-4 w-4 text-indigo-600" />
                        </div>
                      )}
                    </div>
                    <span>{child.username}</span>
                    {child.id === selectedChildId && (
                      <span className="ml-auto text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">選択中</span>
                    )}
                  </div>
                </button>
              )}
            </Menu.Item>
          ))}
          <div className="border-t border-gray-100 mt-1 pt-1">
            <Link 
              to="/parent/profile" 
              className="flex items-center gap-2 px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              <span>子供を追加</span>
            </Link>
          </div>
        </div>
      </Menu.Items>
    </Menu>
  );
} 