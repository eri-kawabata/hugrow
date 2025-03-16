import React from 'react';
import { BaseLayout } from '@/components/layouts/BaseLayout';
import { GradientHeader } from '@/components/Common/GradientHeader';

export const SelectQuest = () => {
  return (
    <BaseLayout>
      <div className="min-h-screen bg-gray-50">
        <GradientHeader 
          title="きょうのクエスト" 
          gradientColors={{
            from: '#ffd1d1',
            via: '#ffecd2',
            to: '#fffcb7'
          }}
        />
        
        {/* 既存のコンテンツをここに移動 */}
      </div>
    </BaseLayout>
  );
}; 