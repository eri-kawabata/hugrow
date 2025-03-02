import { Menu } from '@headlessui/react';
import { Users, ChevronDown } from 'lucide-react';
import { useParentMode } from '../../hooks/useParentMode';

export function ChildSelector() {
  const { children, selectedChildId, switchChild } = useParentMode();

  const selectedChild = children.find(child => child.id === selectedChildId);

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        <Users className="w-5 h-5" />
        {selectedChild?.username || '子供を選択'}
        <ChevronDown className="w-4 h-4" />
      </Menu.Button>

      <Menu.Items className="absolute right-0 w-56 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
        <div className="py-1">
          {children.map(child => (
            <Menu.Item key={child.id}>
              {({ active }) => (
                <button
                  onClick={() => switchChild(child.id)}
                  className={`${
                    active ? 'bg-gray-100' : ''
                  } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                >
                  {child.username}
                  {child.id === selectedChildId && (
                    <span className="ml-2 text-indigo-600">✓</span>
                  )}
                </button>
              )}
            </Menu.Item>
          ))}
        </div>
      </Menu.Items>
    </Menu>
  );
} 