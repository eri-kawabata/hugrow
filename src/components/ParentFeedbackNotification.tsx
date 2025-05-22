import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

// 親からのメッセージ通知コンポーネント
export const ParentFeedbackNotification: React.FC<{
  parentName: string;
  messageCount: number;
}> = ({ parentName, messageCount }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.4 }}
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
    className="mx-6 mb-8 mt-2"
  >
    <Link
      to="/child/works"
      className="relative block overflow-hidden"
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-[#60a5fa] via-[#e879f9] to-[#fcd34d] rounded-2xl opacity-70 blur-sm"></div>
      <div className="relative flex items-center justify-between bg-white rounded-xl p-4 shadow-md border border-indigo-100">
        <div className="flex items-center gap-3">
          <div className="relative p-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full">
            <MessageCircle className="h-6 w-6 text-indigo-600" />
            {messageCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">{messageCount}</span>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-800">
              <span className="text-indigo-600">{parentName}</span>さんからメッセージがとどいています！
            </p>
            <p className="text-sm text-gray-500">
              {messageCount}つのフィードバックをみてみよう
            </p>
          </div>
        </div>
        <div className="text-indigo-500 hover:text-indigo-700">
          <ArrowRight className="h-5 w-5" />
        </div>
      </div>
    </Link>
  </motion.div>
); 