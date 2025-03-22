import React from 'react';
import { motion } from 'framer-motion';
import { GradientHeader } from '@/components/Common/GradientHeader';
import { Calculator, FunctionSquare, Circle, Square } from 'lucide-react';

export function MathLearning() {
  const lessons = [
    {
      icon: <Calculator className="w-6 h-6 text-emerald-600" />,
      title: "すうじとけいさん",
      description: "たしざんひきざんをまなぼう",
      isCompleted: false,
      gradientColors: {
        from: '#10b981',
        via: '#059669',
        to: '#047857'
      }
    },
    {
      icon: <FunctionSquare className="w-6 h-6 text-teal-600" />,
      title: "かたちとすうじ",
      description: "いろいろなかたちをしろう",
      isCompleted: false,
      gradientColors: {
        from: '#14b8a6',
        via: '#0d9488',
        to: '#0f766e'
      }
    },
    {
      icon: <Circle className="w-6 h-6 text-green-600" />,
      title: "かずとりズム",
      description: "パターンを見つけよう",
      isCompleted: false,
      gradientColors: {
        from: '#22c55e',
        via: '#16a34a',
        to: '#15803d'
      }
    },
    {
      icon: <Square className="w-6 h-6 text-emerald-600" />,
      title: "もんだいかいけつ",
      description: "すうがくパズルにちょうせん",
      isCompleted: false,
      gradientColors: {
        from: '#34d399',
        via: '#2dd4bf',
        to: '#14b8a6'
      }
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* 背景の装飾要素 */}
      <div className="absolute inset-0 pointer-events-none">
        {/* 数学の光の輪 */}
        <div className="absolute w-[900px] h-[900px] -top-[300px] -left-[300px] bg-gradient-to-r from-emerald-400/50 via-teal-400/50 to-green-400/50 rounded-full blur-3xl animate-slow-spin"></div>
        <div className="absolute w-[700px] h-[700px] -bottom-[200px] -right-[200px] bg-gradient-to-r from-green-400/50 via-emerald-400/50 to-teal-400/50 rounded-full blur-3xl animate-slow-spin-reverse"></div>
        
        {/* 追加の光の輪 */}
        <div className="absolute w-[600px] h-[600px] top-[30%] right-[20%] bg-gradient-to-r from-teal-400/40 via-emerald-400/40 to-green-400/40 rounded-full blur-3xl animate-float"></div>
        <div className="absolute w-[500px] h-[500px] bottom-[40%] left-[15%] bg-gradient-to-r from-green-400/40 via-teal-400/40 to-emerald-400/40 rounded-full blur-3xl animate-float-reverse"></div>

        {/* 数式のパターン */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`pattern-${i}`}
            className="absolute"
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              border: `2px solid ${['#10b981', '#14b8a6', '#22c55e'][Math.floor(Math.random() * 3)]}40`,
              borderRadius: Math.random() > 0.5 ? '0%' : '50%',
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}

        {/* 数字のパーティクル */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={`number-${i}`}
            className="absolute text-xl font-bold"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              color: `${['#10b981', '#14b8a6', '#22c55e'][Math.floor(Math.random() * 3)]}90`,
            }}
            animate={{
              y: [0, -50],
              x: [0, Math.random() * 50 - 25],
              rotate: [0, Math.random() * 360],
              opacity: [0.6, 0.2, 0.6],
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {['+', '-', '×', '÷', '=', '1', '2', '3', '4', '5'][Math.floor(Math.random() * 10)]}
          </motion.div>
        ))}

        {/* 幾何学模様 */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`geometry-${i}`}
            className="absolute"
            style={{
              width: `${Math.random() * 40 + 20}px`,
              height: `${Math.random() * 40 + 20}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              border: `2px solid ${['#14b8a6', '#0d9488', '#0f766e'][Math.floor(Math.random() * 3)]}40`,
              borderRadius: Math.random() > 0.5 ? '0%' : '50%',
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}

        {/* 計算記号のアニメーション */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`symbol-${i}`}
            className="absolute text-2xl font-bold"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              color: `${['#10b981', '#14b8a6', '#22c55e'][Math.floor(Math.random() * 3)]}70`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {['+', '-', '×', '÷', '='][Math.floor(Math.random() * 5)]}
          </motion.div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto pb-28 relative">
        <GradientHeader
          title="すうがく"
          gradientColors={{
            from: '#10b981',
            via: '#14b8a6',
            to: '#34d399'
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
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
                すうがくのせかいをたのしもう！
              </span>
            </h2>
            <p className="text-lg text-gray-600">
              かずとかたちでかんがえるちからをつけよう
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {lessons.map((lesson, index) => (
              <motion.div
                key={lesson.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="relative group block">
                  <div className="absolute -inset-0.5 bg-gradient-to-r rounded-[28px] opacity-30 group-hover:opacity-50 blur transition duration-500"
                    style={{
                      backgroundImage: `linear-gradient(to right, ${lesson.gradientColors.from}, ${lesson.gradientColors.via}, ${lesson.gradientColors.to})`
                    }}
                  ></div>
                  <motion.div
                    whileHover={{ 
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                    className="relative block bg-gradient-to-br from-white to-white/20 rounded-[24px] shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2"
                    style={{
                      borderColor: lesson.gradientColors.from
                    }}
                  >
                    <div className="absolute inset-0 bg-white/90 transition-opacity group-hover:opacity-95"></div>
                    <div className="relative p-8">
                      <div className="flex flex-col items-center text-center">
                        <motion.div
                          whileHover={{ 
                            scale: 1.1,
                            rotate: [0, -5, 5, 0],
                            transition: { duration: 0.3 }
                          }}
                          className="p-6 rounded-2xl mb-6 relative overflow-hidden group-hover:shadow-lg transition-all duration-300"
                          style={{
                            background: `linear-gradient(135deg, ${lesson.gradientColors.from}20, ${lesson.gradientColors.to}20)`
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 group-hover:translate-x-full transition-all duration-1000"></div>
                          {React.cloneElement(lesson.icon, {
                            className: `h-16 w-16 transform transition-transform group-hover:scale-110 duration-300`,
                            style: { color: lesson.gradientColors.from }
                          })}
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <h3 className="text-2xl font-bold mb-3"
                            style={{
                              background: `linear-gradient(to right, ${lesson.gradientColors.from}, ${lesson.gradientColors.to})`,
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent'
                            }}
                          >{lesson.title}</h3>
                          <p className="text-gray-600 text-lg">{lesson.description}</p>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </div>
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
    </div>
  );
} 