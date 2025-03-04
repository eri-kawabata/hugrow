import React, { useState, useRef, useEffect } from 'react';
import { Layout } from './Layout';
import { Mic, Square, Save, Play, Pause, Loader2, ArrowLeft, Info } from 'lucide-react';
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
          <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                to={location.pathname.includes('/child/') ? "/child/works/new" : "/works/new"}
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors p-2 rounded-lg hover:bg-indigo-50"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">もどる</span>
              </Link>
            </div>
            <h1 className="text-xl font-bold text-center bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
              <div className="flex items-center gap-2">
                <Mic className="h-6 w-6 text-indigo-600" />
                <span>おとをろくおん</span>
              </div>
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => setShowTips(!showTips)}
                className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-all"
                title="つかいかた"
              >
                <Info className="h-5 w-5" />
              </button>
            </div>
          </div>

          {showTips && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 animate-fadeIn">
              <h3 className="font-bold text-blue-800 mb-2">つかいかた</h3>
              <ul className="space-y-2 text-blue-700 text-sm">
                <li className="flex items-start gap-2">
                  <span className="font-bold">1.</span>
                  <span>「録音を開始」ボタンをおして、おとをろくおんします</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">2.</span>
                  <span>「録音を停止」ボタンをおすと、ろくおんがおわります</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">3.</span>
                  <span>「再生」ボタンでろくおんしたおとをきくことができます</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">4.</span>
                  <span>「やり直す」ボタンでさいしょからやりなおせます</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">5.</span>
                  <span>タイトルとせつめいをかいて「保存する」ボタンをおします</span>
                </li>
              </ul>
              <button 
                onClick={() => setShowTips(false)}
                className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                とじる
              </button>
            </div>
          )}

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
                  } transition-colors duration-200 shadow-md hover:shadow-lg transform hover:scale-105`}
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
                    className="px-6 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
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
                    className="px-6 py-3 rounded-xl font-bold border border-gray-300 hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md"
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

                <div className="space-y-4 mt-8 border-t pt-6 border-gray-200">
                  <h3 className="font-bold text-lg text-gray-800">さくひんをほぞん</h3>
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      タイトル <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                      placeholder="さくひんのタイトルをにゅうりょく"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      せつめい
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                      placeholder="さくひんのせつめいをにゅうりょく"
                      rows={4}
                    />
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={loading || !title.trim()}
                    className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md mt-4"
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
                  {!title.trim() && (
                    <p className="text-red-500 text-sm mt-1">タイトルをにゅうりょくしてください</p>
                  )}
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