import { useState, useMemo } from 'react';
import { TopicBase } from '../../TopicBase';
import { useLearningProgress } from '../../../../hooks/useLearningProgress';
import { Palette, Check, RefreshCw, Droplet } from 'lucide-react';
import { Button } from '../../../Common/Button';
import { DrawingCanvas } from '../../../Common/DrawingCanvas';

const COLORS_TOPIC = {
  id: 'colors',
  title: 'いろのせかい',
  description: 'いろんないろをまぜてあたらしいいろをつくろう',
  difficulty: 1,
  estimatedTime: '20ぷん',
  objectives: [
    'きほんてきないろをしる',
    'いろをまぜてあたらしいいろをつくる',
    'すきないろでえをかく'
  ]
};

type Color = {
  id: string;
  name: string;
  hex: string;
  description: string;
  mixWith: Array<{
    colorId: string;
    result: string;
    resultName: string;
  }>;
};

const COLORS: Color[] = [
  {
    id: 'red',
    name: 'あか',
    hex: '#FF0000',
    description: 'りんごやいちごのいろだね',
    mixWith: [
      { colorId: 'yellow', result: '#FF8000', resultName: 'オレンジいろ' },
      { colorId: 'blue', result: '#800080', resultName: 'むらさき' }
    ]
  },
  {
    id: 'yellow',
    name: 'きいろ',
    hex: '#FFFF00',
    description: 'たいようやレモンのいろだね',
    mixWith: [
      { colorId: 'blue', result: '#008000', resultName: 'みどり' },
      { colorId: 'red', result: '#FF8000', resultName: 'オレンジいろ' }
    ]
  },
  {
    id: 'blue',
    name: 'あお',
    hex: '#0000FF',
    description: 'そらやうみのいろだね',
    mixWith: [
      { colorId: 'red', result: '#800080', resultName: 'むらさき' },
      { colorId: 'yellow', result: '#008000', resultName: 'みどり' }
    ]
  }
];

export function ColorsLearning() {
  const { updateProgress } = useLearningProgress('art', 'colors');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [discoveries, setDiscoveries] = useState<Set<string>>(new Set());

  // 選択された色の組み合わせから生まれる新しい色を計算
  const mixedColor = useMemo(() => {
    if (selectedColors.length !== 2) return null;
    
    const color1 = COLORS.find(c => c.id === selectedColors[0]);
    const mix = color1?.mixWith.find(m => m.colorId === selectedColors[1]);
    
    return mix ? {
      hex: mix.result,
      name: mix.resultName
    } : null;
  }, [selectedColors]);

  const handleColorSelect = (colorId: string) => {
    setSelectedColors(prev => {
      if (prev.includes(colorId)) {
        return prev.filter(id => id !== colorId);
      }
      return prev.length < 2 ? [...prev, colorId] : [colorId];
    });
  };

  const handleDiscovery = () => {
    if (mixedColor) {
      setDiscoveries(prev => new Set([...prev, mixedColor.name]));
      setSelectedColors([]);
    }
  };

  const handleComplete = async () => {
    await updateProgress(discoveries.size >= COLORS.length);
    setCompleted(true);
  };

  return (
    <TopicBase
      subject="art"
      topic={COLORS_TOPIC}
      onComplete={handleComplete}
    >
      <div className="space-y-8">
        {/* 色の実験室 */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Palette className="h-5 w-5 text-blue-500" />
            いろのじっけんしつ
          </h2>

          {/* 色の選択 */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {COLORS.map(color => (
              <button
                key={color.id}
                onClick={() => handleColorSelect(color.id)}
                className={`p-4 rounded-lg text-center transition-all ${
                  selectedColors.includes(color.id)
                    ? 'ring-2 ring-blue-500 shadow-lg'
                    : 'hover:shadow-md'
                }`}
                style={{ backgroundColor: color.hex }}
              >
                <span className="bg-white px-2 py-1 rounded-full text-sm">
                  {color.name}
                </span>
              </button>
            ))}
          </div>

          {/* 混色結果 */}
          {selectedColors.length === 2 && mixedColor && (
            <div className="text-center space-y-4">
              <div className="w-32 h-32 mx-auto rounded-full shadow-lg"
                style={{ backgroundColor: mixedColor.hex }}
              />
              <div>
                <p className="font-bold text-lg">{mixedColor.name}</p>
                <Button
                  onClick={handleDiscovery}
                  disabled={discoveries.has(mixedColor.name)}
                  className="mt-2"
                >
                  はっけん！
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* 発見した色一覧 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-bold mb-2">はっけんしたいろ</h3>
          <div className="flex flex-wrap gap-2">
            {Array.from(discoveries).map(color => (
              <span
                key={color}
                className="bg-white px-3 py-1 rounded-full text-sm shadow-sm"
              >
                {color}
              </span>
            ))}
          </div>
        </div>

        {/* お絵かきコーナー */}
        {discoveries.size > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-bold mb-4">
              はっけんしたいろでおえかきしよう！
            </h2>
            {isDrawing ? (
              <div className="space-y-4">
                <DrawingCanvas
                  colors={Array.from(discoveries)}
                  className="border rounded-xl"
                />
                <div className="flex justify-end">
                  <Button
                    variant="secondary"
                    onClick={() => setIsDrawing(false)}
                  >
                    おわる
                  </Button>
                </div>
              </div>
            ) : (
              <Button onClick={() => setIsDrawing(true)}>
                おえかきをはじめる
              </Button>
            )}
          </div>
        )}
      </div>
    </TopicBase>
  );
} 