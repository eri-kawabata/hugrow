import React from 'react';
import { BaseLayout } from '@/components/layouts/BaseLayout';
import { GradientHeader } from '@/components/Common/GradientHeader';

export const Home = () => {
  return (
    <BaseLayout>
      <div className="min-h-screen bg-gray-50">
        <GradientHeader 
          title="ほーむ" 
          gradientColors={{
            from: '#95e1d3',
            via: '#eaafc8',
            to: '#ffd1ff'
          }}
        />
        
        {/* 既存のコンテンツをここに移動 */}
      </div>
    </BaseLayout>
  );
}; 