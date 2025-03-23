import React from 'react';
import { motion } from 'framer-motion';
import { GradientHeader } from '@/components/Common/GradientHeader';
import { Atom, Leaf, Cloud, Zap } from 'lucide-react';

export function ScienceLearning() {
  const lessons = [
    {
      icon: <Atom className="w-6 h-6 text-green-600" />,
      title: "いきものかんさつ",
      description: "いきものたちのふしぎをしらべよう",
      isCompleted: false,
      gradientColors: {
        from: '#4ade80',
        via: '#60a5fa',
        to: '#818cf8'
      }
    },
    {
      icon: <Leaf className="w-6 h-6 text-emerald-600" />,
      title: "しょくぶつのせいちょう",
      description: "たねからめがでるしくみをしろう",
      isCompleted: false,
      gradientColors: {
        from: '#22c55e',
        via: '#16a34a',
        to: '#15803d'
      }
    },
    {
      icon: <Cloud className="w-6 h-6 text-sky-600" />,
      title: "てんきのへんか",
      description: "あめやゆきのひみつをしろう",
      isCompleted: false,
      gradientColors: {
        from: '#0ea5e9',
        via: '#0284c7',
        to: '#0369a1'
      }
    },
    {
      icon: <Zap className="w-6 h-6 text-yellow-600" />,
      title: "でんきのしくみ",
      description: "でんきのふしぎなせかい",
      isCompleted: false,
      gradientColors: {
        from: '#facc15',
        via: '#eab308',
        to: '#ca8a04'
      }
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* 背景の装飾要素 */}
      <div className="absolute inset-0 pointer-events-none">
        {/* サイエンスの光の輪 */}
        <div className="absolute w-[900px] h-[900px] -top-[300px] -left-[300px] bg-gradient-to-r from-blue-500/40 via-sky-400/40 to-blue-300/40 rounded-full blur-3xl animate-slow-spin"></div>
        <div className="absolute w-[700px] h-[700px] -bottom-[200px] -right-[200px] bg-gradient-to-r from-sky-400/40 via-blue-500/40 to-indigo-400/40 rounded-full blur-3xl animate-slow-spin-reverse"></div>
        
        {/* 追加の光の輪 */}
        <div className="absolute w-[600px] h-[600px] top-[30%] right-[20%] bg-gradient-to-r from-blue-400/30 via-sky-500/30 to-blue-600/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute w-[500px] h-[500px] bottom-[40%] left-[15%] bg-gradient-to-r from-sky-300/30 via-blue-400/30 to-indigo-500/30 rounded-full blur-3xl animate-float-reverse"></div>

        {/* 分子構造 */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`molecule-${i}`}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          >
            <motion.div
              className="w-3 h-3 rounded-full"
              style={{
                background: `${['#4ade80', '#60a5fa', '#818cf8'][Math.floor(Math.random() * 3)]}60`,
                boxShadow: `0 0 15px ${['#4ade80', '#60a5fa', '#818cf8'][Math.floor(Math.random() * 3)]}60`,
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: Math.random() * 2 + 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            {/* 分子結合 */}
            {[...Array(3)].map((_, j) => (
              <motion.div
                key={`bond-${j}`}
                className="absolute left-1/2 top-1/2 w-16 h-0.5"
                style={{
                  background: `${['#4ade80', '#60a5fa', '#818cf8'][Math.floor(Math.random() * 3)]}40`,
                  transform: `rotate(${j * 120}deg)`,
                  transformOrigin: 'left',
                }}
              >
                <motion.div
                  className="absolute right-0 w-3 h-3 rounded-full"
                  style={{
                    background: `${['#4ade80', '#60a5fa', '#818cf8'][Math.floor(Math.random() * 3)]}60`,
                    boxShadow: `0 0 15px ${['#4ade80', '#60a5fa', '#818cf8'][Math.floor(Math.random() * 3)]}60`,
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.4, 0.8, 0.4],
                  }}
                  transition={{
                    duration: Math.random() * 2 + 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: j * 0.2,
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        ))}

        {/* DNA螺旋 */}
        {[...Array(2)].map((_, i) => (
          <motion.div
            key={`dna-${i}`}
            className="absolute"
            style={{
              width: '2px',
              height: '300px',
              left: `${30 + i * 40}%`,
              top: `${Math.random() * 50}%`,
              background: `${['#4ade80', '#60a5fa', '#818cf8'][Math.floor(Math.random() * 3)]}40`,
              transformOrigin: 'center',
            }}
            animate={{
              rotateX: [0, 360],
              rotateY: [0, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {[...Array(10)].map((_, j) => (
              <React.Fragment key={`base-${j}`}>
                <motion.div
                  className="absolute w-8 h-0.5"
                  style={{
                    top: `${j * 10}%`,
                    background: `${['#4ade80', '#60a5fa', '#818cf8'][Math.floor(Math.random() * 3)]}40`,
                    transform: `rotate(${j * 36}deg)`,
                    transformOrigin: 'left',
                  }}
                >
                  <motion.div
                    className="absolute right-0 w-2 h-2 rounded-full"
                    style={{
                      background: `${['#4ade80', '#60a5fa', '#818cf8'][Math.floor(Math.random() * 3)]}60`,
                      boxShadow: `0 0 10px ${['#4ade80', '#60a5fa', '#818cf8'][Math.floor(Math.random() * 3)]}60`,
                    }}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 0.7, 0.3],
                    }}
                    transition={{
                      duration: Math.random() * 2 + 1,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </motion.div>
              </React.Fragment>
            ))}
          </motion.div>
        ))}

        {/* 気象効果 */}
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={`weather-${i}`}
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `${['#0ea5e9', '#22c55e', '#eab308'][Math.floor(Math.random() * 3)]}40`,
              boxShadow: `0 0 10px ${['#0ea5e9', '#22c55e', '#eab308'][Math.floor(Math.random() * 3)]}40`,
            }}
            animate={{
              y: [0, -100],
              x: [0, Math.random() * 50 - 25],
              opacity: [0.4, 0],
              scale: [1, 0.5],
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              ease: "easeOut",
              delay: Math.random() * 2,
            }}
          />
        ))}

        {/* 電気効果 */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`lightning-${i}`}
            className="absolute"
            style={{
              width: '2px',
              height: `${Math.random() * 100 + 50}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `${['#facc15', '#eab308', '#ca8a04'][Math.floor(Math.random() * 3)]}50`,
              transformOrigin: 'center',
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [1, 1.2, 1],
              rotate: [0, Math.random() * 20 - 10],
            }}
            transition={{
              duration: Math.random() * 1 + 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {[...Array(3)].map((_, j) => (
              <motion.div
                key={`branch-${j}`}
                className="absolute w-8 h-0.5"
                style={{
                  top: `${Math.random() * 100}%`,
                  background: `${['#facc15', '#eab308', '#ca8a04'][Math.floor(Math.random() * 3)]}50`,
                  transform: `rotate(${Math.random() * 180 - 90}deg)`,
                  transformOrigin: 'left',
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scaleX: [1, 1.2, 1],
                }}
                transition={{
                  duration: Math.random() * 1 + 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: j * 0.1,
                }}
              />
            ))}
          </motion.div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto pb-28 relative">
      <GradientHeader
        title="りか"
        gradientColors={{
          from: '#3b82f6',
          via: '#60a5fa',
          to: '#93c5fd'
        }}
      />

        <div className="px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto px-4">
          {lessons.map((lesson, index) => (
            <motion.div
              key={lesson.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
                <div className="relative group block">
                  <div className="absolute -inset-0.5 bg-gradient-to-r rounded-[20px] opacity-30 group-hover:opacity-50 blur transition duration-500"
                    style={{
                      backgroundImage: `linear-gradient(to right, ${lesson.gradientColors.from}, ${lesson.gradientColors.via}, ${lesson.gradientColors.to})`
                    }}
                  ></div>
                  <motion.div
                    whileHover={{ 
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                    className="relative block bg-gradient-to-br from-white to-white/20 rounded-[16px] shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2"
                    style={{
                      borderColor: lesson.gradientColors.from
                    }}
                  >
                    <div className="absolute inset-0 bg-white/90 transition-opacity group-hover:opacity-95"></div>
                    <div className="relative p-4">
                      <div className="flex flex-col items-center text-center">
                        <motion.div
                          whileHover={{ 
                            scale: 1.1,
                            rotate: [0, -5, 5, 0],
                            transition: { duration: 0.3 }
                          }}
                          className="p-3 rounded-lg mb-3 relative overflow-hidden group-hover:shadow-lg transition-all duration-300"
                          style={{
                            background: `linear-gradient(135deg, ${lesson.gradientColors.from}10, ${lesson.gradientColors.to}10)`
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 group-hover:translate-x-full transition-all duration-1000"></div>
                          {React.cloneElement(lesson.icon, {
                            className: `h-10 w-10 transform transition-transform group-hover:scale-110 duration-300`,
                            style: { color: lesson.gradientColors.from }
                          })}
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <h3 className="text-lg font-bold mb-1"
                            style={{
                              background: `linear-gradient(to right, ${lesson.gradientColors.from}, ${lesson.gradientColors.to})`,
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent'
                            }}
                          >{lesson.title}</h3>
                          <p className="text-gray-600 text-sm">{lesson.description}</p>
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
            <div className="inline-flex items-center justify-center p-4 bg-green-50 rounded-full">
              <Atom className="w-8 h-8 text-green-600 animate-pulse" />
          </div>
        </motion.div>
      </div>
      </div>

      <style jsx global>{`
        @keyframes slow-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes slow-spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-20px, -20px); }
        }
        
        @keyframes float-reverse {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -20px); }
        }
        
        .animate-slow-spin {
          animation: slow-spin 20s linear infinite;
        }
        
        .animate-slow-spin-reverse {
          animation: slow-spin-reverse 25s linear infinite;
        }
        
        .animate-float {
          animation: float 15s ease-in-out infinite;
        }
        
        .animate-float-reverse {
          animation: float-reverse 18s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}