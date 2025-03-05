import React, { useState, useRef, useEffect } from 'react';
import { BaseLayout } from './layouts/BaseLayout';
import { Mic, Square, Save, Play, Pause, Loader2, ArrowLeft, Info, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useNavigate, Link, useLocation } from 'react-router-dom';

export function AudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [showTips, setShowTips] = useState(false);
  const [titleError, setTitleError] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, []);

  // タイトルが入力されたらエラーをクリア
  useEffect(() => {
    if (title.trim()) {
      setTitleError(false);
    }
  }, [title]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // 録音開始のフィードバック
      toast.success('ろくおんをかいしします！', {
        icon: '🎙️',
        duration: 2000
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('マイクへのアクセスに失敗しました');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // ストリームを停止
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      // タイマーを停止
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }

      // 録音停止のフィードバック
      toast.success('ろくおんをていしします！', {
        icon: '✅',
        duration: 2000
      });
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetRecording = () => {
    setAudioURL(null);
    setRecordingTime(0);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleSave = async () => {
    if (!audioURL) {
      toast.error('録音データがありません');
      return;
    }
    
    if (!supabase) {
      toast.error('Supabaseクライアントが初期化されていません');
      console.error('Supabase client is not initialized');
      return;
    }

    // タイトルのバリデーション
    if (!title.trim()) {
      setTitleError(true);
      toast.error('タイトルをいれてね');
      return;
    }

    try {
      setLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        throw new Error(`認証エラー: ${authError.message}`);
      }
      
      if (!user) {
        toast.error('ログインが必要です');
        return;
      }

      // Blobを取得
      const response = await fetch(audioURL);
      const blob = await response.blob();

      // ファイル名を生成
      const fileName = `audio_${Date.now()}_${Math.random().toString(36).substring(7)}.wav`;
      const filePath = `${user.id}/${fileName}`;  // パスを修正: user.idディレクトリ直下に保存

      console.log('Uploading to path:', filePath);
      console.log('User ID:', user.id);
      
      // Supabaseにアップロード
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('works')
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: true  // 既存ファイルがある場合は上書き
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        
        // RLSエラーの場合、別の方法を試みる
        if (uploadError.message.includes('row-level security policy')) {
          toast.error('セキュリティポリシーによりアップロードできません。管理者に連絡してください。');
          return;
        }
        
        throw new Error(`アップロードエラー: ${uploadError.message}`);
      }

      console.log('Upload successful:', uploadData);

      // 公開URLを取得
      const { data: { publicUrl } } = supabase.storage
        .from('works')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl);
      
      // データベースに記録
      const { error: dbError, data: insertData } = await supabase
        .from('works')
        .insert([{
          title: title.trim(),
          description: description.trim() || null,
          type: 'audio',
          content_url: publicUrl,
          user_id: user.id,
          status: 'published',  // ステータスを明示的に設定
          visibility: 'public', // 可視性を明示的に設定
          created_at: new Date().toISOString()
        }])
        .select();

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error(`データベースエラー: ${dbError.message}`);
      }

      console.log('Database insert successful:', insertData);

      toast.success('おとをほぞんしました！', {
        icon: '🎵',
        duration: 3000
      });
      
      // URLパスに基づいて適切なナビゲーション先を決定
      const isChildRoute = location.pathname.includes('/child/');
      navigate(isChildRoute ? '/child/works' : '/works');

    } catch (error) {
      console.error('Error saving audio:', error);
      toast.error(`ほぞんできませんでした: ${error instanceof Error ? error.message : '不明なエラー'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseLayout hideHeader={true}>
      <div className="min-h-screen bg-[#f8fbfd] pb-8">
        {/* カスタムヘッダー */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-16 flex items-center justify-between">
              {/* 左側：戻るボタン */}
              <div className="w-1/3 flex justify-start">
                <Link 
                  to="/child/works/new" 
                  className="flex items-center gap-2 py-2 px-3 rounded-full text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>もどる</span>
                </Link>
              </div>
              
              {/* 中央：タイトル */}
              <div className="w-1/3 flex justify-center">
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  おとをろくおんする
                </h1>
              </div>
              
              {/* 右側：使い方ボタン */}
              <div className="w-1/3 flex justify-end">
                <button
                  onClick={() => setShowTips(!showTips)}
                  className="flex items-center gap-2 py-2 px-4 rounded-full text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Info className="h-5 w-5" />
                  <span>つかいかた</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* 使い方モーダル */}
        {showTips && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
              <h3 className="text-lg font-bold text-gray-800 mb-4">おとをろくおんするつかいかた</h3>
              <div className="space-y-3 text-gray-600">
                <p className="flex items-start gap-2">
                  <span className="bg-indigo-100 text-indigo-800 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                  <span>「ろくおんする」ボタンをおして、おとをろくおんしよう</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="bg-indigo-100 text-indigo-800 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                  <span>おわったら「ていし」ボタンをおそう</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="bg-indigo-100 text-indigo-800 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                  <span>ろくおんしたおとをきいてみよう</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="bg-indigo-100 text-indigo-800 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                  <span>タイトルをつけて「ほぞんする」ボタンをおそう</span>
                </p>
              </div>
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setShowTips(false)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
                >
                  とじる
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-white rounded-xl shadow-md p-6 sm:p-8">
            <div className="space-y-8">
              {/* 録音コントロール */}
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  {/* マイクアイコンの周りのリング */}
                  <div className={`absolute inset-0 rounded-full ${
                    isRecording ? 'animate-[ping_1s_ease-in-out_infinite]' : ''
                  } bg-red-400 opacity-20`} />
                  
                  {/* 波紋エフェクト */}
                  {isRecording && (
                    <>
                      <div className="absolute inset-0 rounded-full animate-[ping_2s_ease-in-out_infinite] bg-red-400 opacity-10" />
                      <div className="absolute inset-0 rounded-full animate-[ping_3s_ease-in-out_infinite] bg-red-400 opacity-5" />
                    </>
                  )}

                  {/* メインのマイクアイコン */}
                  <div className={`relative w-24 h-24 rounded-full flex items-center justify-center shadow-lg ${
                    isRecording ? 'bg-red-100 animate-pulse' : 'bg-gray-100 hover:bg-gray-200 transition-colors'
                  }`}>
                    <Mic className={`h-12 w-12 ${
                      isRecording ? 'text-red-600' : 'text-gray-600'
                    }`} />
                  </div>

                  {/* 録音インジケーター */}
                  {isRecording && (
                    <div className="absolute -top-2 -right-2">
                      <div className="w-4 h-4 bg-red-600 rounded-full animate-pulse" />
                    </div>
                  )}
                </div>

                {/* 録音時間 */}
                <div className="text-xl font-bold text-center min-h-[2rem]">
                  {isRecording ? (
                    <span className="text-red-600 animate-pulse">{formatTime(recordingTime)}</span>
                  ) : (
                    audioURL && <span className="text-gray-700">{formatTime(recordingTime)}</span>
                  )}
                </div>

                {/* 録音コントロールボタン */}
                <div className="flex flex-wrap justify-center gap-4">
                  {!isRecording && !audioURL && (
                    <button
                      onClick={startRecording}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center gap-2 shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                    >
                      <Mic className="h-5 w-5" />
                      <span>録音を開始</span>
                    </button>
                  )}

                  {isRecording && (
                    <button
                      onClick={stopRecording}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-full flex items-center gap-2 shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                    >
                      <Square className="h-5 w-5" />
                      <span>録音を停止</span>
                    </button>
                  )}

                  {audioURL && !isRecording && (
                    <>
                      <button
                        onClick={togglePlayback}
                        className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full flex items-center gap-2 shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="h-5 w-5" />
                            <span>一時停止</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-5 w-5" />
                            <span>再生</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={resetRecording}
                        className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-full flex items-center gap-2 shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                      >
                        <RefreshCw className="h-5 w-5" />
                        <span>やり直す</span>
                      </button>
                    </>
                  )}
                </div>

                {/* オーディオプレーヤー */}
                {audioURL && (
                  <audio
                    ref={audioRef}
                    src={audioURL}
                    onEnded={() => setIsPlaying(false)}
                    className="hidden"
                  />
                )}
              </div>

              {/* 保存フォーム */}
              {audioURL && !isRecording && (
                <div className="mt-8 bg-gray-50 p-6 rounded-xl shadow-inner">
                  <h3 className="text-lg font-bold text-gray-700 mb-4">さくひんをほぞんする</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        タイトル <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={`w-full px-4 py-2 border ${titleError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                        placeholder="おとのタイトルをいれてね"
                      />
                      {titleError && (
                        <p className="mt-1 text-sm text-red-600">タイトルをいれてね</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        せつめい
                      </label>
                      <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        placeholder="どんなおとか、せつめいをかいてね（なくてもOK）"
                      />
                    </div>
                    
                    <div className="flex justify-center pt-2">
                      <button
                        onClick={handleSave}
                        disabled={loading || !title.trim()}
                        className={`px-6 py-3 rounded-full flex items-center gap-2 shadow-md hover:shadow-lg transition-all transform hover:scale-105 ${
                          loading || !title.trim() 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>ほぞんちゅう...</span>
                          </>
                        ) : (
                          <>
                            <Save className="h-5 w-5" />
                            <span>ほぞんする</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}

export default AudioRecorder;