import React from 'react';
import { motion } from 'framer-motion';
import { GradientHeader } from '@/components/Common/GradientHeader';
import { Palette, Brush, Shapes, Music } from 'lucide-react';

export function ArtLearning() {
  const lessons = [
    {
      icon: <Palette className="w-6 h-6 text-pink-600" />,
      title: "いろとかたち",
      description: "いろんないろやかたちをまなぼう",
      isCompleted: false,
      gradientColors: {
        from: '#ec4899',
        via: '#f43f5e',
        to: '#e879f9'
      }
    },
    {
      icon: <Brush className="w-6 h-6 text-rose-600" />,
      title: "えをかこう",
      description: "じぶんだけのえをつくろう",
      isCompleted: false,
      gradientColors: {
        from: '#f43f5e',
        via: '#fb7185',
        to: '#fda4af'
      }
    },
    {
      icon: <Shapes className="w-6 h-6 text-fuchsia-600" />,
      title: "てづくりこうさく",
      description: "かみやねんどでつくってみよう",
      isCompleted: false,
      gradientColors: {
        from: '#e879f9',
        via: '#d946ef',
        to: '#c026d3'
      }
    },
    {
      icon: <Music className="w-6 h-6 text-purple-600" />,
      title: "おとのせかい",
      description: "たのしいリズムをつくろう",
      isCompleted: false,
      gradientColors: {
        from: '#c084fc',
        via: '#a855f7',
        to: '#9333ea'
      }
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* 背景の装飾要素 */}
      <div className="absolute inset-0 pointer-events-none">
        {/* アートの光の輪 */}
        <div className="absolute w-[900px] h-[900px] -top-[300px] -left-[300px] bg-gradient-to-r from-pink-400/50 via-rose-400/50 to-fuchsia-400/50 rounded-full blur-3xl animate-slow-spin"></div>
        <div className="absolute w-[700px] h-[700px] -bottom-[200px] -right-[200px] bg-gradient-to-r from-fuchsia-400/50 via-purple-400/50 to-pink-400/50 rounded-full blur-3xl animate-slow-spin-reverse"></div>
        
        {/* 追加の光の輪 */}
        <div className="absolute w-[600px] h-[600px] top-[30%] right-[20%] bg-gradient-to-r from-rose-400/40 via-pink-400/40 to-purple-400/40 rounded-full blur-3xl animate-float"></div>
        <div className="absolute w-[500px] h-[500px] bottom-[40%] left-[15%] bg-gradient-to-r from-purple-400/40 via-fuchsia-400/40 to-rose-400/40 rounded-full blur-3xl animate-float-reverse"></div>

        {/* 絵筆のストローク */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`stroke-${i}`}
            className="absolute"
            style={{
              width: `${Math.random() * 200 + 100}px`,
              height: `${Math.random() * 4 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `${['#ec4899', '#f43f5e', '#e879f9'][Math.floor(Math.random() * 3)]}40`,
              borderRadius: '999px',
              transformOrigin: 'left',
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <motion.div
              className="absolute right-0 w-4 h-4 rounded-full"
              style={{
                background: `${['#ec4899', '#f43f5e', '#e879f9'][Math.floor(Math.random() * 3)]}30`,
                filter: 'blur(2px)',
              }}
            />
          </motion.div>
        ))}

        {/* 色の飛沫 */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={`splash-${i}`}
            className="absolute"
            style={{
              width: `${Math.random() * 6 + 4}px`,
              height: `${Math.random() * 6 + 4}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `${['#ec4899', '#f43f5e', '#e879f9', '#c084fc'][Math.floor(Math.random() * 4)]}50`,
              borderRadius: '999px',
              filter: 'blur(1px)',
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.4, 0.8, 0.4],
              y: [0, Math.random() * -30],
              x: [0, Math.random() * 30 - 15],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* 音符 */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`note-${i}`}
            className="absolute text-2xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              color: `${['#c084fc', '#a855f7', '#9333ea'][Math.floor(Math.random() * 3)]}50`,
            }}
            animate={{
              y: [0, -50],
              x: [0, Math.random() * 50 - 25],
              rotate: [0, Math.random() * 360],
              opacity: [0.4, 0, 0.4],
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {['♪', '♫', '♬', '♩'][Math.floor(Math.random() * 4)]}
          </motion.div>
        ))}

        {/* 幾何学模様 */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`shape-${i}`}
            className="absolute"
            style={{
              width: `${Math.random() * 30 + 20}px`,
              height: `${Math.random() * 30 + 20}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              border: `2px solid ${['#e879f9', '#d946ef', '#c026d3'][Math.floor(Math.random() * 3)]}40`,
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
      </div>

      <div className="max-w-7xl mx-auto pb-28 relative">
        <GradientHeader
          title="びじゅつ"
          gradientColors={{
            from: '#ec4899',
            via: '#f472b6',
            to: '#f9a8d4'
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
            <div className="inline-flex items-center justify-center p-4 bg-pink-50 rounded-full">
              <Palette className="w-8 h-8 text-pink-600 animate-pulse" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 