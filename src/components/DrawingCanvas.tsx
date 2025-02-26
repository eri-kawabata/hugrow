import React, { useRef, useState, useEffect } from 'react';
import { Layout } from './Layout';
import { Eraser, Palette, Save, Undo, Redo, Trash2, X, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

type Point = {
  x: number;
  y: number;
};

export function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(5);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  const baseColors = [
    { from: '#ff0000', to: '#ff9900', name: '赤' },
    { from: '#ff9900', to: '#ffff00', name: 'オレンジ' },
    { from: '#ffff00', to: '#00ff00', name: '黄色' },
    { from: '#00ff00', to: '#00ffff', name: '緑' },
    { from: '#00ffff', to: '#0000ff', name: '水色' },
    { from: '#0000ff', to: '#ff00ff', name: '青' },
    { from: '#ff00ff', to: '#ff0000', name: '紫' }
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      // デバイスピクセル比を考慮
      const dpr = window.devicePixelRatio || 1;
      const displayWidth = parent.clientWidth - 32;
      const displayHeight = 600;

      // キャンバスの実際のサイズを設定
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;

      // キャンバスの表示サイズを設定
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;

      // コンテキストのスケールを設定
      context.scale(dpr, dpr);

      // 背景を白に設定
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, displayWidth, displayHeight);

      // 線のスタイルを設定
      context.lineCap = 'round';
      context.lineJoin = 'round';
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setCtx(context);
    saveToHistory(context.getImageData(0, 0, canvas.width, canvas.height));

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const saveToHistory = (imageData: ImageData) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(imageData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex <= 0 || !ctx || !canvasRef.current) return;
    
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    ctx.putImageData(history[newIndex], 0, 0);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1 || !ctx || !canvasRef.current) return;
    
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    ctx.putImageData(history[newIndex], 0, 0);
  };

  const clearCanvas = () => {
    if (!ctx || !canvasRef.current) return;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    saveToHistory(ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height));
  };

  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * (canvas.width / (rect.width * dpr)),
        y: (touch.clientY - rect.top) * (canvas.height / (rect.height * dpr))
      };
    } else {
      return {
        x: (e.clientX - rect.left) * (canvas.width / (rect.width * dpr)),
        y: (e.clientY - rect.top) * (canvas.height / (rect.height * dpr))
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!ctx) return;
    e.preventDefault();
    
    setIsDrawing(true);
    const point = getCanvasPoint(e);
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth = lineWidth;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctx) return;
    e.preventDefault();
    
    const point = getCanvasPoint(e);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing || !ctx || !canvasRef.current) return;
    
    ctx.closePath();
    setIsDrawing(false);
    saveToHistory(ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height));
  };

  const handleSave = async () => {
    if (!canvasRef.current || !supabase || !title.trim()) {
      toast.error('タイトルを入力してください');
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('ログインが必要です');
        return;
      }

      const blob = await new Promise<Blob>((resolve) => {
        canvasRef.current?.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/png');
      });

      const fileName = `${Math.random()}.png`;
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
          title: title.trim(),
          description: description.trim() || null,
          media_url: publicUrl,
          media_type: 'image',
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
      setShowSaveModal(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">お絵かき</h1>
            <button
              onClick={() => setShowSaveModal(true)}
              disabled={loading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="h-5 w-5" />
              <span>保存</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={() => setShowColorPicker(true)}
              className="px-4 py-2 rounded-lg flex items-center gap-2 border hover:bg-gray-50"
            >
              <div
                className="w-5 h-5 rounded-full"
                style={{ backgroundColor: color }}
              />
              <Palette className="h-5 w-5" />
              <span>色を選ぶ</span>
            </button>

            <button
              onClick={() => setTool(tool === 'eraser' ? 'pen' : 'eraser')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                tool === 'eraser'
                  ? 'bg-indigo-600 text-white'
                  : 'border hover:bg-gray-50'
              }`}
            >
              <Eraser className="h-5 w-5" />
              <span>消しゴム</span>
            </button>

            <input
              type="range"
              min="1"
              max="20"
              value={lineWidth}
              onChange={(e) => setLineWidth(parseInt(e.target.value))}
              className="w-32"
            />

            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <Undo className="h-5 w-5" />
            </button>

            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <Redo className="h-5 w-5" />
            </button>

            <button
              onClick={clearCanvas}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Trash2 className="h-5 w-5" />
              <span>クリア</span>
            </button>
          </div>

          <div className="bg-gray-100 p-4 rounded-xl">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseOut={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className={`w-full bg-white rounded-lg touch-none ${
                tool === 'pen' ? 'cursor-crosshair' : 'cursor-pointer'
              }`}
              style={{ touchAction: 'none' }}
            />
          </div>
        </div>

        {/* Save Modal */}
        {showSaveModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">作品を保存</h2>
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
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
                    required
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

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowSaveModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading || !title.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
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
              </div>
            </div>
          </div>
        )}

        {/* Color Picker Modal */}
        {showColorPicker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">色を選ぶ</h2>
                <button
                  onClick={() => setShowColorPicker(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                {baseColors.map((baseColor, i) => (
                  <div key={i} className="space-y-2">
                    <div className="text-sm font-medium">{baseColor.name}</div>
                    <div
                      className="h-12 rounded-lg cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, ${baseColor.from}, ${baseColor.to})`
                      }}
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const percentage = x / rect.width;
                        const selectedColor = getColorFromGradient(baseColor.from, baseColor.to, percentage);
                        setColor(selectedColor);
                        setTool('pen');
                        setShowColorPicker(false);
                      }}
                    />
                  </div>
                ))}

                <div className="space-y-2">
                  <div className="text-sm font-medium">モノクロ</div>
                  <div
                    className="h-12 rounded-lg cursor-pointer"
                    style={{
                      background: 'linear-gradient(to right, #000000, #ffffff)'
                    }}
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const percentage = x / rect.width;
                      const selectedColor = getColorFromGradient('#000000', '#ffffff', percentage);
                      setColor(selectedColor);
                      setTool('pen');
                      setShowColorPicker(false);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
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