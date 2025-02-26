import React, { useState, useRef } from 'react';
import { Layout } from './Layout';
import { Palette, Camera, Mic, Upload, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import type { Work } from '../lib/types';

export function WorkUpload() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'audio'>('image');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMediaFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      toast.error('Supabaseの設定が必要です');
      return;
    }

    if (!mediaFile) {
      toast.error('ファイルを選択してください');
      return;
    }

    if (!title.trim()) {
      toast.error('タイトルを入力してください');
      return;
    }

    try {
      setLoading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('ログインが必要です');
        navigate('/');
        return;
      }

      // Upload media file to Supabase Storage
      const fileExt = mediaFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('works')
        .upload(filePath, mediaFile);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('ファイルのアップロードに失敗しました');
      }

      if (!uploadData) {
        throw new Error('アップロードデータが見つかりません');
      }

      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('works')
        .getPublicUrl(filePath);

      // Create work record in database
      const { error: dbError } = await supabase
        .from('works')
        .insert([{
          title,
          description: description.trim() || null,
          media_url: publicUrl,
          media_type: mediaType,
          user_id: user.id
        }]);

      if (dbError) {
        console.error('Database error:', dbError);
        // Clean up the uploaded file if database insert fails
        await supabase.storage
          .from('works')
          .remove([filePath]);
        throw new Error('データベースの更新に失敗しました');
      }

      toast.success('作品を投稿しました！');
      navigate('/home');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : '投稿に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">作品を投稿する</h1>

        {/* Upload Type Selection */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Link
            to="/drawing"
            className={`p-4 rounded-xl border-2 flex flex-col items-center space-y-2 transition-colors ${
              mediaType === 'image' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
            }`}
          >
            <Palette className="h-8 w-8 text-indigo-600" />
            <span className="text-sm font-medium">絵を描く</span>
          </Link>

          <Link
            to="/camera"
            className={`p-4 rounded-xl border-2 flex flex-col items-center space-y-2 transition-colors ${
              mediaType === 'video' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
            }`}
          >
            <Camera className="h-8 w-8 text-indigo-600" />
            <span className="text-sm font-medium">写真・動画</span>
          </Link>

          <Link
            to="/audio"
            className={`p-4 rounded-xl border-2 flex flex-col items-center space-y-2 transition-colors ${
              mediaType === 'audio' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
            }`}
          >
            <Mic className="h-8 w-8 text-indigo-600" />
            <span className="text-sm font-medium">音声録音</span>
          </Link>
        </div>
      </div>
    </Layout>
  );
}