import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Palette, Calculator, Microscope, Wrench, Laptop } from 'lucide-react';

export function LearningPage() {
  const subjects = [
    {
      title: "びじゅつ",
      description: "そうぞうりょくをひろげよう",
      icon: <Palette className="w-8 h-8" />,
      href: "/child/learning/art",
      gradientColors: {
        from: '#ec4899',
        via: '#f43f5e',
        to: '#e879f9'
      }
    },
    {
      title: "すうがく",
      description: "かずとかたちをたのしもう",
      icon: <Calculator className="w-8 h-8" />,
      href: "/child/learning/math",
      gradientColors: {
        from: '#10b981',
        via: '#059669',
        to: '#047857'
      }
    },
    {
      title: "かがく",
      description: "しぜんのふしぎをさぐろう",
      icon: <Microscope className="w-8 h-8" />,
      href: "/child/learning/science",
      gradientColors: {
        from: '#3b82f6',
        via: '#2563eb',
        to: '#1d4ed8'
      }
    },
    {
      title: "こうがく",
      description: "つくることをまなぼう",
      icon: <Wrench className="w-8 h-8" />,
      href: "/child/learning/engineering",
      gradientColors: {
        from: '#f97316',
        via: '#fb923c',
        to: '#fdba74'
      }
    },
    {
      title: "ぎじゅつ",
      description: "みらいのぎじゅつをたいけん",
      icon: <Laptop className="w-8 h-8" />,
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
      {/* STEAM背景アニメーション */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* DNA構造のアニメーション */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`dna-${i}`}
            className="absolute"
            style={{
              width: '2px',
              height: '300px',
              left: `${20 + i * 30}%`,
              top: '-100px',
              background: '#3b82f680',
              transformOrigin: 'center',
            }}
            animate={{
              rotateY: [0, 360],
              height: ['300px', '400px', '300px'],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear",
              delay: i * 2,
            }}
          >
            {[...Array(10)].map((_, j) => (
              <motion.div
                key={`connection-${j}`}
                className="absolute w-20 h-0.5"
                style={{
                  top: `${j * 30}px`,
                  left: '0px',
                  background: '#3b82f650',
                  transformOrigin: 'left',
                }}
                animate={{
                  rotateZ: [0, 360],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "linear",
                  delay: j * 0.5,
                }}
              />
            ))}
          </motion.div>
        ))}

        {/* 数式と記号のアニメーション */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`math-${i}`}
            className="absolute text-xl font-bold"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              color: '#10b98180',
            }}
            animate={{
              y: [0, -50],
              x: [0, Math.random() * 50 - 25],
              rotate: [0, 360],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {['+', '-', '×', '÷', '=', 'π', '∑', '∫'][Math.floor(Math.random() * 8)]}
          </motion.div>
        ))}

        {/* アートのブラシストローク */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`brush-${i}`}
            className="absolute"
            style={{
              width: `${Math.random() * 200 + 100}px`,
              height: `${Math.random() * 4 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: '#ec489940',
              borderRadius: '999px',
              transformOrigin: 'left',
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
            animate={{
              scaleX: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* 技術の回路パターン */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`circuit-${i}`}
            className="absolute"
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: '2px',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: '#6366f160',
              transformOrigin: 'left',
            }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              boxShadow: [
                '0 0 5px #6366f1',
                '0 0 10px #6366f1',
                '0 0 5px #6366f1'
              ],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <motion.div
              className="absolute right-0 w-2 h-2 rounded-full"
              style={{ background: '#6366f1' }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        ))}

        {/* 工学の歯車アニメーション */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`gear-${i}`}
            className="absolute"
            style={{
              width: `${Math.random() * 40 + 30}px`,
              height: `${Math.random() * 40 + 30}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              border: `2px solid #f9731640`,
              borderRadius: '50%',
              background: '#f9731610',
            }}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {[...Array(8)].map((_, j) => (
              <motion.div
                key={`tooth-${j}`}
                className="absolute w-2 h-4 bg-orange-400/20"
                style={{
                  left: '50%',
                  top: '-8px',
                  marginLeft: '-4px',
                  transform: `rotate(${j * 45}deg)`,
                  transformOrigin: 'bottom',
                }}
              />
            ))}
          </motion.div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              まなびのせかい
            </span>
          </h1>
          <p className="text-xl text-gray-600">
            すきなジャンルからはじめよう！
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {subjects.map((subject, index) => (
            <motion.div
              key={subject.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={subject.href}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative group block"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r rounded-[32px] opacity-30 group-hover:opacity-50 blur transition duration-500"
                    style={{
                      backgroundImage: `linear-gradient(to right, ${subject.gradientColors.from}, ${subject.gradientColors.via}, ${subject.gradientColors.to})`
                    }}
                  ></div>
                  <div className="relative bg-white rounded-[28px] p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <motion.div
                        whileHover={{ 
                          rotate: [0, -10, 10, 0],
                          transition: { duration: 0.5 }
                        }}
                        className="p-4 rounded-2xl"
                        style={{
                          background: `linear-gradient(135deg, ${subject.gradientColors.from}20, ${subject.gradientColors.to}20)`
                        }}
                      >
                        {React.cloneElement(subject.icon, {
                          style: { color: subject.gradientColors.from }
                        })}
                      </motion.div>
                      <div>
                        <h3 className="text-2xl font-bold mb-2"
                          style={{
                            background: `linear-gradient(to right, ${subject.gradientColors.from}, ${subject.gradientColors.to})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                          }}
                        >
                          {subject.title}
                        </h3>
                        <p className="text-gray-600">{subject.description}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 