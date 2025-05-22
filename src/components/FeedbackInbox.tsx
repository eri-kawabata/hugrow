import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ArrowLeft, MessageSquare, Calendar, Star, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { GradientHeader } from '@/components/Common/GradientHeader';

type Feedback = {
  id: string;
  work_id: string;
  message: string;
  created_at: string;
  is_read: boolean;
  parent_name?: string;
  work_title?: string;
  work_thumbnail?: string;
};

export function FeedbackInbox() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('ユーザー情報が取得できませんでした');
        return;
      }

      // プロフィール情報を取得
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, parent_id')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        console.error('プロフィール情報が取得できませんでした');
        return;
      }

      // 親のプロフィール情報を取得
      const { data: parentProfile } = await supabase
        .from('profiles')
        .select('id, username, display_name')
        .eq('id', profile.parent_id)
        .single();

      // フィードバック情報を取得
      const { data, error } = await supabase
        .from('work_feedback')
        .select(`
          id, 
          work_id, 
          message, 
          created_at, 
          is_read,
          works (
            id,
            title,
            thumbnail_url
          )
        `)
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // データの整形
      const formattedFeedbacks = data.map((item: any) => ({
        id: item.id,
        work_id: item.work_id,
        message: item.message,
        created_at: item.created_at,
        is_read: item.is_read,
        parent_name: parentProfile?.display_name || parentProfile?.username || 'おうちの人',
        work_title: item.works?.title || '作品',
        work_thumbnail: item.works?.thumbnail_url
      }));

      setFeedbacks(formattedFeedbacks);

      // 未読のメッセージを既読に更新
      const unreadIds = data.filter((item: any) => !item.is_read).map((item: any) => item.id);
      if (unreadIds.length > 0) {
        await supabase
          .from('work_feedback')
          .update({ is_read: true })
          .in('id', unreadIds);
      }
    } catch (error) {
      console.error('フィードバック取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-24">
      <GradientHeader 
        title="メッセージボックス" 
        gradientColors={{
          from: '#3b82f6',
          via: '#8b5cf6',
          to: '#ec4899'
        }}
      />

      <div className="mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>もどる</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="h-8 w-8 text-indigo-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">メッセージはありません</h3>
          <p className="text-gray-600 mb-6">さくひんを投稿すると、おうちの人からのフィードバックがここに表示されます</p>
          <Link
            to="/child/works/new"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            さくひんをつくる
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((feedback) => (
            <motion.div
              key={feedback.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden border border-indigo-100"
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    <div className="p-2 bg-pink-100 rounded-full mr-3">
                      <Heart className="h-5 w-5 text-pink-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">
                        <span className="text-indigo-600">{feedback.parent_name}</span>
                        さんからのメッセージ
                      </h3>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        <span>{formatDate(feedback.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  {!feedback.is_read && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      新着
                    </span>
                  )}
                </div>

                <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg mb-3">
                  <p className="text-gray-800 whitespace-pre-wrap">{feedback.message}</p>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden mr-3">
                      {feedback.work_thumbnail ? (
                        <img 
                          src={feedback.work_thumbnail} 
                          alt={feedback.work_title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-indigo-50">
                          <Star className="h-6 w-6 text-indigo-300" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        「{feedback.work_title}」へのメッセージです
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/child/works/${feedback.work_id}`}
                    className="flex items-center text-indigo-600 hover:text-indigo-800"
                  >
                    <span className="text-sm">さくひんを見る</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
} 