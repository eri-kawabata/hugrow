import React from 'react';
import { motion } from 'framer-motion';
import { GradientHeader } from '@/components/Common/GradientHeader';
import { LearningCard } from '@/components/Learning/LearningCard';
import { Palette, Wrench, Calculator, Microscope, Laptop } from 'lucide-react';

export function LearningPage() {
  const subjects = [
    {
      icon: <Palette className="w-6 h-6" />,
      title: "びじゅつ",
      description: "そうぞうりょくをはばたかせよう",
      href: "/child/learning/art",
      gradientColors: {
        from: '#ec4899',
        via: '#f43f5e',
        to: '#e879f9'
      }
    },
    {
      icon: <Wrench className="w-6 h-6" />,
      title: "こうがく",
      description: "つくることをたのしもう",
      href: "/child/learning/engineering",
      gradientColors: {
        from: '#f97316',
        via: '#fb923c',
        to: '#fdba74'
      }
    },
    {
      icon: <Calculator className="w-6 h-6" />,
      title: "すうがく",
      description: "かずとかたちをまなぼう",
      href: "/child/learning/math",
      gradientColors: {
        from: '#10b981',
        via: '#059669',
        to: '#047857'
      }
    },
    {
      icon: <Microscope className="w-6 h-6" />,
      title: "かがく",
      description: "しぜんのふしぎをさぐろう",
      href: "/child/learning/science",
      gradientColors: {
        from: '#3b82f6',
        via: '#2563eb',
        to: '#1d4ed8'
      }
    },
    {
      icon: <Laptop className="w-6 h-6" />,
      title: "テクノロジー",
      description: "デジタルのせかいをたのしもう",
      href: "/child/learning/technology",
      gradientColors: {
        from: '#6366f1',
        via: '#4f46e5',
        to: '#4338ca'
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* 背景の装飾要素 */}
      <div className="absolute inset-0 pointer-events-none">
        {/* STEAM要素を表現する光の輪 */}
        <div className="absolute w-[900px] h-[900px] -top-[300px] -left-[300px] bg-gradient-to-r from-pink-400/30 via-blue-400/30 to-emerald-400/30 rounded-full blur-3xl animate-slow-spin"></div>
        <div className="absolute w-[700px] h-[700px] -bottom-[200px] -right-[200px] bg-gradient-to-r from-orange-400/30 via-indigo-400/30 to-green-400/30 rounded-full blur-3xl animate-slow-spin-reverse"></div>
        
        {/* 追加の光の輪 */}
        <div className="absolute w-[600px] h-[600px] top-[30%] right-[20%] bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute w-[500px] h-[500px] bottom-[40%] left-[15%] bg-gradient-to-r from-emerald-400/20 via-orange-400/20 to-indigo-400/20 rounded-full blur-3xl animate-float-reverse"></div>

        {/* アート要素 - 筆のストローク */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={`stroke-${i}`}
            className="absolute"
            style={{
              width: `${Math.random() * 200 + 100}px`,
              height: `${Math.random() * 3 + 1}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `${['#ec4899', '#f43f5e', '#e879f9'][Math.floor(Math.random() * 3)]}30`,
              borderRadius: '999px',
              transformOrigin: 'left',
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
            animate={{
              opacity: [0.2, 0.4, 0.2],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* 技術要素 - デジタル回路 */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`circuit-${i}`}
            className="absolute"
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: '2px',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `${['#6366f1', '#4f46e5', '#4338ca'][Math.floor(Math.random() * 3)]}30`,
              transformOrigin: 'left',
              transform: `rotate(${Math.floor(Math.random() * 4) * 90}deg)`,
            }}
            animate={{
              opacity: [0.2, 0.4, 0.2],
              boxShadow: ['0 0 5px #6366f1', '0 0 10px #4f46e5', '0 0 5px #4338ca'],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}

        {/* 工学要素 - 歯車のような形 */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`gear-${i}`}
            className="absolute"
            style={{
              width: `${Math.random() * 40 + 20}px`,
              height: `${Math.random() * 40 + 20}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              border: `2px solid ${['#f97316', '#fb923c', '#fdba74'][Math.floor(Math.random() * 3)]}30`,
              borderRadius: '50%',
              background: 'transparent',
            }}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <div className="absolute inset-0 border-2 border-orange-400/30 rounded-full transform rotate-45"></div>
          </motion.div>
        ))}

        {/* 科学要素 - 分子構造のような形 */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={`molecule-${i}`}
            className="absolute"
            style={{
              width: `${Math.random() * 30 + 15}px`,
              height: `${Math.random() * 30 + 15}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `${['#3b82f6', '#2563eb', '#1d4ed8'][Math.floor(Math.random() * 3)]}20`,
              borderRadius: '50%',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <motion.div
              className="absolute w-20 h-0.5 bg-blue-400/20 origin-left"
              style={{ transform: `rotate(${Math.random() * 360}deg)` }}
            />
          </motion.div>
        ))}

        {/* 数学要素 - 数式や記号 */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`math-${i}`}
            className="absolute text-xl font-bold"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              color: `${['#10b981', '#059669', '#047857'][Math.floor(Math.random() * 3)]}30`,
            }}
            animate={{
              y: [0, -20],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {['+', '-', '×', '÷', '=', 'π', '∑', '∫'][Math.floor(Math.random() * 8)]}
          </motion.div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto pb-28 relative">
        <GradientHeader
          title="がくしゅう"
          gradientColors={{
            from: '#6366f1',
            via: '#8b5cf6',
            to: '#d946ef'
          }}
        />

        <div className="px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                たのしくまなぼう！
              </span>
            </h2>
            <p className="text-lg text-gray-600">
              すきなものからはじめてみよう
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {subjects.map((subject, index) => (
              <LearningCard
                key={subject.title}
                icon={subject.icon}
                title={subject.title}
                description={subject.description}
                href={subject.href}
                gradientColors={subject.gradientColors}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 