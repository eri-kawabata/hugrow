import { useState } from 'react';
import { TopicBase } from '../../TopicBase';
import { useLearningProgress } from '../../../../hooks/useLearningProgress';
import { Camera, Save, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../../Common/Button';

const PLANTS_TOPIC = {
  id: 'plants',
  title: 'しょくぶつのせいちょう',
  description: 'たねからめがでて、はっぱがそだつようすをしらべよう',
  difficulty: 1,
  estimatedTime: '15ぷん',
  objectives: [
    'たねのめがでるようすがわかる',
    'はっぱのそだちかたがわかる',
    'かんさつきろくをつけることができる'
  ]
};

type ObservationRecord = {
  id: string;
  date: Date;
  note: string;
  imageUrl?: string;
};

const GROWTH_STAGES = [
  {
    id: 'seed',
    title: 'たね',
    description: 'たねはかたくてちいさいね。なかにめがはいっているよ。',
    imageUrl: '/images/learning/science/plants/seed.jpg'
  },
  {
    id: 'sprout',
    title: 'めがでた！',
    description: 'たねからちいさなめがでてきたよ。めはみどりいろだね。',
    imageUrl: '/images/learning/science/plants/sprout.jpg'
  },
  {
    id: 'leaves',
    title: 'はっぱがそだつ',
    description: 'めからはっぱがそだってきたよ。だんだんおおきくなるね。',
    imageUrl: '/images/learning/science/plants/leaves.jpg'
  }
];

export function PlantsLearning() {
  const { updateProgress } = useLearningProgress('science', 'plants');
  const [completed, setCompleted] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [observations, setObservations] = useState<ObservationRecord[]>([]);
  const [newNote, setNewNote] = useState('');

  const handleComplete = async () => {
    await updateProgress(true);
    setCompleted(true);
  };

  const addObservation = () => {
    if (!newNote.trim()) return;

    const observation: ObservationRecord = {
      id: Date.now().toString(),
      date: new Date(),
      note: newNote.trim()
    };

    setObservations(prev => [...prev, observation]);
    setNewNote('');
  };

  const deleteObservation = (id: string) => {
    setObservations(prev => prev.filter(obs => obs.id !== id));
  };

  return (
    <TopicBase
      subject="science"
      topic={PLANTS_TOPIC}
      onComplete={handleComplete}
    >
      <div className="space-y-8">
        {/* 成長段階の表示 */}
        <div className="relative">
          <div className="flex justify-between mb-4">
            {GROWTH_STAGES.map((stage, index) => (
              <div
                key={stage.id}
                className={`flex-1 text-center ${
                  index === currentStage ? 'text-blue-500' : 'text-gray-400'
                }`}
              >
                <div className="w-8 h-8 rounded-full border-2 mx-auto mb-2 flex items-center justify-center
                  ${index === currentStage ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}"
                >
                  {index + 1}
                </div>
                <div className="text-sm font-bold">{stage.title}</div>
              </div>
            ))}
            {/* 進捗バー */}
            <div className="absolute top-4 left-0 h-0.5 bg-gray-200 w-full -z-10">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${(currentStage / (GROWTH_STAGES.length - 1)) * 100}%` }}
              />
            </div>
          </div>

          {/* 現在の段階の説明 */}
          <div className="bg-blue-50 p-6 rounded-xl">
            <div className="aspect-video mb-4 rounded-lg overflow-hidden">
              <img
                src={GROWTH_STAGES[currentStage].imageUrl}
                alt={GROWTH_STAGES[currentStage].title}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-gray-600">
              {GROWTH_STAGES[currentStage].description}
            </p>
          </div>

          {/* ステージ切り替えボタン */}
          <div className="flex justify-between mt-4">
            <Button
              onClick={() => setCurrentStage(prev => Math.max(0, prev - 1))}
              disabled={currentStage === 0}
              variant="secondary"
            >
              まえ
            </Button>
            <Button
              onClick={() => setCurrentStage(prev => Math.min(GROWTH_STAGES.length - 1, prev + 1))}
              disabled={currentStage === GROWTH_STAGES.length - 1}
            >
              つぎ
            </Button>
          </div>
        </div>

        {/* 観察記録 */}
        <div>
          <h2 className="text-lg font-bold mb-4">かんさつきろく</h2>
          
          {/* 記録の追加 */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <textarea
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
              placeholder="きょうのかんさつをかいてみよう"
              className="w-full p-3 rounded-lg border mb-3 min-h-[100px]"
            />
            <div className="flex justify-between">
              <Button
                variant="secondary"
                className="flex items-center gap-2"
              >
                <Camera className="h-4 w-4" />
                しゃしんをとる
              </Button>
              <Button
                onClick={addObservation}
                disabled={!newNote.trim()}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                きろくする
              </Button>
            </div>
          </div>

          {/* 記録一覧 */}
          <div className="space-y-4">
            {observations.map(obs => (
              <div key={obs.id} className="bg-white border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm text-gray-500">
                    {obs.date.toLocaleDateString('ja-JP')}
                  </div>
                  <button
                    onClick={() => deleteObservation(obs.id)}
                    className="text-red-500 hover:text-red-600 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-gray-700">{obs.note}</p>
                {obs.imageUrl && (
                  <img
                    src={obs.imageUrl}
                    alt="観察写真"
                    className="mt-2 rounded-lg w-full"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </TopicBase>
  );
} 