import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, ChevronRight, X, Heart, Bell } from 'lucide-react';

export interface ParentFeedbackNotificationProps {
  parentName: string;
  messageCount: number;
}

export const ParentFeedbackNotification: React.FC<ParentFeedbackNotificationProps> = ({
  parentName,
  messageCount
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  
  const handleClose = () => {
    setIsOpen(false);
  };
  
  const handleClick = () => {
    navigate('/child/works');
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="relative mx-6 mb-8"
        >
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 rounded-2xl blur-md"
            animate={{ 
              opacity: [0.4, 0.7, 0.4],
              scale: [0.98, 1.01, 0.98],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          
          <motion.div
            className="relative overflow-hidden bg-white rounded-2xl p-5 shadow-lg border border-indigo-100 hover:shadow-xl transition-shadow duration-300"
            whileHover={{ scale: 1.01 }}
          >
            {/* 波紋のアニメーション */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-indigo-400/5 via-purple-400/5 to-pink-400/5"
                  initial={{ width: 0, height: 0 }}
                  animate={{ 
                    width: ['0%', '200%'], 
                    height: ['0%', '200%'],
                    opacity: [0.8, 0]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    delay: i * 1.5,
                    ease: "easeOut"
                  }}
                />
              ))}
            </div>
            
            {/* 背景のキラキラエフェクト */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-indigo-300/30 rounded-full"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    scale: [0, 1.5, 0],
                    opacity: [0, 0.8, 0],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>
            
            {/* 赤い未読マーカー */}
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-pink-500 via-purple-500 to-indigo-500 rounded-l-2xl" />
            
            {/* メインコンテンツ */}
            <div className="flex items-center">
              {/* アイコンの円 */}
              <div className="relative mr-4 flex-shrink-0">
                <motion.div
                  className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-indigo-200/50 via-purple-200/50 to-pink-200/50 blur-[2px]"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7],
                    rotate: [0, 360]
                  }}
                  transition={{ 
                    duration: 8, 
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                <motion.div 
                  className="relative bg-gradient-to-br from-indigo-500 to-purple-500 w-12 h-12 rounded-full flex items-center justify-center shadow-md"
                  animate={{ 
                    scale: [1, 1.08, 1],
                    boxShadow: [
                      '0 4px 12px rgba(79, 70, 229, 0.3)',
                      '0 8px 20px rgba(79, 70, 229, 0.5)',
                      '0 4px 12px rgba(79, 70, 229, 0.3)'
                    ]
                  }}
                  transition={{ 
                    duration: 2.5, 
                    repeat: Infinity,
                    repeatType: "mirror"
                  }}
                >
                  <motion.div
                    animate={{ rotate: [0, 15, 0, -15, 0] }}
                    transition={{ duration: 5, repeat: Infinity }}
                  >
                    <Bell className="h-6 w-6 text-white" />
                  </motion.div>
                  
                  {/* メッセージカウントバッジ */}
                  <motion.div
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border border-white"
                    animate={{ 
                      scale: [1, 1.3, 1],
                      boxShadow: [
                        '0 0 0 0 rgba(239, 68, 68, 0.4)',
                        '0 0 0 6px rgba(239, 68, 68, 0)',
                        '0 0 0 0 rgba(239, 68, 68, 0)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {messageCount}
                  </motion.div>
                </motion.div>
              </div>
              
              {/* テキストコンテンツ */}
              <div className="flex-grow">
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">
                    新しいメッセージがあります
                  </h3>
                  <p className="text-gray-600">
                    <span className="font-medium text-indigo-600">{parentName}</span>
                    <span className="text-gray-500">さんから</span>
                    <span className="font-bold text-pink-500 ml-1">{messageCount}件</span>
                    <span className="text-gray-500 ml-1">のメッセージが届いています</span>
                  </p>
                </motion.div>
              </div>
              
              {/* アクションボタン */}
              <div className="flex items-center ml-4 gap-3">
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: '#4f46e5' }}
                  whileTap={{ scale: 0.95 }}
                  className="py-2 px-4 bg-indigo-600 text-white rounded-full flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 text-sm font-medium"
                  onClick={handleClick}
                >
                  <span>見る</span>
                  <motion.div
                    animate={{ x: [0, 3, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </motion.div>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1, backgroundColor: '#f1f5f9' }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleClose}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>
            </div>
            
            {/* 装飾的な模様 */}
            <div className="absolute bottom-0 right-0 w-32 h-32 opacity-[0.03] pointer-events-none">
              <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 0H0V100C55.2285 100 100 55.2285 100 0Z" fill="url(#paint0_linear)" />
                <defs>
                  <linearGradient id="paint0_linear" x1="50" y1="0" x2="50" y2="100" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#4F46E5" />
                    <stop offset="1" stopColor="#E879F9" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 