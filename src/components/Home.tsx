import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Image, Heart, MessageCircle, ArrowRight } from 'lucide-react';
import { GradientHeader } from '@/components/Common/GradientHeader';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { ParentFeedbackNotification } from './ParentFeedbackNotification';

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

// フィードバックモーダル通知コンポーネント
const FeedbackModal: React.FC<{
  parentName: string;
  messageCount: number;
  onClose: () => void;
}> = ({ parentName, messageCount, onClose }) => {
  const navigate = useNavigate();
  
  return (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.8, y: 20 }}
      animate={{ 
        scale: 1, 
        y: 0,
        transition: { 
          type: "spring",
          stiffness: 300,
          damping: 20,
          delay: 0.1
        } 
      }}
      className="relative max-w-md w-full p-8 bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* 背景のグラデーションとエフェクト */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50"></div>
      
      {/* 上部の装飾バー */}
      <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 -z-10" />
      
      {/* 背景の装飾パターン */}
      <div className="absolute inset-0 opacity-[0.03] bg-repeat" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='52' height='26' viewBox='0 0 52 26' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      ></div>
      
      {/* キラキラエフェクト - より多様なサイズと色 */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute opacity-20"
            style={{
              width: `${Math.random() * 30 + 10}px`,
              height: `${Math.random() * 30 + 10}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: i % 3 === 0 
                ? `radial-gradient(circle, rgba(255,255,255,0) 30%, rgba(238,140,255,1) 70%)` 
                : i % 3 === 1 
                ? `radial-gradient(circle, rgba(255,255,255,0) 30%, rgba(99,102,241,1) 70%)`
                : `radial-gradient(circle, rgba(255,255,255,0) 30%, rgba(244,114,182,1) 70%)`,
              borderRadius: '50%',
              filter: 'blur(1px)',
            }}
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ 
              scale: [0.2, 1, 0.2], 
              opacity: [0, 0.8, 0],
              transition: {
                repeat: Infinity,
                duration: 3 + Math.random() * 5,
                delay: Math.random() * 2,
              }
            }}
          />
        ))}
      </div>
      
      {/* 小さな星のアニメーション */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute text-yellow-300"
            style={{
              left: `${Math.random() * 90 + 5}%`,
              top: `${Math.random() * 90 + 5}%`,
              fontSize: `${Math.random() * 12 + 8}px`,
              opacity: 0.7,
            }}
            initial={{ scale: 0, rotate: 0 }}
            animate={{ 
              scale: [0, 1, 0],
              rotate: [0, 180, 360],
              opacity: [0, 0.9, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 2 + Math.random() * 3,
              delay: Math.random() * 5,
            }}
          >
            ★
          </motion.div>
        ))}
      </div>
      
      <div className="relative">
        {/* アイコンと光るエフェクト */}
        <div className="flex flex-col items-center text-center mb-6">
          {/* 上から降りてくるメッセージアイコン */}
          <motion.div
            className="relative w-28 h-28 mb-4"
            initial={{ y: -50, opacity: 0 }}
            animate={{ 
              y: 0, 
              opacity: 1,
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 15,
                delay: 0.2
              }
            }}
          >
            {/* アイコン背景の輝きエフェクト */}
            <motion.div 
              className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-400 to-pink-400 opacity-30 blur-xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
            
            {/* メインのアイコンコンテナ */}
            <motion.div 
              className="relative w-full h-full bg-white rounded-full flex items-center justify-center shadow-[0_10px_30px_-15px_rgba(79,70,229,0.5)]"
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, -3, 3, -3, 0]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                repeatType: "reverse" 
              }}
            >
              {/* グラデーション背景 */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-50 via-white to-pink-50"></div>
              
              {/* 輝くリング */}
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-indigo-200/50"
                animate={{
                  boxShadow: [
                    "0 0 0 0 rgba(99, 102, 241, 0)",
                    "0 0 0 10px rgba(99, 102, 241, 0.1)",
                    "0 0 0 0 rgba(99, 102, 241, 0)"
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "loop"
                }}
              />
              
              {/* メッセージアイコン */}
              <motion.div
                className="relative z-10"
                animate={{ 
                  scale: [1, 1.15, 1],
                  rotate: [0, 5, 0, -5, 0],
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  repeatType: "reverse" 
                }}
              >
                <MessageCircle className="h-14 w-14 text-indigo-600 drop-shadow-md" />
              </motion.div>
              
              {/* ジャンプするバッジ */}
              {messageCount > 0 && (
                <motion.div
                  className="absolute -top-3 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-full shadow-lg font-bold border-2 border-white"
                  initial={{ scale: 0 }}
                  animate={{ 
                    scale: [0, 1.2, 1],
                    y: [0, -10, 0],
                  }}
                  transition={{ 
                    duration: 0.5,
                    y: {
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut"
                    }
                  }}
                >
                  <div className="flex items-center">
                    <span className="text-base">{messageCount}</span>
                    <span className="text-xs ml-0.5">つ</span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>

          {/* タイトルテキスト */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {/* 輝くバックグラウンド */}
            <motion.div
              className="absolute -inset-3 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-lg blur-md"
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
            
            {/* タイトルテキスト */}
            <h2 className="relative text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-3 px-3 py-1">
              あたらしいメッセージが<br />とどきました！
            </h2>
          </motion.div>
          
          {/* 送信者名 */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <div className="relative">
              <motion.div
                className="absolute -inset-2 bg-gradient-to-r from-indigo-400/20 to-pink-400/20 rounded-full blur-sm"
                animate={{
                  opacity: [0.5, 1, 0.5],
                  scale: [0.95, 1.05, 0.95],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
              <div className="relative bg-gradient-to-r from-indigo-100 to-pink-100 px-6 py-2.5 rounded-full">
                <div className="flex items-center gap-2">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 font-bold text-lg md:text-xl">
                    {parentName}
                  </span>
                  <span className="text-gray-800 font-medium">さんから</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* メッセージ内容エリア */}
        <motion.div
          className="relative mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          {/* カード背景 */}
          <div className="relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-indigo-100/50 via-white/50 to-pink-100/50 rounded-2xl"
              animate={{
                opacity: [0.5, 0.8, 0.5],
                background: [
                  "linear-gradient(to bottom right, rgba(224, 231, 255, 0.5), rgba(255, 255, 255, 0.5), rgba(252, 231, 243, 0.5))",
                  "linear-gradient(to bottom right, rgba(224, 231, 255, 0.8), rgba(255, 255, 255, 0.8), rgba(252, 231, 243, 0.8))",
                  "linear-gradient(to bottom right, rgba(224, 231, 255, 0.5), rgba(255, 255, 255, 0.5), rgba(252, 231, 243, 0.5))"
                ]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
            
            <div className="relative p-4 rounded-2xl border border-indigo-100 shadow-inner">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-full shadow-md">
                  <Heart className="h-5 w-5 text-pink-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <motion.div
                      className="w-1.5 h-1.5 rounded-full bg-pink-500"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    <h3 className="font-bold text-base text-gray-800">あたらしいメッセージ</h3>
                  </div>
                  <p className="text-gray-700 font-medium mt-1 text-sm">
                    <span className="font-bold text-indigo-600">{messageCount}つ</span>
                    のメッセージがとどいています
                  </p>
                </div>
              </div>
              
              {/* 装飾的なドット */}
              <div className="absolute bottom-3 right-4 flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={`dot-${i}`}
                    className={`w-1.5 h-1.5 rounded-full ${
                      i === 0 ? 'bg-pink-400' : i === 1 ? 'bg-purple-400' : 'bg-indigo-400'
                    }`}
                    animate={{ 
                      opacity: [0.4, 1, 0.4],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ 
                      duration: 2, 
                      delay: i * 0.3,
                      repeat: Infinity 
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* アクションボタン */}
        <div className="flex flex-col gap-4">
          {/* メッセージを見てみるボタン（大きく目立つように） */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            whileHover={{ 
              scale: 1.05, 
              boxShadow: "0 15px 30px -5px rgba(79, 70, 229, 0.5)",
              y: -3
            }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              onClose();
              navigate('/child/works'); // 子供の作品一覧ページに遷移
            }}
            className="w-full py-6 px-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-xl font-bold shadow-lg relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center justify-center gap-3 relative z-10">
                <span className="text-2xl">メッセージをみてみる</span>
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-2xl"
                >
                  →
                </motion.span>
              </div>
            </div>
            
            {/* キラキラエフェクト */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 w-40 h-full bg-white opacity-0 transform rotate-45"
                animate={{
                  left: ["-100%", "200%"],
                  opacity: [0, 0.3, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              />
            </div>
            
            {/* 脈動する輪郭効果 */}
            <motion.div
              className="absolute -inset-1 rounded-xl opacity-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400"
              animate={{
                opacity: [0, 0.5, 0],
                scale: [0.95, 1.05, 0.95],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
          </motion.button>
          
          {/* あとで見るボタン（小さく控えめに） */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            whileHover={{ 
              scale: 1.02, 
              backgroundColor: "#f9fafb",
              borderColor: "#c7d2fe"
            }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="w-full py-2 px-4 bg-white border border-gray-200 text-gray-500 rounded-lg font-medium shadow-sm transition-all duration-300 text-xs mx-auto max-w-[200px]"
          >
            あとでみる
          </motion.button>
        </div>
        
        {/* 装飾的な要素 - 下部の丸い装飾 */}
        <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-r from-indigo-200/20 to-pink-200/20 blur-2xl"></div>
        <div className="absolute -bottom-5 -left-5 w-24 h-24 rounded-full bg-gradient-to-r from-pink-200/20 to-yellow-200/20 blur-2xl"></div>
      </div>
    </motion.div>
  </motion.div>
  );
};

export function Home() {
  const [parentName, setParentName] = useState<string>('');
  const [messageCount, setMessageCount] = useState<number>(0);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  // 親の名前とフィードバックメッセージ数を取得
  useEffect(() => {
    const fetchParentInfo = async () => {
      try {
        // 現在のユーザーを取得
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        console.log("ユーザー情報を取得:", user.id);

        // 直接テスト用の名前を設定（デバッグ用）
        // setParentName("Gintoki");
        // setMessageCount(1);
        // setShowFeedback(true);
        // setShowModal(true);
        // return;

        try {
          // 自分のプロフィールを取得 - single()は使わず、最初の結果を使用
          const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('id, parent_id, role')
            .eq('user_id', user.id)
            .eq('role', 'child');  // 子供プロフィールのみに限定

          if (profileError) {
            console.error('プロフィール取得エラー:', profileError);
            // エラー時はデフォルト表示
            setShowFeedback(true);
            setMessageCount(1);
            setParentName("おうちの人");
            setShowModal(true);
            return;
          }

          console.log("取得したプロフィール:", profiles);

          // 子供のプロフィールが見つからなかった場合
          if (!profiles || profiles.length === 0) {
            console.error('子供のプロフィールが見つかりません');
            setShowFeedback(true);
            setMessageCount(1);
            setParentName("おうちの人");
            setShowModal(true);
            return;
          }

          // 最初の子供プロフィールを使用
          const profile = profiles[0];
          console.log("使用するプロフィール:", profile);

          if (profile?.parent_id) {
            // 親のプロフィールを取得 - single()は使わず、最初の結果を使用
            const { data: parentProfiles, error: parentError } = await supabase
              .from('profiles')
              .select('id, username, display_name')
              .eq('id', profile.parent_id);

            if (parentError) {
              console.error('親プロフィール取得エラー:', parentError);
              setShowFeedback(true);
              setMessageCount(1);
              setParentName("おうちの人");
              setShowModal(true);
              return;
            }

            console.log("親のプロフィール情報:", parentProfiles);

            // 親のプロフィールが見つかった場合
            if (parentProfiles && parentProfiles.length > 0) {
              const parentProfile = parentProfiles[0];
              // 親の名前を設定
              const name = parentProfile.display_name || parentProfile.username;
              console.log("親の名前を設定:", name);
              
              if (name) {
                setParentName(name);
              } else {
                console.log("親の名前が取得できません。デフォルト名を使用します。");
                setParentName("おうちの人");
              }
            } else {
              console.log("親のプロフィールが取得できませんでした。");
              setParentName("おうちの人");
            }

            // 未読フィードバック数を取得
            const { data: feedback, error: feedbackError } = await supabase
              .from('work_feedback')
              .select('id', { count: 'exact' })
              .eq('profile_id', profile.id)
              .eq('is_read', false);

            if (feedbackError) {
              console.error('フィードバック取得エラー:', feedbackError);
              setShowFeedback(true);
              setMessageCount(1);
              setShowModal(true);
              return;
            }

            console.log("フィードバック:", feedback);

            if (feedback) {
              const hasMessages = feedback.length > 0;
              setMessageCount(feedback.length || 1); // テスト用に0の場合も1にする
              setShowFeedback(true);
              
              // テスト用：常にモーダルを表示する
              setShowModal(true);
              
              // 本番用コード：実際にメッセージがある場合のみモーダルを表示
              // setShowModal(hasMessages);
            }
          } else {
            // 親IDがない場合もテスト表示
            console.log("親IDがありません。テスト表示します。");
            setShowFeedback(true);
            setMessageCount(1);
            setParentName("おうちの人");
            setShowModal(true);
          }
        } catch (innerError) {
          console.error('データ取得エラー:', innerError);
          setShowFeedback(true);
          setMessageCount(1);
          setParentName("おうちの人");
          setShowModal(true);
        }
      } catch (error) {
        console.error('親情報の取得エラー:', error);
        // エラー時もテスト表示する
        setShowFeedback(true);
        setMessageCount(1);
        setParentName("おうちの人");
        setShowModal(true);
      }
    };

    fetchParentInfo();
  }, []);

  return (
    <div className="relative min-h-screen">
      <BackgroundDecorations />
      <div className="relative max-w-6xl mx-auto space-y-8 pb-28 z-10">
        <GradientHeader 
          title="ホーム" 
          gradientColors={{
            from: '#3b82f6',
            via: '#ec4899',
            to: '#facc15'
          }}
        />

        {/* 親からのフィードバック通知 */}
        {showFeedback && (
          <ParentFeedbackNotification parentName={parentName} messageCount={messageCount} />
        )}

        {/* メインアクションカード */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-6">
          {/* デバッグ情報 */}
          <div className="hidden">
            親の名前: {parentName}, メッセージ数: {messageCount}, 表示: {showFeedback ? 'true' : 'false'}
          </div>

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

      {/* フィードバックモーダル */}
      {showModal && (
        <FeedbackModal 
          parentName={parentName} 
          messageCount={messageCount} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </div>
  );
}