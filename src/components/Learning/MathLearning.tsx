import React from 'react';
import { motion } from 'framer-motion';
import { GradientHeader } from '@/components/Common/GradientHeader';
import { Calculator, Plus, Shapes, Clock, Scale, ChevronRight } from 'lucide-react';

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
      ${isCompleted ? 'border-2 border-emerald-400' : 'border border-gray-100'}
    `}
    onClick={onClick}
  >
    <div className="flex items-start space-x-4">
      <div className="flex-shrink-0">
        <motion.div
          className={`
            p-3 rounded-lg
            ${isCompleted ? 'bg-emerald-100' : 'bg-teal-50'}
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
        <ChevronRight className={`w-5 h-5 ${isCompleted ? 'text-emerald-500' : 'text-gray-400'}`} />
      </div>
    </div>
  </motion.div>
);

export function MathLearning() {
  const lessons = [
    {
      icon: <Plus className="w-6 h-6 text-emerald-600" />,
      title: "たしざんとひきざん",
      description: "かずをたしたりひいたりしてみよう",
      isCompleted: false,
    },
    {
      icon: <Shapes className="w-6 h-6 text-teal-600" />,
      title: "ずけいのなまえ",
      description: "いろいろなかたちのなまえをおぼえよう",
      isCompleted: false,
    },
    {
      icon: <Clock className="w-6 h-6 text-green-600" />,
      title: "とけいのよみかた",
      description: "じかんのよみかたをれんしゅうしよう",
      isCompleted: false,
    },
    {
      icon: <Scale className="w-6 h-6 text-emerald-600" />,
      title: "おおきさくらべ",
      description: "ながさやおもさをくらべてみよう",
      isCompleted: false,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-28">
      <GradientHeader
        title="すうがく"
        gradientColors={{
          from: '#10b981',
          via: '#14b8a6',
          to: '#34d399'
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
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
              かずとかたちのせかいへようこそ！
            </span>
          </h2>
          <p className="text-gray-600">
            たのしくかずをかぞえて、かたちをみつけよう
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
          <div className="inline-flex items-center justify-center p-4 bg-emerald-50 rounded-full">
            <Calculator className="w-8 h-8 text-emerald-600 animate-pulse" />
          </div>
        </motion.div>
      </div>
    </div>
  );
} 