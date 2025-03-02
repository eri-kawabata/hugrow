import { useState } from 'react';
import { TopicBase } from '../../TopicBase';
import { useLearningProgress } from '../../../../hooks/useLearningProgress';
import { Square, Circle, Triangle, Check, RefreshCw } from 'lucide-react';
import { Button } from '../../../Common/Button';
import { DrawingCanvas } from '../../../Common/DrawingCanvas';

const SHAPES_TOPIC = {
  id: 'shapes',
  title: 'ずけい',
  description: 'いろいろなかたちをべんきょうしよう',
  difficulty: 1,
  estimatedTime: '15ぷん',
  objectives: [
    'まるとしかくとさんかくをみわける',
    'ずけいをじぶんでかく',
    'せいかいとまちがいがわかる'
  ]
};

type Shape = {
  id: string;
  name: string;
  icon: typeof Square | typeof Circle | typeof Triangle;
  description: string;
  example: string;
};

const SHAPES: Shape[] = [
  {
    id: 'circle',
    name: 'まる',
    icon: Circle,
    description: 'まるはどこをみてもおなじかたち。ボールみたいだね。',
    example: '/images/learning/math/shapes/circle.jpg'
  },
  {
    id: 'square',
    name: 'しかく',
    icon: Square,
    description: 'しかくは4つのへんがぜんぶおなじながさ。',
    example: '/images/learning/math/shapes/square.jpg'
  },
  {
    id: 'triangle',
    name: 'さんかく',
    icon: Triangle,
    description: 'さんかくは3つのへんでできている。',
    example: '/images/learning/math/shapes/triangle.jpg'
  }
];

export function ShapesLearning() {
  const { updateProgress } = useLearningProgress('math', 'shapes');
  const [currentShape, setCurrentShape] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [attempts, setAttempts] = useState<boolean[]>([]);

  const handleComplete = async () => {
    const correctRate = attempts.filter(Boolean).length / attempts.length;
    await updateProgress(correctRate >= 0.7);
    setCompleted(true);
  };

  const handleDrawingComplete = (success: boolean) => {
    setAttempts(prev => [...prev, success]);
    setIsDrawing(false);
  };

  return (
    <TopicBase
      subject="math"
      topic={SHAPES_TOPIC}
      onComplete={handleComplete}
    >
      <div className="space-y-8">
        {/* 図形の説明 */}
        <div className="bg-blue-50 p-6 rounded-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white p-4 rounded-full">
              <SHAPES[currentShape].icon className="h-12 w-12 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-1">{SHAPES[currentShape].name}</h2>
              <p className="text-gray-600">{SHAPES[currentShape].description}</p>
            </div>
          </div>
          <img
            src={SHAPES[currentShape].example}
            alt={SHAPES[currentShape].name}
            className="w-full rounded-lg"
          />
        </div>

        {/* お絵かき練習 */}
        {isDrawing ? (
          <div className="space-y-4">
            <h3 className="font-bold">
              {SHAPES[currentShape].name}をかいてみよう！
            </h3>
            <DrawingCanvas
              onComplete={handleDrawingComplete}
              expectedShape={SHAPES[currentShape].id}
              className="border rounded-xl bg-white"
            />
            <div className="flex justify-end">
              <Button
                variant="secondary"
                onClick={() => setIsDrawing(false)}
              >
                やめる
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <Button
              onClick={() => setIsDrawing(true)}
              className="flex items-center gap-2"
            >
              {SHAPES[currentShape].name}をかく
            </Button>
          </div>
        )}

        {/* 進行ボタン */}
        <div className="flex justify-between">
          <Button
            onClick={() => setCurrentShape(prev => Math.max(0, prev - 1))}
            disabled={currentShape === 0}
            variant="secondary"
          >
            まえ
          </Button>
          <Button
            onClick={() => setCurrentShape(prev => Math.min(SHAPES.length - 1, prev + 1))}
            disabled={currentShape === SHAPES.length - 1}
          >
            つぎ
          </Button>
        </div>

        {/* 成績表示 */}
        {attempts.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-bold mb-2">がんばったかいすう</h3>
            <div className="flex gap-1">
              {attempts.map((success, i) => (
                <div
                  key={i}
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    success ? 'bg-green-500' : 'bg-red-500'
                  } text-white text-sm`}
                >
                  {success ? '○' : '×'}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </TopicBase>
  );
} 