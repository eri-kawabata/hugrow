import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { GradientHeader } from '@/components/Common/GradientHeader';

export function Matter() {
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
        title="物質のせかい" 
        gradientColors={{
          from: '#9370db',
          via: '#ba55d3',
          to: '#da70d6'
        }}
      />

      <p className="text-lg text-gray-600 text-center mb-8">
        身の回りの物質の性質や変化について学びましょう
      </p>

      {/* レッスンのコンテンツをここに追加 */}
    </div>
  );
} 