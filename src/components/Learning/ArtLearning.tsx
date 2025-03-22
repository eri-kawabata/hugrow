import React from 'react';
import { motion } from 'framer-motion';
import { GradientHeader } from '@/components/Common/GradientHeader';
import { Palette, Music, Camera, Brush, Theater, ChevronRight } from 'lucide-react';

type LessonCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  isCompleted: boolean;
  onClick: () => void;
};

const LessonCard: React.FC<LessonCardProps> = ({ icon, title, description, isCompleted, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={`
      bg-white rounded-xl p-6 shadow-lg cursor-pointer
      ${isCompleted ? 'border-2 border-pink-400' : 'border border-gray-100'}
    `}
    onClick={onClick}
  >
    <div className="flex items-start space-x-4">
      <div className="flex-shrink-0">
        <motion.div
          className={`
            p-3 rounded-lg
            ${isCompleted ? 'bg-pink-100' : 'bg-rose-50'}
          `}
          whileHover={{ rotate: 5 }}
        >
          {icon}
        </motion.div>
      </div>
      <div className="flex-grow">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <div className="flex-shrink-0">
        <ChevronRight className={`w-5 h-5 ${isCompleted ? 'text-pink-500' : 'text-gray-400'}`} />
      </div>
    </div>
  </motion.div>
);

export function ArtLearning() {
  const lessons = [
    {
      icon: <Brush className="w-6 h-6 text-pink-600" />,
      title: "えをかこう",
      description: "いろんなほうほうでえをかいてみよう",
      isCompleted: false,
    },
    {
      icon: <Music className="w-6 h-6 text-rose-600" />,
      title: "おんがくをつくろう",
      description: "リズムやメロディをつくってみよう",
      isCompleted: false,
    },
    {
      icon: <Camera className="w-6 h-6 text-fuchsia-600" />,
      title: "しゃしんをとろう",
      description: "きれいなしゃしんのとりかたをまなぼう",
      isCompleted: false,
    },
    {
      icon: <Theater className="w-6 h-6 text-pink-600" />,
      title: "げきをつくろう",
      description: "おはなしをつくってえんじてみよう",
      isCompleted: false,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-28">
      <GradientHeader
        title="げいじゅつ"
        gradientColors={{
          from: '#ec4899',
          via: '#f43f5e',
          to: '#e879f9'
        }}
      />

      <div className="px-6 mt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-fuchsia-600">
              そうぞうりょくのせかいへようこそ！
            </span>
          </h2>
          <p className="text-gray-600">
            じぶんのきもちをいろいろなほうほうでひょうげんしよう
          </p>
        </motion.div>

        <div className="grid gap-6">
          {lessons.map((lesson, index) => (
            <motion.div
              key={lesson.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <LessonCard
                {...lesson}
                onClick={() => {
                  // TODO: レッスンページへの遷移処理
                  console.log(`Navigating to lesson: ${lesson.title}`);
                }}
              />
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="inline-flex items-center justify-center p-4 bg-pink-50 rounded-full">
            <Palette className="w-8 h-8 text-pink-600 animate-pulse" />
          </div>
        </motion.div>
      </div>
    </div>
  );
} 