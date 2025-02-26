import React, { useState, useEffect } from 'react';
import { Layout } from './Layout';
import {
  Calculator, Palette, ArrowLeft, CheckCircle, Save, Download,
  Share2, Lightbulb, Users, MessageCircle, Trophy, Star
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

type Participant = {
  id: string;
  name: string;
  avatar: string;
  status: 'active' | 'completed';
};

type Comment = {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  text: string;
  timestamp: string;
};

export function Challenge() {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [colors, setColors] = useState<string[]>(Array(10).fill(''));
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showCollabModal, setShowCollabModal] = useState(false);
  const navigate = useNavigate();

  const colorOptions = [
    { name: '赤', value: '#ef4444' },
    { name: 'オレンジ', value: '#f97316' },
    { name: '黄色', value: '#eab308' },
    { name: '緑', value: '#22c55e' },
    { name: '水色', value: '#0ea5e9' },
    { name: '青', value: '#3b82f6' },
    { name: '紫', value: '#a855f7' },
    { name: 'ピンク', value: '#ec4899' }
  ];

  useEffect(() => {
    fetchParticipants();
    fetchComments();
  }, []);

  const fetchParticipants = async () => {
    // ダミーデータ
    setParticipants([
      {
        id: '1',
        name: 'さくら',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sakura',
        status: 'active'
      },
      {
        id: '2',
        name: 'はると',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Haruto',
        status: 'completed'
      }
    ]);
  };

  const fetchComments = async () => {
    // ダミーデータ
    setComments([
      {
        id: '1',
        user: {
          name: 'はると',
          avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Haruto'
        },
        text: '赤と青を使うと、とても綺麗だね！',
        timestamp: '5分前'
      }
    ]);
  };

  const handleNumberSelect = (number: number) => {
    if (selectedNumbers.includes(number)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== number));
    } else {
      setSelectedNumbers([...selectedNumbers, number]);
    }
  };

  const handleColorSelect = (number: number, color: string) => {
    const newColors = [...colors];
    newColors[number - 1] = color;
    setColors(newColors);
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now().toString(),
      user: {
        name: 'あなた',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=You'
      },
      text: newComment,
      timestamp: '今'
    };

    setComments([comment, ...comments]);
    setNewComment('');
    toast.success('コメントを投稿しました！');
  };

  const handleSave = async () => {
    if (!supabase) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('ログインが必要です');
        return;
      }

      toast.success('作品を保存しました！');
    } catch (error) {
      console.error('Error:', error);
      toast.error('保存に失敗しました');
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/learning')}
              className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>戻る</span>
            </button>
            <h1 className="text-2xl font-bold">数と色のハーモニー</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowCollabModal(true)}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
            >
              <Users className="h-5 w-5" />
              <span>友達を招待</span>
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <Save className="h-5 w-5" />
              <span>保存</span>
            </button>
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <Share2 className="h-5 w-5" />
              <span>共有</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Panel - Numbers & Colors */}
          <div className="lg:col-span-2 space-y-8">
            {/* Numbers */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Calculator className="h-5 w-5 text-indigo-600" />
                数を選ぼう
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 10 }, (_, i) => i + 1).map(number => (
                  <button
                    key={number}
                    onClick={() => handleNumberSelect(number)}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      selectedNumbers.includes(number)
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <span className="text-2xl font-bold">{number}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Palette className="h-5 w-5 text-indigo-600" />
                色を選ぼう
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {colorOptions.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => selectedNumbers.forEach(number => handleColorSelect(number, color.value))}
                    className="p-4 rounded-xl border-2 border-gray-200 hover:border-indigo-300 transition-all flex items-center gap-3"
                  >
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: color.value }}
                    />
                    <span>{color.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Middle Panel - Canvas */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-indigo-600" />
              作品
            </h2>
            <div className="aspect-square bg-gray-100 rounded-xl p-4">
              <div className="grid grid-cols-5 grid-rows-2 gap-2 h-full">
                {colors.map((color, index) => (
                  <div
                    key={index}
                    className="rounded-lg flex items-center justify-center text-2xl font-bold transition-all"
                    style={{
                      backgroundColor: color || '#f3f4f6',
                      color: color ? 'white' : '#6b7280'
                    }}
                  >
                    {index + 1}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  toast.success('チャレンジ完了！');
                  navigate('/learning');
                }}
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <CheckCircle className="h-5 w-5" />
                完了
              </button>
            </div>
          </div>

          {/* Right Panel - Collaboration */}
          <div className="space-y-8">
            {/* Participants */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-600" />
                参加者
              </h2>
              <div className="space-y-4">
                {participants.map(participant => (
                  <div key={participant.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={participant.avatar}
                        alt={participant.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <span className="font-medium">{participant.name}</span>
                    </div>
                    {participant.status === 'completed' ? (
                      <Trophy className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-indigo-600" />
                コメント
              </h2>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="コメントを書く..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleCommentSubmit}
                    disabled={!newComment.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    送信
                  </button>
                </div>
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {comments.map(comment => (
                    <div key={comment.id} className="flex gap-3">
                      <img
                        src={comment.user.avatar}
                        alt={comment.user.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{comment.user.name}</span>
                          <span className="text-sm text-gray-500">{comment.timestamp}</span>
                        </div>
                        <p className="text-gray-700">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-indigo-50 rounded-xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-indigo-600" />
            ヒント
          </h2>
          <ul className="space-y-2 text-gray-700">
            <li>• 大きな数には暖かい色（赤、オレンジ、黄色）を使ってみよう</li>
            <li>• 小さな数には涼しい色（水色、青、紫）を使ってみよう</li>
            <li>• 隣り合う数字は似た色を使うと調和が生まれるよ</li>
            <li>• 反対の数字には反対の色を使うとおもしろいね</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}