import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Image, Heart } from 'lucide-react';
import { GradientHeader } from '@/components/Common/GradientHeader';
import { motion } from 'framer-motion';

// 背景の装飾用コンポーネント
const BackgroundDecorations = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden">
    {/* 大きな円形の装飾 */}
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={`large-${i}`}
        className="absolute"
        initial={{
          opacity: 0.3,
          scale: Math.random() * 1 + 1,
          x: Math.random() * window.innerWidth,
          y: window.innerHeight + 100,
        }}
        animate={{
          opacity: [0.2, 0.5, 0.2],
          y: -200,
          scale: [null, Math.random() * 0.5 + 1.5],
        }}
        transition={{
          duration: Math.random() * 10 + 15,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <div 
          className={`w-32 h-32 rounded-full blur-xl bg-gradient-to-r 
            ${i % 3 === 0 ? 'from-pink-200/40 to-red-200/40' : 
              i % 3 === 1 ? 'from-blue-200/40 to-indigo-200/40' : 
              'from-yellow-200/40 to-orange-200/40'}`}
        />
      </motion.div>
    ))}

    {/* 中サイズの装飾 */}
    {[...Array(15)].map((_, i) => (
      <motion.div
        key={`medium-${i}`}
        className="absolute"
        initial={{
          opacity: 0.5,
          scale: Math.random() * 0.8 + 0.5,
          x: Math.random() * window.innerWidth,
          y: window.innerHeight + 100,
        }}
        animate={{
          opacity: [0.3, 0.8, 0.3],
          y: -150,
          scale: [null, Math.random() * 0.5 + 0.8],
        }}
        transition={{
          duration: Math.random() * 8 + 12,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <div 
          className={`w-16 h-16 rounded-full blur-md bg-gradient-to-r 
            ${i % 3 === 0 ? 'from-pink-300/60 to-red-300/60' : 
              i % 3 === 1 ? 'from-blue-300/60 to-indigo-300/60' : 
              'from-yellow-300/60 to-orange-300/60'}`}
        />
      </motion.div>
    ))}

    {/* 小さな装飾 */}
    {[...Array(25)].map((_, i) => (
      <motion.div
        key={`small-${i}`}
        className="absolute"
        initial={{
          opacity: 0.7,
          scale: Math.random() * 0.5 + 0.3,
          x: Math.random() * window.innerWidth,
          y: window.innerHeight + 100,
        }}
        animate={{
          opacity: [0.4, 1, 0.4],
          y: -100,
          scale: [null, Math.random() * 0.3 + 0.4],
        }}
        transition={{
          duration: Math.random() * 6 + 8,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <div 
          className={`w-8 h-8 rounded-full blur-sm bg-gradient-to-r 
            ${i % 3 === 0 ? 'from-pink-400/80 to-red-400/80' : 
              i % 3 === 1 ? 'from-blue-400/80 to-indigo-400/80' : 
              'from-yellow-400/80 to-orange-400/80'}`}
        />
      </motion.div>
    ))}
  </div>
);

const ActionCard: React.FC<{
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  gradientFrom: string;
  gradientTo: string;
  borderColor: string;
  delay: number;
}> = ({ to, icon, title, description, gradientFrom, gradientTo, borderColor, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ scale: 1.02, y: -5 }}
    whileTap={{ scale: 0.98 }}
    className="relative group"
  >
    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#60a5fa] via-[#e879f9] to-[#fcd34d] rounded-[20px] opacity-20 group-hover:opacity-40 blur transition duration-500"></div>
    <Link
      to={to}
      className={`relative block bg-gradient-to-br from-${gradientFrom} to-${gradientTo} rounded-[16px] shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border ${borderColor}`}
      role="button"
      aria-label={title}
    >
      <div className="absolute inset-0 bg-white/95 transition-opacity group-hover:opacity-90"></div>
      <div className="relative p-8">
        <div className="flex flex-col items-center text-center gap-5">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className={`relative p-5 bg-${gradientFrom}/20 rounded-2xl group-hover:bg-${gradientFrom}/30 transition-all transform group-hover:-translate-y-1 duration-300 shadow-sm`}
          >
            {icon}
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold text-[#4a5568] mb-3 group-hover:text-indigo-600 transition-colors">{title}</h2>
            <p className="text-base text-[#718096] leading-relaxed group-hover:text-indigo-500/80">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  </motion.div>
);

export function Home() {
  return (
    <div className="relative min-h-screen">
      <BackgroundDecorations />
      <div className="relative max-w-6xl mx-auto space-y-12 pb-28 z-10">
        <GradientHeader 
          title="ほーむ" 
          gradientColors={{
            from: '#89f7fe',
            via: '#66a6ff',
            to: '#f78fb3'
          }}
        />

        {/* メインアクションカード */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-6">
          <ActionCard
            to="/child/learning"
            icon={<BookOpen className="h-12 w-12 text-[#4a5568] group-hover:text-blue-600 transition-colors" />}
            title="がくしゅうをはじめる"
            description="あたらしいレッスンにちょうせん"
            gradientFrom="blue-50"
            gradientTo="indigo-50"
            borderColor="border-blue-100"
            delay={0.1}
          />

          <ActionCard
            to="/child/works/new"
            icon={<Image className="h-12 w-12 text-[#4a5568] group-hover:text-pink-600 transition-colors" />}
            title="さくひんをつくる"
            description="あたらしいさくひんをつくろう"
            gradientFrom="pink-50"
            gradientTo="rose-50"
            borderColor="border-pink-100"
            delay={0.2}
          />

          <ActionCard
            to="/child/sel-quest"
            icon={<Heart className="h-12 w-12 text-[#4a5568] group-hover:text-yellow-600 transition-colors" />}
            title="きもちクエスト"
            description="きょうのきもちをきろく"
            gradientFrom="yellow-50"
            gradientTo="amber-50"
            borderColor="border-yellow-100"
            delay={0.3}
          />
        </div>
      </div>
    </div>
  );
}