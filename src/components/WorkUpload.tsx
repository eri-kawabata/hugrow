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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-6xl mx-auto pb-28">
        <GradientHeader 
          title="どんなさくひんを つくる？" 
          gradientColors={{
            from: '#8ec5d6',
            via: '#f7c5c2',
            to: '#f5f6bf'
          }}
        />
        
        <div className="px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
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
    </div>
  );
}