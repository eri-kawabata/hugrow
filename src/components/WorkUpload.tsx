import React from 'react';
import { Palette, Camera, Mic } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GradientHeader } from '@/components/Common/GradientHeader';
import { motion } from 'framer-motion';

export function WorkUpload() {
  const createTypes = [
    {
      to: "/child/works/drawing",
      icon: <Palette className="h-12 w-12" />,
      title: "おえかき",
      description: "すきなものを えがこう",
      gradient: {
        from: '#fb7185',
        via: '#f472b6',
        to: '#e879f9'
      },
      iconColor: '#ff6b6b'
    },
    {
      to: "/child/works/camera",
      icon: <Camera className="h-12 w-12" />,
      title: "しゃしん・どうが",
      description: "たのしい しゅんかんを とろう",
      gradient: {
        from: '#60a5fa',
        via: '#818cf8',
        to: '#a78bfa'
      },
      iconColor: '#4dabf7'
    },
    {
      to: "/child/works/audio",
      icon: <Mic className="h-12 w-12" />,
      title: "おとをろくおん",
      description: "こえや おとを ろくおんしよう",
      gradient: {
        from: '#34d399',
        via: '#2dd4bf',
        to: '#22d3ee'
      },
      iconColor: '#69db7c'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* 背景の装飾要素 */}
      <div className="absolute inset-0 pointer-events-none">
        {/* 虹色の光の輪 */}
        <div className="absolute w-[900px] h-[900px] -top-[300px] -left-[300px] bg-gradient-to-r from-pink-300/40 via-blue-300/40 to-green-300/40 rounded-full blur-3xl animate-slow-spin"></div>
        <div className="absolute w-[700px] h-[700px] -bottom-[200px] -right-[200px] bg-gradient-to-r from-purple-300/40 via-yellow-300/40 to-blue-300/40 rounded-full blur-3xl animate-slow-spin-reverse"></div>
        
        {/* 追加の光の輪 */}
        <div className="absolute w-[600px] h-[600px] top-[30%] right-[20%] bg-gradient-to-r from-orange-300/30 via-red-300/30 to-yellow-300/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute w-[500px] h-[500px] bottom-[40%] left-[15%] bg-gradient-to-r from-indigo-300/30 via-purple-300/30 to-pink-300/30 rounded-full blur-3xl animate-float-reverse"></div>
        
        {/* 浮かぶ泡 */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-white/50 to-white/10"
            style={{
              width: `${Math.random() * 80 + 40}px`,
              height: `${Math.random() * 80 + 40}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backdropFilter: 'blur(4px)',
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, Math.random() * 30 - 15, 0],
              scale: [1, 1.2, 1],
              rotate: [0, 360, 0],
            }}
            transition={{
              duration: Math.random() * 8 + 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* キラキラ */}
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute bg-gradient-to-r from-white via-yellow-200 to-white rounded-full"
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              filter: 'blur(0.5px)',
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 2, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}

        {/* 流れ星 */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`shooting-star-${i}`}
            className="absolute h-0.5 bg-gradient-to-r from-transparent via-white to-transparent"
            style={{
              width: `${Math.random() * 150 + 100}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 180}deg)`,
            }}
            animate={{
              x: ['-200%', '300%'],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 15,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto pb-28 relative">
        <GradientHeader 
          title="どんなさくひんを つくる？" 
          gradientColors={{
            from: '#8ec5d6',
            via: '#f7c5c2',
            to: '#f5f6bf'
          }}
        />
        
        <div className="px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {createTypes.map((type, index) => (
              <motion.div
                key={type.to}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.5,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 260,
                  damping: 20
                }}
              >
                <Link
                  to={type.to}
                  className="relative group block"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#60a5fa] via-[#e879f9] to-[#fcd34d] rounded-[28px] opacity-30 group-hover:opacity-50 blur transition duration-500"></div>
                  <motion.div
                    whileHover={{ 
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                    className="relative block bg-gradient-to-br from-white to-white/20 rounded-[24px] shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-[#8ec5d6]"
                  >
                    <div className="absolute inset-0 bg-white/90 transition-opacity group-hover:opacity-95"></div>
                    <div className="absolute inset-0 pointer-events-none">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-1 h-1 bg-white rounded-full"
                          style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animation: `twinkle ${2 + Math.random() * 2}s infinite ${Math.random() * 2}s`
                          }}
                        />
                      ))}
                    </div>
                    <div className="relative p-8">
                      <div className="flex flex-col items-center text-center">
                        <motion.div
                          whileHover={{ 
                            scale: 1.1,
                            rotate: [0, -5, 5, 0],
                            transition: { duration: 0.3 }
                          }}
                          className={`p-6 bg-gradient-to-br from-${type.gradient.from}/10 to-${type.gradient.to}/10 rounded-2xl mb-6 relative overflow-hidden group-hover:shadow-lg transition-all duration-300`}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 group-hover:translate-x-full transition-all duration-1000"></div>
                          {React.cloneElement(type.icon, {
                            className: `h-16 w-16 transform transition-transform group-hover:scale-110 duration-300`,
                            style: { color: type.iconColor }
                          })}
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <h3 className="text-2xl font-bold bg-gradient-to-r from-[#5d7799] to-[#8ec5d6] bg-clip-text text-transparent mb-3">{type.title}</h3>
                          <p className="text-gray-600 text-lg">{type.description}</p>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
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
        
        @keyframes twinkle {
          0%, 100% { opacity: 0; transform: scale(0.5) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(180deg); }
        }
      `}</style>
    </div>
  );
}