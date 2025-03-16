import React from 'react';
import { BaseLayout } from '@/components/layouts/BaseLayout';
import { GradientHeader } from '@/components/Common/GradientHeader';

export const NewWork = () => {
  return (
    <BaseLayout>
      <div className="min-h-screen bg-gray-50">
        <GradientHeader 
          title="あたらしいさくひん" 
          gradientColors={{
            from: '#fbc2eb',
            via: '#a6c1ee',
            to: '#b8e7ff'
          }}
        />
        
        {/* 既存のコンテンツをここに移動 */}
      </div>
    </BaseLayout>
  );
}; 