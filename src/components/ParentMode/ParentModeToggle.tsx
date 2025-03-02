import { Switch } from '@headlessui/react';
import { Shield } from 'lucide-react';
import { useParentMode } from '../../hooks/useParentMode';

export function ParentModeToggle() {
  const { isParentMode, toggleParentMode } = useParentMode();

  return (
    <Switch.Group>
      <div className="flex items-center">
        <Shield className={`w-5 h-5 ${isParentMode ? 'text-indigo-600' : 'text-gray-400'}`} />
        <Switch.Label className="ml-2 mr-4 text-sm text-gray-700">
          保護者モード
        </Switch.Label>
        <Switch
          checked={isParentMode}
          onChange={toggleParentMode}
          className={`${
            isParentMode ? 'bg-indigo-600' : 'bg-gray-200'
          } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
        >
          <span
            className={`${
              isParentMode ? 'translate-x-6' : 'translate-x-1'
            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
          />
        </Switch>
      </div>
    </Switch.Group>
  );
} 