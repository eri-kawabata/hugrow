import { useEffect, useRef, useState } from 'react';
import { Layout } from './Layout';
import { Camera, RefreshCw, Image, Save, X, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { handleError } from '../utils/errorHandler';

export function CameraCapture() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // カメラの初期化
  const initializeCamera = async (useFrontCamera: boolean = true) => {
    try {
      // 既存のストリームを停止
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      // カメラの制約を設定
      const constraints = {
        video: {
          facingMode: useFrontCamera ? 'user' : 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      // カメラストリームを取得
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);

      // ビデオ要素にストリームを設定
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        await videoRef.current.play();
      }

      // エラー状態をクリア
      setCameraError(null);
    } catch (error) {
      console.error('Camera initialization error:', error);
      setCameraError('カメラをつかえませんでした。カメラをつかってもいいか、きいてみてね。');
      handleError(error as Error, {
        userMessage: 'カメラをつかえませんでした。カメラをつかってもいいか、きいてみてね。'
      });
    }
  };

  // カメラの切り替え
  const toggleCamera = async () => {
    setIsFrontCamera(!isFrontCamera);
    await initializeCamera(!isFrontCamera);
  };

  // 写真を撮る
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // キャンバスのサイズをビデオに合わせる
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // 前面カメラの場合は水平反転
    if (isFrontCamera) {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
    }

    context.drawImage(video, 0, 0);
    setCapturedImage(canvas.toDataURL('image/jpeg'));

    // 撮影効果音
    const shutter = new Audio('/sounds/shutter.mp3');
    shutter.play().catch(() => {
      // 効果音の再生に失敗しても続行
      console.warn('シャッター音の再生に失敗しました');
    });

    // 撮影成功のフィードバック
    toast.success('しゃしんをとったよ！', {
      icon: '📸',
      duration: 2000
    });
  };

  // 写真の保存処理を改善
  const handleSave = async () => {
    if (!capturedImage || !title.trim() || !user) {
      toast.error('タイトルをいれてね');
      return;
    }

    try {
      setLoading(true);

      // Base64データの処理を改善
      const base64Data = capturedImage.split(',')[1]; // Base64文字列からヘッダーを除去
      const blob = await fetch(`data:image/jpeg;base64,${base64Data}`).then(res => res.blob());

      // ファイル名に一意性を持たせる
      const fileName = `photo_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
      const filePath = `works/${user.id}/${fileName}`;

      // 画像サイズの最適化
      const optimizedBlob = await new Promise<Blob>((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1280;
          const MAX_HEIGHT = 720;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
          }, 'image/jpeg', 0.8);
        };
        img.src = capturedImage;
      });

      // アップロード前にストレージの状態確認
      const { data: storageData, error: storageError } = await supabase.storage
        .from('works')
        .list(`${user.id}`);

      if (storageError) {
        console.error('Storage check error:', storageError);
        throw new Error('ストレージの確認に失敗しました');
      }

      // アップロード処理
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('works')
        .upload(filePath, optimizedBlob, {
          cacheControl: '3600',
          contentType: 'image/jpeg',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('画像のアップロードに失敗しました');
      }

      // 公開URLの取得
      const { data: { publicUrl } } = supabase.storage
        .from('works')
        .getPublicUrl(filePath);

      if (!publicUrl) {
        throw new Error('公開URLの取得に失敗しました');
      }

      // データベースに保存
      const { error: dbError } = await supabase
        .from('works')
        .insert([{
          title: title.trim(),
          description: description.trim() || null,
          media_url: publicUrl,
          media_type: 'photo',
          user_id: user.id,
          created_at: new Date().toISOString()
        }]);

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error('データベースの保存に失敗しました');
      }

      toast.success('しゃしんをほぞんしたよ！', {
        icon: '✨',
        duration: 3000
      });
      
      // URLパスに基づいて適切なナビゲーション先を決定
      const isChildRoute = location.pathname.includes('/child/');
      navigate(isChildRoute ? '/child/works' : '/works');

    } catch (error) {
      console.error('Save error:', error);
      handleError(error as Error, {
        userMessage: 'ほぞんできなかったよ。もういちどためしてね。'
      });
    } finally {
      setLoading(false);
      setShowSaveModal(false);
    }
  };

  // コンポーネントのマウント時にカメラを初期化
  useEffect(() => {
    // ユーザーがログインしていない場合は初期化しない
    if (!user) return;
    
    // カメラの初期化
    initializeCamera();

    // クリーンアップ関数
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [user]);

  // ユーザーがログインしていない場合はログインを促す
  if (!user) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">ログインしてください</p>
              </div>
            </div>
          </div>
          <Link
            to={location.pathname.includes('/child/') ? "/child/works/new" : "/works/new"}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>もどる</span>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to={location.pathname.includes('/child/') ? "/child/works/new" : "/works/new"}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>もどる</span>
          </Link>
          <h1 className="text-2xl font-bold">カメラ</h1>
          <div className="flex gap-2">
            <button
              onClick={toggleCamera}
              className="p-3 rounded-full bg-white shadow-sm hover:shadow-md transition-all"
              title={isFrontCamera ? "うしろむきカメラにきりかえ" : "まえむきカメラにきりかえ"}
            >
              <RefreshCw className="h-6 w-6 text-gray-700" />
            </button>
          </div>
        </div>

        {/* カメラエラー表示 */}
        {cameraError && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{cameraError}</p>
              </div>
            </div>
          </div>
        )}

        {/* メインコンテンツ */}
        <div className="relative bg-black rounded-2xl overflow-hidden shadow-xl">
          {capturedImage ? (
            <>
              <img
                src={capturedImage}
                alt="とったしゃしん"
                className="w-full"
                style={{
                  transform: isFrontCamera ? 'scaleX(-1)' : 'none'
                }}
              />
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
                <button
                  onClick={() => setCapturedImage(null)}
                  className="px-6 py-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all flex items-center gap-2"
                >
                  <Camera className="h-5 w-5" />
                  <span>とりなおす</span>
                </button>
                <button
                  onClick={() => setShowSaveModal(true)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all flex items-center gap-2"
                >
                  <Save className="h-5 w-5" />
                  <span>ほぞんする</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full"
                style={{
                  transform: isFrontCamera ? 'scaleX(-1)' : 'none'
                }}
              />
              <canvas ref={canvasRef} className="hidden" />
              <button
                onClick={capturePhoto}
                disabled={!!cameraError}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                title="しゃしんをとる"
              >
                <div className="w-14 h-14 m-1 border-4 border-gray-800 rounded-full" />
              </button>
            </>
          )}
        </div>

        {/* 保存モーダル */}
        {showSaveModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">しゃしんをほぞんする</h2>
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    しゃしんのなまえ
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="たとえば「こうえんでとったしゃしん」"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    メモ
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="しゃしんについてのメモをかいてね"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setShowSaveModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    やめる
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading || !title.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 flex items-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin h-5 w-5" />
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
          </div>
        )}
      </div>
    </Layout>
  );
} 