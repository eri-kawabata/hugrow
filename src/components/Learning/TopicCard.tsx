import React from 'react';
import { motion } from 'framer-motion';
import { GlowCard } from '@/components/Common/GlowCard';
import { Star, Clock } from 'lucide-react';

type TopicCardProps = {
  title: string;
  description: string;
  difficulty: 1 | 2 | 3;
  estimatedTime: string;
  thumbnailUrl?: string;
  onClick: () => void;
};

export function TopicCard({
  title,
  description,
  difficulty,
  estimatedTime,
  thumbnailUrl,
  onClick
}: TopicCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <GlowCard
        onClick={onClick}
        gradientColors={{
          from: '#3b82f6',
          via: '#6366f1',
          to: '#8b5cf6'
        }}
        className="cursor-pointer"
      >
        <div className="relative">
          {thumbnailUrl && (
            <div className="relative h-40 rounded-t-xl overflow-hidden">
              <img
                src={thumbnailUrl}
                alt={title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          )}
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
              <p className="text-white/80">{description}</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-white/80">
                <Star className="h-5 w-5" />
                <span>むずかしさ: {Array(difficulty).fill('★').join('')}</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Clock className="h-5 w-5" />
                <span>{estimatedTime}</span>
              </div>
            </div>
          </div>
        </div>
      </GlowCard>
    </motion.div>
  );
} 