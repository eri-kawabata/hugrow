import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from './Layout';
import { LoadingState } from './Common/LoadingState';
import { ErrorState } from './Common/ErrorState';
import { useWorks } from '../hooks/useWorks';
import { useParentMode } from '../hooks/useParentMode';
import { useAuth } from '../hooks/useAuth';
import { Loader2, ArrowLeft, Heart, MessageCircle, Award, Star, Music, Camera, Palette, Image } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const WorkCard = ({ work }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { user } = useAuth();

  // お気に入り状態を読み込む
  useEffect(() => {
    const loadFavoriteStatus = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('work_id', work.id);
          
        if (!error && data && data.length > 0) {
          setIsLiked(true);
        }
      } catch (error) {
        console.error('お気に入り情報の取得に失敗しました:', error);
      }
    };
    
    loadFavoriteStatus();
  }, [work.id, user]);

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    try {
      if (isLiked) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user?.id)
          .eq('work_id', work.id);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert([{ user_id: user?.id, work_id: work.id }]);
          
        if (error) throw error;
      }
      
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('お気に入り操作に失敗しました:', error);
      toast.error('お気に入りの更新に失敗しました');
    }
  };

  // 作品タイプに応じたアイコンとグラデーションを取得
  const getTypeStyles = () => {
    switch (work.type) {
      case 'drawing':
        return {
          icon: <Palette className="h-16 w-16 text-indigo-300" />,
          gradient: 'from-blue-50 to-indigo-100'
        };
      case 'audio':
        return {
          icon: <Music className="h-16 w-16 text-pink-300" />,
          gradient: 'from-purple-50 to-pink-100'
        };
      case 'photo':
        return {
          icon: <Camera className="h-16 w-16 text-emerald-300" />,
          gradient: 'from-green-50 to-emerald-100'
        };
      default:
        return {
          icon: <Image className="h-16 w-16 text-gray-300" />,
          gradient: 'from-gray-50 to-gray-200'
        };
    }
  };

  const typeStyles = getTypeStyles();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer relative"
    >
      <div className="relative h-48">
        {work.media_url ? (
          <img
            src={work.media_url}
            alt={work.title}
            className={`w-full h-full object-cover transition-transform duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${typeStyles.gradient} flex items-center justify-center transition-transform duration-300 ${isHovered ? 'scale-105' : 'scale-100'}`}>
            {typeStyles.icon}
          </div>
        )}
        
        {/* フィードバックバッジ */}
        {work.feedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-2 left-2 z-10"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="bg-gradient-to-r from-purple-500 to-blue-500 px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4 text-white" />
              <span className="text-xs font-medium text-white">メッセージあり</span>
            </motion.div>
          </motion.div>
        )}
        
        {/* キラキラエフェクト */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-0 pointer-events-none"
        >
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ 
                scale: [0, 1, 0],
                transition: {
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2
                }
              }}
              className="absolute w-1.5 h-1.5 bg-yellow-300 rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`
              }}
            />
          ))}
        </motion.div>

        {/* バッジ表示 */}
        {work.badges && work.badges.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-2 right-2 flex gap-1"
          >
            {work.badges.map((badge, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.2, rotate: 15 }}
                className="bg-gradient-to-br from-yellow-400 to-yellow-500 p-1.5 rounded-full shadow-lg"
              >
                <Award className="h-4 w-4 text-white" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <div className="p-4">
        <motion.h2 
          className="font-bold text-lg mb-1 text-gray-800 group-hover:text-[#5d7799] transition-colors duration-300"
        >
          {work.title || 'タイトルなし'}
        </motion.h2>
        
        {work.description && (
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">{work.description}</p>
        )}
        
        {/* フィードバックセクション */}
        {work.feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 p-3 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl group-hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center gap-2 text-purple-600 text-sm mb-1">
              <MessageCircle className="h-4 w-4" />
              <span className="font-medium">おうちの人からのメッセージ</span>
            </div>
            <p className="text-sm text-gray-700 line-clamp-2">{work.feedback}</p>
          </motion.div>
        )}
        
        {/* フッター部分 */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {new Date(work.created_at).toLocaleDateString('ja-JP')}
          </div>
          
          <div className="flex items-center gap-3">
            {work.rating && (
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full"
              >
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-yellow-700">{work.rating}</span>
              </motion.div>
            )}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleFavoriteClick}
              className={`p-2 rounded-full transition-all duration-300 ${
                isLiked 
                  ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                  : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
              }`}
            >
              <Heart className={`h-5 w-5 transform transition-transform duration-300 ${isLiked ? 'fill-current scale-110' : 'scale-100'}`} />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export function Works() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isParentMode } = useParentMode();
  const { works, loading, error, fetchWorks } = useWorks();

  // 認証チェック
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [authLoading, user, navigate]);

  if (authLoading || loading) {
    return <LoadingState />;
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <ErrorState
        message="作品の読み込みに失敗しました"
        onRetry={fetchWorks}
      />
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="もどる"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold">
            {isParentMode ? "作品一覧" : "わたしのさくひん"}
          </h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : works.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {works.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {isParentMode ? 
                "まだ作品がありません" : 
                "まださくひんがないよ！"
              }
            </p>
            <p className="text-gray-500 mt-2">
              {isParentMode ? 
                "子供が作品を作成すると、ここに表示されます" : 
                "おえかきやしゃしんをとってみよう！"
              }
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
} 