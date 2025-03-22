import React from 'react';
import { motion } from 'framer-motion';
import { GlowCard } from '@/components/Common/GlowCard';
import { CheckCircle } from 'lucide-react';

type LessonCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  isCompleted: boolean;
  onClick: () => void;
};

export function LessonCard({ icon, title, description, isCompleted, onClick }: LessonCardProps) {
  return (
    <GlowCard
      onClick={onClick}
      gradientColors={{
        from: isCompleted ? '#22c55e' : '#6366f1',
        via: isCompleted ? '#16a34a' : '#8b5cf6',
        to: isCompleted ? '#15803d' : '#a855f7'
      }}
      className="cursor-pointer"
    >
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-4">
          <motion.div 
            className="p-4 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl"
            whileHover={{ rotate: 12 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {React.cloneElement(icon as React.ReactElement, {
              className: `h-8 w-8 ${isCompleted ? 'text-green-600' : 'text-indigo-600'}`
            })}
          </motion.div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors duration-300">{title}</h3>
            <p className="text-gray-600 mt-1">{description}</p>
          </div>
        </div>
        {isCompleted && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">かんりょう！</span>
          </div>
        )}
      </div>
    </GlowCard>
  );
} 