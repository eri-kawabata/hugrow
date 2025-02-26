import React, { useState, useRef, useEffect } from 'react';
import { Layout } from './Layout';
import { Mic, Square, Save, Play, Pause, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';

export function AudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, []);

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

  const handleSave = async () => {
    if (!audioURL || !supabase) return;

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('ログインが必要です');
        return;
      }

      // Blobを取得
      const response = await fetch(audioURL);
      const blob = await response.blob();

      // ファイル名を生成
      const fileName = `${Math.random()}.wav`;
      const filePath = `${user.id}/${fileName}`;

      // Supabaseにアップロード
      const { error: uploadError } = await supabase.storage
        .from('works')
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      // 公開URLを取得
      const { data: { publicUrl } } = supabase.storage
        .from('works')
        .getPublicUrl(filePath);

      // データベースに記録
      const { error: dbError } = await supabase
        .from('works')
        .insert([{
          title: title || '録音した音声',
          description: description || null,
          media_url: publicUrl,
          media_type: 'audio',
          user_id: user.id
        }]);

      if (dbError) throw dbError;

      toast.success('音声を保存しました！');
      navigate('/works');
    } catch (error) {
      console.error('Error:', error);
      toast.error('保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-8">
            <Link
              to="/works/new"
              className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>戻る</span>
            </Link>
            <h1 className="text-2xl font-bold">音声を録音</h1>
          </div>

          <div className="space-y-6">
            {/* Recording Controls */}
            <div className="flex flex-col items-center gap-4">
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
                <div className={`relative w-24 h-24 rounded-full flex items-center justify-center ${
                  isRecording ? 'bg-red-100 animate-pulse' : 'bg-gray-100'
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
              {isRecording && (
                <div className="text-xl font-bold text-red-600 animate-pulse">
                  {formatTime(recordingTime)}
                </div>
              )}

              {!audioURL ? (
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 ${
                    isRecording
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  } transition-colors duration-200`}
                >
                  {isRecording ? (
                    <>
                      <Square className="h-5 w-5" />
                      <span>録音を停止</span>
                    </>
                  ) : (
                    <>
                      <Mic className="h-5 w-5" />
                      <span>録音を開始</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="flex items-center gap-4">
                  <button
                    onClick={togglePlayback}
                    className="px-6 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors duration-200 flex items-center gap-2"
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
                    onClick={() => {
                      setAudioURL(null);
                      setIsPlaying(false);
                      setRecordingTime(0);
                    }}
                    className="px-6 py-3 rounded-xl font-bold border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                  >
                    やり直す
                  </button>
                </div>
              )}
            </div>

            {audioURL && (
              <>
                <audio
                  ref={audioRef}
                  src={audioURL}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />

                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      タイトル
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="作品のタイトルを入力"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      説明
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="作品の説明を入力"
                      rows={4}
                    />
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin h-5 w-5" />
                    ) : (
                      <>
                        <Save className="h-5 w-5" />
                        <span>保存する</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default AudioRecorder;