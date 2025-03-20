import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { GradientHeader } from '@/components/Common/GradientHeader';

export function Earth() {
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
        title="地球のひみつ" 
        gradientColors={{
          from: '#8b4513',
          via: '#deb887',
          to: '#f4a460'
        }}
      />

      <p className="text-lg text-gray-600 text-center mb-8">
        私たちの住む地球について、その特徴や環境を学びましょう
      </p>

      {/* レッスンのコンテンツをここに追加 */}
    </div>
  );
} 