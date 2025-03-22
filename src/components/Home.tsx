import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Image, Heart, Star, Medal, Target, Gift, Crown, Sparkles, Rocket } from 'lucide-react';
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

const RecommendCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
  color: string;
  delay: number;
}> = ({ title, description, icon, to, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ scale: 1.02 }}
    className="relative group"
  >
    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#60a5fa] to-[#e879f9] rounded-xl opacity-20 group-hover:opacity-30 blur transition duration-500"></div>
    <Link
      to={to}
      className={`relative flex items-center gap-4 p-4 bg-${color}-50/80 backdrop-blur-sm rounded-xl hover:bg-${color}-100/80 transition-all group`}
    >
      <motion.div 
        whileHover={{ scale: 1.1, rotate: 5 }}
        className={`p-3 bg-${color}-100 rounded-xl group-hover:shadow-lg transition-all`}
      >
        {icon}
      </motion.div>
      <div>
        <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{title}</h3>
        <p className="text-sm text-gray-600 mt-1 group-hover:text-indigo-500/80">{description}</p>
      </div>
    </Link>
  </motion.div>
);

const BadgeCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  color: string;
}> = ({ icon, title, color }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className={`relative group`}
  >
    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#fcd34d] to-[#f472b6] rounded-xl opacity-20 group-hover:opacity-30 blur transition duration-500"></div>
    <div className={`relative flex flex-col items-center gap-2 p-3 bg-${color}-50/80 backdrop-blur-sm rounded-xl group-hover:shadow-lg transition-all`}>
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        className={`p-2 bg-${color}-100 rounded-lg shadow-sm group-hover:shadow-md transition-all`}
      >
        {icon}
      </motion.div>
      <span className="text-xs font-medium text-gray-700 text-center group-hover:text-indigo-600 transition-colors">{title}</span>
    </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-6">
        {/* 今日のおすすめ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="relative group"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl opacity-20 group-hover:opacity-30 blur transition duration-500"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-blue-100/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full">
                <Rocket className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">今日のおすすめ</h2>
            </div>
            <div className="space-y-3">
              <RecommendCard
                title="かがくのじっけん"
                description="たのしくまなべるよ！"
                icon={<BookOpen className="h-5 w-5 text-blue-600" />}
                to="/child/learning/science"
                color="blue"
                delay={0.1}
              />
              <RecommendCard
                title="おえかきチャレンジ"
                description="すてきなえをかこう"
                icon={<Image className="h-5 w-5 text-pink-600" />}
                to="/child/works/new"
                color="pink"
                delay={0.2}
              />
            </div>
          </div>
        </motion.div>

        {/* がんばりボード */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="relative group"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl opacity-20 group-hover:opacity-30 blur transition duration-500"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-purple-100/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full">
                  <Medal className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">がんばりボード</h2>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-1 bg-gradient-to-r from-purple-400 to-pink-400 px-3 py-1 rounded-full"
              >
                <Star className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">280</span>
              </motion.div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <BadgeCard
                icon={<Crown className="h-5 w-5 text-yellow-600" />}
                title="がくしゅうマスター"
                color="yellow"
              />
              <BadgeCard
                icon={<Heart className="h-5 w-5 text-pink-600" />}
                title="きもちの達人"
                color="pink"
              />
              <BadgeCard
                icon={<Image className="h-5 w-5 text-blue-600" />}
                title="アーティスト"
                color="blue"
              />
            </div>
          </div>
        </motion.div>

        {/* 今日のミッション */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="lg:col-span-2 relative group"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl opacity-20 group-hover:opacity-30 blur transition duration-500"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-green-100/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full">
                <Target className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">今日のミッション</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl opacity-20 group-hover:opacity-30 blur transition duration-500"></div>
                <div className="relative bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 group-hover:shadow-lg transition-all">
                  <div className="flex items-center gap-3">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-all"
                    >
                      <BookOpen className="h-5 w-5 text-emerald-600" />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 group-hover:text-emerald-600 transition-colors">かがくのレッスン</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <Gift className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm text-emerald-600">ごほうび: 30ポイント</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl opacity-20 group-hover:opacity-30 blur transition duration-500"></div>
                <div className="relative bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 group-hover:shadow-lg transition-all">
                  <div className="flex items-center gap-3">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-all"
                    >
                      <Image className="h-5 w-5 text-indigo-600" />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">おえかきタイム</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <Gift className="h-4 w-4 text-indigo-500" />
                        <span className="text-sm text-indigo-600">ごほうび: 20ポイント</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-400 to-rose-400 rounded-xl opacity-20 group-hover:opacity-30 blur transition duration-500"></div>
                <div className="relative bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4 group-hover:shadow-lg transition-all">
                  <div className="flex items-center gap-3">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-all"
                    >
                      <Heart className="h-5 w-5 text-rose-600" />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 group-hover:text-rose-600 transition-colors">きもちチェック</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <Gift className="h-4 w-4 text-rose-500" />
                        <span className="text-sm text-rose-600">ごほうび: 25ポイント</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}