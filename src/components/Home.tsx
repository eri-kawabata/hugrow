import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Image, Heart } from 'lucide-react';
import { GradientHeader } from '@/components/Common/GradientHeader';
import { motion } from 'framer-motion';

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
    whileHover={{ scale: 1.03 }}
    className="relative group"
  >
    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#60a5fa] via-[#e879f9] to-[#fcd34d] rounded-[28px] opacity-30 group-hover:opacity-50 blur transition duration-500"></div>
    <Link
      to={to}
      className={`relative block bg-gradient-to-br from-${gradientFrom} to-${gradientTo} rounded-[24px] shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 ${borderColor}`}
      role="button"
      aria-label={title}
    >
      <div className="absolute inset-0 bg-white/90 transition-opacity group-hover:opacity-95"></div>
      <div className="relative p-6">
        <div className="flex flex-col items-center text-center gap-4">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className={`p-4 bg-${gradientFrom}/30 rounded-xl group-hover:bg-${gradientFrom}/40 transition-all transform group-hover:-translate-y-1 duration-300 shadow-lg`}
          >
            {icon}
          </motion.div>
          <div>
            <h2 className="text-xl font-bold text-[#5d7799] mb-2 group-hover:text-indigo-600 transition-colors">{title}</h2>
            <p className="text-base text-[#5d7799]/80 leading-relaxed group-hover:text-indigo-500/80">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  </motion.div>
);

export function Home() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-28">
      <GradientHeader 
        title="ほーむ" 
        gradientColors={{
          from: '#8ec5d6',
          via: '#f7c5c2',
          to: '#f5f6bf'
        }}
      />

      {/* メインアクションカード */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-6">
        <ActionCard
          to="/child/learning"
          icon={<BookOpen className="h-10 w-10 text-[#5d7799] group-hover:text-blue-600 transition-colors" />}
          title="がくしゅうをはじめる"
          description="あたらしいレッスンにちょうせん"
          gradientFrom="white"
          gradientTo="[#8ec5d6]/20"
          borderColor="border-[#8ec5d6]"
          delay={0.1}
        />

        <ActionCard
          to="/child/works/new"
          icon={<Image className="h-10 w-10 text-[#5d7799] group-hover:text-pink-600 transition-colors" />}
          title="さくひんをつくる"
          description="あたらしいさくひんをつくろう"
          gradientFrom="white"
          gradientTo="[#f7c5c2]/20"
          borderColor="border-[#f7c5c2]"
          delay={0.2}
        />

        <ActionCard
          to="/child/sel-quest"
          icon={<Heart className="h-10 w-10 text-[#5d7799] group-hover:text-yellow-600 transition-colors" />}
          title="きもちクエスト"
          description="きょうのきもちをきろく"
          gradientFrom="white"
          gradientTo="[#f5f6bf]/20"
          borderColor="border-[#f5f6bf]"
          delay={0.3}
        />
      </div>
    </div>
  );
}