import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { GradientHeader } from '@/components/Common/GradientHeader';

export function Weather() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-28 px-6">
      <Link
        to="/child/learning/science"
        className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        もどる
      </Link>

      <GradientHeader 
        title="天気のしくみ" 
        gradientColors={{
          from: '#87ceeb',
          via: '#b0e0e6',
          to: '#f0f8ff'
        }}
      />

      <p className="text-lg text-gray-600 text-center mb-8">
        雨や雪、雲ができるしくみについて学びましょう
      </p>

      {/* レッスンのコンテンツをここに追加 */}
    </div>
  );
} 