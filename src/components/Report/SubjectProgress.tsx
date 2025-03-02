import React from 'react';
import type { SubjectProgressType } from '../../lib/types';

type Props = {
  subject: SubjectProgressType;
};

export const SubjectProgress = React.memo(function SubjectProgress({ subject }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 ${subject.color.replace('bg-', 'bg-').replace('600', '100')} rounded-lg`}>
            {subject.icon}
          </div>
          <span className="font-medium text-gray-900">{subject.subject}</span>
        </div>
        <span className="font-medium text-gray-900">{subject.progress}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
        <div
          className={`${subject.color} h-full rounded-full transition-all duration-500 ease-in-out`}
          style={{ width: `${subject.progress}%` }}
        />
      </div>
    </div>
  );
}); 