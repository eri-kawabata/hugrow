import React from 'react';
import { motion } from 'framer-motion';
import { GradientHeader } from '@/components/Common/GradientHeader';
import { Cpu, Code, Globe, Smartphone } from 'lucide-react';

export function TechnologyLearning() {
  const lessons = [
    {
      icon: <Cpu className="w-6 h-6 text-blue-600" />,
      title: "コンピュータのしくみ",
      description: "コンピュータのなかをのぞいてみよう",
      isCompleted: false,
      gradientColors: {
        from: '#60a5fa',
        via: '#818cf8',
        to: '#a78bfa'
      }
    },
    {
      icon: <Code className="w-6 h-6 text-purple-600" />,
      title: "プログラミングのきほん",
      description: "かんたんなプログラムをつくってみよう",
      isCompleted: false,
      gradientColors: {
        from: '#a855f7',
        via: '#9333ea',
        to: '#7e22ce'
      }
    },
    {
      icon: <Globe className="w-6 h-6 text-blue-600" />,
      title: "あんぜんなインターネット",
      description: "インターネットをあんぜんにつかおう",
      isCompleted: false,
      gradientColors: {
        from: '#3b82f6',
        via: '#2563eb',
        to: '#1d4ed8'
      }
    },
    {
      icon: <Smartphone className="w-6 h-6 text-purple-600" />,
      title: "スマートデバイス",
      description: "べんりなデバイスのつかいかた",
      isCompleted: false,
      gradientColors: {
        from: '#8b5cf6',
        via: '#7c3aed',
        to: '#6d28d9'
      }
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* 背景の装飾要素 */}
      <div className="absolute inset-0 pointer-events-none">
        {/* デジタルの光の輪 */}
        <div className="absolute w-[900px] h-[900px] -top-[300px] -left-[300px] bg-gradient-to-r from-violet-500/40 via-purple-400/40 to-indigo-400/40 rounded-full blur-3xl animate-slow-spin"></div>
        <div className="absolute w-[700px] h-[700px] -bottom-[200px] -right-[200px] bg-gradient-to-r from-purple-400/40 via-violet-500/40 to-indigo-500/40 rounded-full blur-3xl animate-slow-spin-reverse"></div>
        
        {/* 追加の光の輪 */}
        <div className="absolute w-[600px] h-[600px] top-[30%] right-[20%] bg-gradient-to-r from-violet-400/30 via-purple-500/30 to-indigo-600/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute w-[500px] h-[500px] bottom-[40%] left-[15%] bg-gradient-to-r from-purple-300/30 via-violet-400/30 to-indigo-500/30 rounded-full blur-3xl animate-float-reverse"></div>
        
        {/* デジタル回路 - 増加 */}
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={`circuit-${i}`}
            className="absolute"
            style={{
              width: '3px',
              height: `${Math.random() * 150 + 100}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `${['#60a5fa', '#818cf8', '#a78bfa'][Math.floor(Math.random() * 3)]}50`,
              transformOrigin: 'center',
              transform: `rotate(${Math.floor(Math.random() * 4) * 90}deg)`,
            }}
          >
            <motion.div
              className="absolute right-0 w-3 h-3 rounded-full"
              style={{
                background: `${['#60a5fa', '#818cf8', '#a78bfa'][Math.floor(Math.random() * 3)]}60`,
                boxShadow: `0 0 15px ${['#60a5fa', '#818cf8', '#a78bfa'][Math.floor(Math.random() * 3)]}60`,
              }}
              animate={{
                scale: [1, 2, 1],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: Math.random() * 2 + 1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            {/* 分岐回路 */}
            {Math.random() > 0.5 && (
              <motion.div
                className="absolute right-0 w-2 h-40"
                style={{
                  background: `${['#60a5fa', '#818cf8', '#a78bfa'][Math.floor(Math.random() * 3)]}40`,
                  transform: `rotate(${Math.random() > 0.5 ? 90 : -90}deg)`,
                  transformOrigin: 'top',
                }}
              >
                <motion.div
                  className="absolute bottom-0 w-2 h-2 rounded-full"
                  style={{
                    background: `${['#60a5fa', '#818cf8', '#a78bfa'][Math.floor(Math.random() * 3)]}60`,
                    boxShadow: `0 0 10px ${['#60a5fa', '#818cf8', '#a78bfa'][Math.floor(Math.random() * 3)]}60`,
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
            )}
          </motion.div>
        ))}

        {/* バイナリコード - 増加 */}
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={`binary-${i}`}
            className="absolute text-sm font-mono"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              color: `${['#60a5fa', '#818cf8', '#a78bfa'][Math.floor(Math.random() * 3)]}50`,
              textShadow: `0 0 10px ${['#60a5fa', '#818cf8', '#a78bfa'][Math.floor(Math.random() * 3)]}50`,
            }}
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.2, 1],
              y: [0, -20, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {Math.random() > 0.5 ? '1' : '0'}
          </motion.div>
        ))}

        {/* グリッドライン - 改善 */}
        {[...Array(30)].map((_, i) => (
          <React.Fragment key={`grid-${i}`}>
            <motion.div
              className="absolute h-px w-full"
              style={{
                top: `${i * 3.33}%`,
                background: `linear-gradient(90deg, transparent, ${['#60a5fa', '#818cf8', '#a78bfa'][Math.floor(Math.random() * 3)]}20, transparent)`,
              }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: Math.random() * 4 + 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute w-px h-full"
              style={{
                left: `${i * 3.33}%`,
                background: `linear-gradient(0deg, transparent, ${['#60a5fa', '#818cf8', '#a78bfa'][Math.floor(Math.random() * 3)]}20, transparent)`,
              }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: Math.random() * 4 + 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </React.Fragment>
        ))}

        {/* デジタルパーティクル - 改善 */}
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `${['#60a5fa', '#818cf8', '#a78bfa'][Math.floor(Math.random() * 3)]}60`,
              boxShadow: `0 0 15px ${['#60a5fa', '#818cf8', '#a78bfa'][Math.floor(Math.random() * 3)]}60`,
            }}
            animate={{
              scale: [1, 2, 1],
              opacity: [0.4, 0.8, 0.4],
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* エネルギー波動 */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`wave-${i}`}
            className="absolute w-[200px] h-[200px] rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              border: `2px solid ${['#60a5fa', '#818cf8', '#a78bfa'][Math.floor(Math.random() * 3)]}30`,
            }}
            animate={{
              scale: [0, 4],
              opacity: [0.6, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto pb-28 relative">
      <GradientHeader
        title="ぎじゅつ"
        gradientColors={{
          from: '#8b5cf6',
          via: '#a78bfa',
          to: '#c4b5fd'
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
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                デジタルのせかいをたんけんしよう！
            </span>
          </h2>
            <p className="text-lg text-gray-600">
              コンピュータやインターネットのしくみをまなぼう
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
                            background: `linear-gradient(135deg, ${lesson.gradientColors.from}10, ${lesson.gradientColors.to}10)`
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
            <div className="inline-flex items-center justify-center p-4 bg-blue-50 rounded-full">
              <Cpu className="w-8 h-8 text-blue-600 animate-pulse" />
          </div>
        </motion.div>
        </div>
      </div>
    </div>
  );
} 