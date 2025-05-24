import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eraser, Palette, Save, Undo, Redo, Trash2, X, Loader2, RotateCcw, Download, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useParentMode } from '../hooks/useParentMode';
import { handleError } from '../utils/errorHandler';

type Point = {
  x: number;
  y: number;
};

// ブラシサイズの定義を更新
const BRUSH_SIZES = {
  min: 1,
  max: 50,
  default: 8,
  step: 1
};

function ColorPicker({ color, onChange }: { color: string; onChange: (color: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="w-16 h-16 rounded-lg cursor-pointer"
          title="すきないろをえらぶ"
        />
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">
            すきないろをつくれるよ！
          </p>
          <div 
            className="h-8 w-full rounded-lg border-2 border-gray-200"
            style={{ backgroundColor: color }}
          />
        </div>
      </div>
    </div>
  );
}

function BrushSizePicker({ size, onChange }: { size: number; onChange: (size: number) => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
          <div 
            className="rounded-full bg-current" 
            style={{ 
              width: `${Math.min(size, 32)}px`, 
              height: `${Math.min(size, 32)}px` 
            }} 
          />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">
            ふでのふとさ: {size}
          </p>
          <input
            type="range"
            min={BRUSH_SIZES.min}
            max={BRUSH_SIZES.max}
            step={BRUSH_SIZES.step}
            value={size}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>
      </div>
    </div>
  );
}

export function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(BRUSH_SIZES.default);
  const [isEraser, setIsEraser] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();
  const lastPoint = useRef<Point | null>(null);

  const { user, loading: authLoading } = useAuth();
  const { isParentMode } = useParentMode();
  
  // useOptimizedResourcesフックを削除し、代わりにuseEffectで初期化を行う
  useEffect(() => {
    // ローカルストレージにキャッシュがあるか確認
    const cacheKey = 'drawing-resources';
    const cached = localStorage.getItem(cacheKey);
    if (!cached) {
      // キャッシュがなければ保存
      localStorage.setItem(cacheKey, 'true');
    }
  }, []);

  // キャンバスのサイズを設定
  const setCanvasSize = (canvas: HTMLCanvasElement) => {
    const parent = canvas.parentElement;
    if (!parent) return;

    // コンテナの幅に基づいてキャンバスサイズを計算
    const containerWidth = Math.min(parent.clientWidth - 32, 800); // 最大幅を800pxに制限
    const containerHeight = Math.min(window.innerHeight * 0.6, 600);

    // キャンバスの物理サイズを設定
    canvas.width = containerWidth;
    canvas.height = containerHeight;

    // キャンバスのスタイルサイズを設定
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;
  };

  // キャンバスの初期化
  useEffect(() => {
    console.log('キャンバスを初期化します');
    const canvas = canvasRef.current;
    if (!canvas) return;

    // キャンバスのサイズを設定
    setCanvasSize(canvas);

    // コンテキストの取得と設定
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;
    
    contextRef.current = context;

    // 背景を白に設定
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // コンテキストの初期設定
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = isEraser ? '#ffffff' : color;
    context.lineWidth = brushSize;

    // 初期状態を履歴に保存
    const initialImageData = context.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([initialImageData]);
    setHistoryIndex(0);

    // リサイズハンドラー
    const handleResize = () => {
      if (!canvas || !context) return;
      
      // 現在の描画内容を保存
      const currentImageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // キャンバスサイズを更新
      setCanvasSize(canvas);
      
      // 描画内容を復元
      context.putImageData(currentImageData, 0, 0);
      
      // コンテキスト設定を再適用
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.strokeStyle = isEraser ? '#ffffff' : color;
      context.lineWidth = brushSize;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []); // 依存配列を空に

  // 描画設定の更新
  useEffect(() => {
    const ctx = contextRef.current;
    if (!ctx) return;
    
    // 描画設定を更新
    ctx.strokeStyle = isEraser ? '#ffffff' : color;
    ctx.lineWidth = brushSize;
  }, [color, brushSize, isEraser]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    console.log('描画開始');
    const ctx = contextRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    // 描画状態を開始
    setIsDrawing(true);
    
    // 開始点を取得
    const point = getCanvasPoint(e);
    lastPoint.current = point;
    
    // 新しいパスを開始
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    
    // 点を描画（クリックだけの場合にも点が表示されるように）
    ctx.arc(point.x, point.y, ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    
    // 描画中でない場合は何もしない
    if (!isDrawing) return;
    
    const ctx = contextRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas || !lastPoint.current) return;

    // 現在の点を取得
    const currentPoint = getCanvasPoint(e);
    
    // 線を描画
    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(currentPoint.x, currentPoint.y);
    ctx.stroke();
    
    // 現在の点を次の開始点として保存
    lastPoint.current = currentPoint;
  };

  const stopDrawing = () => {
    // 描画中でない場合は何もしない
    if (!isDrawing) return;
    
    const ctx = contextRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    
    // パスを閉じる
    ctx.closePath();
    
    // 履歴に現在の状態を保存
    const currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(currentImageData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    // 描画状態を終了
    setIsDrawing(false);
    lastPoint.current = null;
  };

  const undo = () => {
    if (!contextRef.current || historyIndex <= 0) return;
    
    const newIndex = historyIndex - 1;
    const imageData = history[newIndex];
    contextRef.current.putImageData(imageData, 0, 0);
    setHistoryIndex(newIndex);
  };

  const redo = () => {
    if (!contextRef.current || historyIndex >= history.length - 1) return;
    
    const newIndex = historyIndex + 1;
    const imageData = history[newIndex];
    contextRef.current.putImageData(imageData, 0, 0);
    setHistoryIndex(newIndex);
  };

  const clearCanvas = () => {
    if (!contextRef.current || !canvasRef.current) return;
    
    contextRef.current.fillStyle = '#ffffff';
    contextRef.current.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    const currentImageData = contextRef.current.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(currentImageData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const resetCanvas = () => {
    clearCanvas();
    setIsEraser(false);
    setColor('#000000');
    setBrushSize(BRUSH_SIZES.default);
    setShowColorPicker(false);
  };

  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    // キャンバスの位置とサイズを取得
    const rect = canvas.getBoundingClientRect();
    
    // キャンバスの物理サイズとスタイルサイズの比率を計算
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    // タッチイベントの場合
    if ('touches' in e && e.touches.length > 0) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      };
    }
    
    // マウスイベントの場合
    if ('clientX' in e) {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }
    
    return { x: 0, y: 0 };
  };

  const handleSave = async () => {
    if (!canvasRef.current) return;
    
    try {
      setLoading(true);
      
      // キャンバスの内容をデータURLとして取得
      const dataUrl = canvasRef.current.toDataURL('image/png');
      
      // ファイル名を生成（タイムスタンプを含む）
      const timestamp = new Date().getTime();
      const fileName = `drawing_${timestamp}.png`;
      
      // データURLをBlobに変換
      const blob = await (await fetch(dataUrl)).blob();
      
      // 子供モードの場合は選択された子供のIDを使用
      const childUserId = localStorage.getItem('selectedChildUserId');
      const effectiveUserId = childUserId || user.id;
      
      // ユーザーIDをフォルダ名として含める
      const filePath = `${effectiveUserId}/${fileName}`;
      
      console.log('【デバッグ】作品保存時のファイルパス:', filePath);
      
      // Supabaseのストレージにアップロード
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('works')
        .upload(filePath, blob, {
          contentType: 'image/png',
          cacheControl: '3600',
        });
      
      if (uploadError) {
        console.error('アップロードエラー:', uploadError);
        throw uploadError;
      }
      
      // アップロードされたファイルのURLを取得
      const { data: { publicUrl } } = supabase.storage.from('works').getPublicUrl(filePath);
      
      console.log('【デバッグ】作品保存時のユーザーID:', {
        childUserId,
        userId: user.id,
        effectiveUserId
      });
      
      // プロファイルIDを取得
      let profileId = null;
      
      // 選択中の子供プロファイルIDを直接取得（ローカルストレージから）
      const selectedChildProfileId = localStorage.getItem('selectedChildProfileId') || localStorage.getItem('selectedChildId');
      
      if (selectedChildProfileId) {
        // ローカルストレージに選択中の子供プロファイルIDがある場合はそれを使用
        profileId = selectedChildProfileId;
        console.log('【デバッグ】ローカルストレージから取得したプロファイルID:', profileId);
      } else {
        // ローカルストレージにない場合はデータベースから取得（フォールバック）
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', effectiveUserId)
          .eq('role', 'child')
          .single();
          
        if (profileError) {
          console.error('プロファイル取得エラー:', profileError);
        } else if (profileData) {
          profileId = profileData.id;
          console.log('【デバッグ】データベースから取得したプロファイルID:', profileId);
        }
      }
      
      if (!profileId) {
        throw new Error('プロファイルIDが取得できませんでした。子供を選択してください。');
      }
      
      // データベースに作品情報を保存
      const { data: workData, error: workError } = await supabase
        .from('works')
        .insert([
          {
            title: title || '無題の絵',
            description: description || null,
            content_url: publicUrl,
            type: 'drawing',
            user_id: effectiveUserId,
            profile_id: profileId,
          },
        ])
        .select();
      
      if (workError) {
        throw workError;
      }
      
      console.log('作品保存成功:', workData);
      toast.success('絵を保存しました！');
      
      // 作品保存イベントを発火（作品一覧の更新をトリガー）
      window.dispatchEvent(new CustomEvent('workCreated', {
        detail: { work: workData[0] }
      }));
      
      // 保存後に新しいキャンバスを用意
      resetCanvas();
      setTitle('');
      setDescription('');
      setShowSaveModal(false);
      
      // 作品一覧に戻る
      navigate('/child/works');
    } catch (error) {
      console.error('保存エラー:', error);
      toast.error('保存中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const downloadDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'my-drawing.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // 条件付きレンダリングを修正
  if (authLoading) {
    return null;
  }

  if (!user || isParentMode) {
    return null;
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto px-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <Link
          to="/child/works/new"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>もどる</span>
        </Link>
      </div>

      {/* メインコンテンツ */}
      <div className="space-y-6">
        {/* ツールバー */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div
              className="w-6 h-6 rounded-full border-2 border-gray-200"
              style={{ backgroundColor: color }}
            />
            <span>色を変える</span>
          </button>

          <button
            onClick={() => setIsEraser(!isEraser)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-shadow ${
              isEraser ? 'bg-indigo-100 text-indigo-600' : 'bg-white'
            }`}
          >
            <Eraser className="h-5 w-5" />
            <span>消しゴム</span>
          </button>

          {/* ペンの太さ設定 */}
          <div className="flex-1 min-w-[200px] bg-white rounded-lg shadow-sm p-2">
            <BrushSizePicker size={brushSize} onChange={setBrushSize} />
          </div>

          {/* 他のボタン */}
          <div className="flex gap-2">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow disabled:opacity-50"
            >
              <Undo className="h-5 w-5" />
              <span>もどす</span>
            </button>

            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow disabled:opacity-50"
            >
              <Redo className="h-5 w-5" />
              <span>やりなおす</span>
            </button>

            <button
              onClick={clearCanvas}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <Trash2 className="h-5 w-5" />
              <span>全部消す</span>
            </button>
          </div>
        </div>

        {/* カラーピッカー */}
        {showColorPicker && (
          <div className="p-4 bg-white rounded-xl shadow-lg">
            <ColorPicker color={color} onChange={setColor} />
          </div>
        )}

        {/* キャンバス */}
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full touch-none bg-white rounded-lg border-2 border-gray-200"
            style={{ touchAction: 'none' }}
          />
        </div>

        {/* 保存ボタン */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowSaveModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
          >
            <Save className="h-5 w-5" />
            <span>保存する</span>
          </button>
        </div>
      </div>

      {/* 保存モーダル */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">作品を保存する</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  タイトル
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="タイトルを入力してください"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="説明を入力してください"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading || !title.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>保存中...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      <span>保存する</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to get a color from a gradient
function getColorFromGradient(from: string, to: string, percentage: number): string {
  const fromRGB = hexToRGB(from);
  const toRGB = hexToRGB(to);

  const r = Math.round(fromRGB.r + (toRGB.r - fromRGB.r) * percentage);
  const g = Math.round(fromRGB.g + (toRGB.g - fromRGB.g) * percentage);
  const b = Math.round(fromRGB.b + (toRGB.b - fromRGB.b) * percentage);

  return rgbToHex(r, g, b);
}

function hexToRGB(hex: string): { r: number; g: number; b: number } {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

export default DrawingCanvas;