import React from 'react';
import { motion } from 'framer-motion';
import { GradientHeader } from '@/components/Common/GradientHeader';
import { Wrench, Settings, Cog, Hammer, Ruler, ChevronRight } from 'lucide-react';

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
      ${isCompleted ? 'border-2 border-orange-400' : 'border border-gray-100'}
    `}
    onClick={onClick}
  >
    <div className="flex items-start space-x-4">
      <div className="flex-shrink-0">
        <motion.div
          className={`
            p-3 rounded-lg
            ${isCompleted ? 'bg-orange-100' : 'bg-yellow-100'}
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
        <ChevronRight className={`w-5 h-5 ${isCompleted ? 'text-orange-500' : 'text-gray-400'}`} />
      </div>
    </div>
  </motion.div>
);

export function EngineeringLearning() {
  const lessons = [
    {
      icon: <Wrench className="w-6 h-6 text-orange-600" />,
      title: "どうぐのつかいかた",
      description: "いろいろなどうぐのあんぜんなつかいかたをまなぼう",
      isCompleted: false,
    },
    {
      icon: <Settings className="w-6 h-6 text-yellow-600" />,
      title: "きかいのしくみ",
      description: "かんたんなきかいのしくみをしらべてみよう",
      isCompleted: false,
    },
    {
      icon: <Hammer className="w-6 h-6 text-amber-600" />,
      title: "ものづくりのきそ",
      description: "じぶんでかんたんなものをつくってみよう",
      isCompleted: false,
    },
    {
      icon: <Ruler className="w-6 h-6 text-orange-600" />,
      title: "せっけい入門",
      description: "アイデアをかたちにするほうほうをまなぼう",
      isCompleted: false,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-28">
      <GradientHeader
        title="こうがく"
        gradientColors={{
          from: '#f97316',
          via: '#fbbf24',
          to: '#facc15'
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
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-yellow-600">
              ものづくりのせかいをたんけんしよう！
            </span>
          </h2>
          <p className="text-gray-600">
            どうぐやきかいをつかって、たのしくものづくりをしよう
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
          <div className="inline-flex items-center justify-center p-4 bg-yellow-50 rounded-full">
            <Wrench className="w-8 h-8 text-orange-600 animate-pulse" />
          </div>
        </motion.div>
      </div>
    </div>
  );
} 