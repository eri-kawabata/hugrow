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
      title: "絵を描く",
      description: "すきなものをじゆうにえがこう",
      gradient: {
        from: '#fb7185',
        via: '#f472b6',
        to: '#e879f9'
      }
    },
    {
      to: "/child/works/camera",
      icon: <Camera className="h-12 w-12" />,
      title: "写真・動画",
      description: "たのしいしゅんかんをとろう",
      gradient: {
        from: '#60a5fa',
        via: '#818cf8',
        to: '#a78bfa'
      }
    },
    {
      to: "/child/works/audio",
      icon: <Mic className="h-12 w-12" />,
      title: "音声録音",
      description: "こえやおとをろくおんしよう",
      gradient: {
        from: '#34d399',
        via: '#2dd4bf',
        to: '#22d3ee'
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-6xl mx-auto pb-28">
        <GradientHeader 
          title="どんな作品をつくる？" 
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
                  <div className="relative block bg-gradient-to-br from-white to-white/20 rounded-[24px] shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-[#8ec5d6]">
                    <div className="absolute inset-0 bg-white/90 transition-opacity group-hover:opacity-95"></div>
                    <div className="relative p-8">
                      <div className="flex flex-col items-center text-center">
                        <div className="p-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl mb-6">
                          {React.cloneElement(type.icon, {
                            className: `h-12 w-12 text-[${type.gradient.from}]`
                          })}
                        </div>
                        <h3 className="text-xl font-bold text-[#5d7799] mb-3">{type.title}</h3>
                        <p className="text-gray-600">{type.description}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}