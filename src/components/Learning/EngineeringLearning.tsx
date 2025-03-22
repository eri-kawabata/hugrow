import React from 'react';
import { motion } from 'framer-motion';
import { GradientHeader } from '@/components/Common/GradientHeader';
import { Wrench, Cog, Rocket, Building } from 'lucide-react';

export function EngineeringLearning() {
  const lessons = [
    {
      icon: <Wrench className="w-6 h-6 text-orange-600" />,
      title: "どうぐのしくみ",
      description: "かんたんなどうぐのしくみをしろう",
      isCompleted: false,
      gradientColors: {
        from: '#f97316',
        via: '#fb923c',
        to: '#fdba74'
      }
    },
    {
      icon: <Cog className="w-6 h-6 text-amber-600" />,
      title: "きかいのしくみ",
      description: "いろいろなきかいのはたらきをまなぼう",
      isCompleted: false,
      gradientColors: {
        from: '#fbbf24',
        via: '#f59e0b',
        to: '#d97706'
      }
    },
    {
      icon: <Rocket className="w-6 h-6 text-yellow-600" />,
      title: "うごくおもちゃをつくろう",
      description: "じぶんでうごくおもちゃをつくってみよう",
      isCompleted: false,
      gradientColors: {
        from: '#facc15',
        via: '#eab308',
        to: '#ca8a04'
      }
    },
    {
      icon: <Building className="w-6 h-6 text-orange-600" />,
      title: "たてものとこうぞう",
      description: "つよいたてものをつくるほうほう",
      isCompleted: false,
      gradientColors: {
        from: '#ea580c',
        via: '#c2410c',
        to: '#9a3412'
      }
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* 背景の装飾要素 */}
      <div className="absolute inset-0 pointer-events-none">
        {/* エンジニアリングの光の輪 */}
        <div className="absolute w-[900px] h-[900px] -top-[300px] -left-[300px] bg-gradient-to-r from-orange-300/40 via-amber-300/40 to-yellow-300/40 rounded-full blur-3xl animate-slow-spin"></div>
        <div className="absolute w-[700px] h-[700px] -bottom-[200px] -right-[200px] bg-gradient-to-r from-yellow-300/40 via-orange-300/40 to-amber-300/40 rounded-full blur-3xl animate-slow-spin-reverse"></div>
        
        {/* 追加の光の輪 */}
        <div className="absolute w-[600px] h-[600px] top-[30%] right-[20%] bg-gradient-to-r from-amber-300/30 via-yellow-300/30 to-orange-300/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute w-[500px] h-[500px] bottom-[40%] left-[15%] bg-gradient-to-r from-yellow-300/30 via-amber-300/30 to-orange-300/30 rounded-full blur-3xl animate-float-reverse"></div>
        
        {/* 歯車のメカニズム */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`gear-${i}`}
            className="absolute"
            style={{
              width: `${Math.random() * 80 + 40}px`,
              height: `${Math.random() * 80 + 40}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              border: `3px solid ${['#f97316', '#fbbf24', '#facc15'][Math.floor(Math.random() * 3)]}30`,
              borderRadius: '50%',
              transformOrigin: 'center',
            }}
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: Math.random() * 20 + 20,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {[...Array(8)].map((_, j) => (
              <motion.div
                key={`tooth-${j}`}
                className="absolute w-3 h-3 bg-orange-400/20"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${j * 45}deg) translateY(-50%) translateX(-50%)`,
                  transformOrigin: 'center',
                }}
              />
            ))}
          </motion.div>
        ))}

        {/* 設計図のグリッド */}
        {[...Array(20)].map((_, i) => (
          <React.Fragment key={`grid-${i}`}>
            <div
              className="absolute h-px w-full"
              style={{
                top: `${i * 5}%`,
                background: `linear-gradient(90deg, transparent, ${['#f97316', '#fbbf24', '#facc15'][Math.floor(Math.random() * 3)]}10, transparent)`,
              }}
            />
            <div
              className="absolute w-px h-full"
              style={{
                left: `${i * 5}%`,
                background: `linear-gradient(0deg, transparent, ${['#f97316', '#fbbf24', '#facc15'][Math.floor(Math.random() * 3)]}10, transparent)`,
              }}
            />
          </React.Fragment>
        ))}

        {/* 工具のシルエット */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={`tool-${i}`}
            className="absolute"
            style={{
              width: '3px',
              height: `${Math.random() * 40 + 20}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `${['#f97316', '#fbbf24', '#facc15'][Math.floor(Math.random() * 3)]}30`,
              transformOrigin: 'center',
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: Math.random() * 4 + 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <motion.div
              className="absolute -right-1 -top-1 w-2 h-2 rounded-full"
              style={{
                background: `${['#f97316', '#fbbf24', '#facc15'][Math.floor(Math.random() * 3)]}30`,
              }}
            />
          </motion.div>
        ))}

        {/* 測定線 */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`measure-${i}`}
            className="absolute flex items-center"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          >
            <div
              className="h-px"
              style={{
                width: `${Math.random() * 60 + 20}px`,
                background: `${['#f97316', '#fbbf24', '#facc15'][Math.floor(Math.random() * 3)]}20`,
              }}
            >
              <div className="absolute -top-1 left-0 w-px h-2 bg-orange-400/20" />
              <div className="absolute -top-1 right-0 w-px h-2 bg-orange-400/20" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto pb-28 relative">
      <GradientHeader
        title="こうがく"
        gradientColors={{
          from: '#f97316',
          via: '#fbbf24',
          to: '#facc15'
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
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-amber-600">
              ものづくりのせかいをたんけんしよう！
            </span>
          </h2>
            <p className="text-lg text-gray-600">
            どうぐやきかいをつかって、たのしくものづくりをしよう
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
            <div className="inline-flex items-center justify-center p-4 bg-orange-50 rounded-full">
            <Wrench className="w-8 h-8 text-orange-600 animate-pulse" />
          </div>
        </motion.div>
        </div>
      </div>
    </div>
  );
} 