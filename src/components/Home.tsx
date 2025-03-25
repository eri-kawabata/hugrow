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
}> = ({ to, icon, title, description, gradientFrom, gradientTo, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ 
      scale: 1.03,
      rotate: 1,
      y: -8
    }}
    whileTap={{ scale: 0.95 }}
    className="relative group"
  >
    {/* カードの装飾的な背景効果 */}
    <div className="absolute -inset-1 bg-gradient-to-r from-[#60a5fa] via-[#e879f9] to-[#fcd34d] rounded-[24px] opacity-0 group-hover:opacity-70 blur-xl transition-all duration-500"></div>
    
    {/* メインカード */}
    <Link
      to={to}
      className="relative block bg-white rounded-[24px] shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
      role="button"
      aria-label={title}
    >
      {/* カード内の装飾的な要素 */}
      <div className="absolute inset-0">
        <div className={`absolute inset-0 bg-gradient-to-br from-${gradientFrom} to-${gradientTo} opacity-5 group-hover:opacity-20 transition-opacity duration-300`}></div>
        
        {/* 装飾的なパターン */}
        <div className="absolute inset-0 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-300"
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23000000' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`
             }}
        ></div>
      </div>

      {/* コンテンツ */}
      <div className="relative p-8">
        <div className="flex flex-col items-center text-center gap-6">
          {/* アイコンコンテナ */}
          <div className="relative">
            <motion.div
              whileHover={{ 
                scale: 1.15,
                rotate: [0, -10, 10, -10, 0],
                transition: { duration: 0.5 }
              }}
              className={`relative p-6 rounded-[20px] transform group-hover:-translate-y-2 duration-300
                ${gradientFrom === 'blue-50' ? 'bg-gradient-to-br from-blue-100 to-indigo-200' :
                  gradientFrom === 'pink-50' ? 'bg-gradient-to-br from-pink-100 to-rose-200' :
                  'bg-gradient-to-br from-yellow-100 to-amber-200'}`}
            >
              {/* アイコン背景の光沢効果 */}
              <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-white/60 to-transparent"></div>
              
              {/* キラキラエフェクト */}
              <div className="absolute -inset-1">
                <div className="absolute inset-0 rounded-[20px] bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 blur-sm transform group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
              </div>
              
              {/* アイコン */}
              <div className="relative transform transition-transform duration-300">
                {icon}
              </div>
            </motion.div>
          </div>

          {/* テキストコンテンツ */}
          <div className="space-y-3 relative">
            <h2 className={`text-2xl font-bold transition-all duration-300 transform group-hover:-translate-y-1
              ${gradientFrom === 'blue-50' ? 'text-blue-600 group-hover:text-blue-700' :
                gradientFrom === 'pink-50' ? 'text-pink-600 group-hover:text-pink-700' :
                'text-yellow-600 group-hover:text-yellow-700'}`}>
              {title}
            </h2>
            <p className={`text-base leading-relaxed transition-colors duration-300
              ${gradientFrom === 'blue-50' ? 'text-blue-500/90' :
                gradientFrom === 'pink-50' ? 'text-pink-500/90' :
                'text-yellow-600/90'}`}>
              {description}
            </p>
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
          title="ホーム" 
          gradientColors={{
            from: '#3b82f6',
            via: '#ec4899',
            to: '#facc15'
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