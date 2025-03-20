import React from 'react';
import { motion } from 'framer-motion';
import { Star, Trophy, Crown } from 'lucide-react';

type PointsDisplayProps = {
  totalPoints: number;
  level: number;
  badges: string[];
};

export function PointsDisplay({ totalPoints, level, badges }: PointsDisplayProps) {
  // レベルに応じた称号
  const getLevelTitle = (level: number) => {
    if (level >= 10) return 'マスター';
    if (level >= 7) return 'エキスパート';
    if (level >= 4) return 'チャレンジャー';
    return 'ビギナー';
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="bg-gradient-to-r from-yellow-400 to-orange-400 p-3 rounded-2xl"
          >
            <Star className="h-8 w-8 text-white" />
          </motion.div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">
              {totalPoints}ポイント
            </h3>
            <p className="text-gray-600">つぎのレベルまで: {1000 - (totalPoints % 1000)}ポイント</p>
          </div>
        </div>
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="bg-gradient-to-r from-indigo-400 to-purple-400 p-3 rounded-2xl"
        >
          <Crown className="h-8 w-8 text-white" />
        </motion.div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-bold text-gray-700">
              レベル {level} - {getLevelTitle(level)}
            </span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-400 to-pink-400"
              initial={{ width: 0 }}
              animate={{ width: `${(totalPoints % 1000) / 10}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {badges.length > 0 && (
          <div>
            <h4 className="text-lg font-bold text-gray-700 mb-2">
              げっとしたバッジ
            </h4>
            <div className="flex flex-wrap gap-2">
              {badges.map((badge, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.1 }}
                  className="bg-gradient-to-r from-green-400 to-emerald-400 p-2 rounded-xl"
                >
                  <Trophy className="h-6 w-6 text-white" />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 