import React from 'react';
import { BaseLayout } from '@/components/layouts/BaseLayout';
import { GradientHeader } from '@/components/Common/GradientHeader';

export const Learning = () => {
  return (
    <BaseLayout>
      <div className="min-h-screen bg-gray-50">
        <GradientHeader 
          title="がくしゅう" 
          gradientColors={{
            from: '#a8e6cf',
            via: '#dcedc1',
            to: '#ffd3b6'
          }}
        />
        
        {/* 既存のコンテンツをここに移動 */}
      </div>
    </BaseLayout>
  );
}; 