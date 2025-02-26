import React, { useState, useRef } from 'react';
import { Layout } from './Layout';
import { Camera, Upload, Image, ArrowLeft, Save, Loader2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';

export function CameraUpload() {
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mode, setMode] = useState<'photo' | 'video'>('photo');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: mode === 'video'
      });
      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('カメラへのアクセスに失敗しました');
    }
  };

  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg');
    setCapturedImage(dataUrl);
    stopCamera();
  };

  const startRecording = () => {
    if (!mediaStream) return;

    const mediaRecorder = new MediaRecorder(mediaStream);
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setRecordedVideo(url);
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopCamera();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      // プレビューを作成
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setCapturedImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        const url = URL.createObjectURL(file);
        setRecordedVideo(url);
      }
    }
  };

  const handleSave = async () => {
    if (!supabase || (!capturedImage && !recordedVideo && !selectedFile)) return;

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('ログインが必要です');
        return;
      }

      let blob: Blob;
      let mediaType: 'image' | 'video';
      let fileExt: string;

      if (selectedFile) {
        blob = selectedFile;
        mediaType = selectedFile.type.startsWith('image/') ? 'image' : 'video';
        fileExt = selectedFile.name.split('.').pop() || (mediaType === 'image' ? 'jpg' : 'webm');
      } else if (capturedImage) {
        // Base64データURLからBlobを作成
        const response = await fetch(capturedImage);
        blob = await response.blob();
        mediaType = 'image';
        fileExt = 'jpg';
      } else if (recordedVideo) {
        // 録画したビデオのURLからBlobを取得
        const response = await fetch(recordedVideo);
        blob = await response.blob();
        mediaType = 'video';
        fileExt = 'webm';
      } else {
        throw new Error('No media content');
      }

      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('works')
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('works')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('works')
        .insert([{
          title: title || '撮影した写真',
          description: description || null,
          media_url: publicUrl,
          media_type: mediaType,
          user_id: user.id
        }]);

      if (dbError) throw dbError;

      toast.success('作品を保存しました！');
      navigate('/works');
    } catch (error) {
      console.error('Error:', error);
      toast.error('保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const resetMedia = () => {
    setCapturedImage(null);
    setRecordedVideo(null);
    setSelectedFile(null);
    stopCamera();
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
            <h1 className="text-2xl font-bold">写真・動画を撮影</h1>
          </div>

          {/* Mode Selection */}
          {!mediaStream && !capturedImage && !recordedVideo && !selectedFile && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <button
                onClick={() => {
                  setMode('photo');
                  startCamera();
                }}
                className="p-6 rounded-xl border-2 border-gray-200 hover:border-indigo-300 transition-colors flex flex-col items-center gap-3"
              >
                <Camera className="h-8 w-8 text-indigo-600" />
                <span className="font-medium">写真を撮る</span>
              </button>

              <button
                onClick={() => {
                  setMode('video');
                  startCamera();
                }}
                className="p-6 rounded-xl border-2 border-gray-200 hover:border-indigo-300 transition-colors flex flex-col items-center gap-3"
              >
                <Image className="h-8 w-8 text-indigo-600" />
                <span className="font-medium">動画を撮る</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="sm:col-span-2 p-6 rounded-xl border-2 border-gray-200 hover:border-indigo-300 transition-colors flex flex-col items-center gap-3"
              >
                <Upload className="h-8 w-8 text-indigo-600" />
                <span className="font-medium">ファイルをアップロード</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {/* Camera Preview */}
          {mediaStream && (
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full"
                />
                {mode === 'video' && isRecording && (
                  <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span className="text-sm">録画中</span>
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-4">
                {mode === 'photo' ? (
                  <button
                    onClick={capturePhoto}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2"
                  >
                    <Camera className="h-5 w-5" />
                    <span>撮影</span>
                  </button>
                ) : (
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`px-6 py-3 rounded-xl text-white flex items-center gap-2 ${
                      isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'
                    } transition-colors`}
                  >
                    {isRecording ? (
                      <>
                        <X className="h-5 w-5" />
                        <span>停止</span>
                      </>
                    ) : (
                      <>
                        <Camera className="h-5 w-5" />
                        <span>録画開始</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={() => {
                    stopCamera();
                    setIsRecording(false);
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}

          {/* Captured Media Preview */}
          {(capturedImage || recordedVideo || selectedFile) && (
            <div className="space-y-6">
              <div className="bg-black rounded-lg overflow-hidden">
                {capturedImage && (
                  <img
                    src={capturedImage}
                    alt="撮影した写真"
                    className="w-full"
                  />
                )}
                {recordedVideo && (
                  <video
                    src={recordedVideo}
                    controls
                    className="w-full"
                  />
                )}
              </div>

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

                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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

                  <button
                    onClick={resetMedia}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    やり直す
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default CameraUpload;