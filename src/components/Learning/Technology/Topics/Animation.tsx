import { useState, useCallback } from 'react';
import { TopicBase } from '../../TopicBase';
import { useLearningProgress } from '../../../../hooks/useLearningProgress';
import { Play, Pause, RotateCcw, Plus, Trash2, MoveRight } from 'lucide-react';
import { Button } from '../../../Common/Button';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const ANIMATION_TOPIC = {
  id: 'animation',
  title: 'アニメーション',
  description: 'かんたんなプログラムでキャラクターをうごかそう',
  difficulty: 2,
  estimatedTime: '25ぷん',
  objectives: [
    'めいれいをくみあわせてプログラムをつくる',
    'キャラクターをうごかす',
    'アニメーションのしくみをりかいする'
  ]
};

type Command = {
  id: string;
  type: 'move' | 'rotate' | 'jump' | 'wait';
  label: string;
  icon: JSX.Element;
  duration: number;
  value?: number;
};

const AVAILABLE_COMMANDS: Command[] = [
  {
    id: 'move',
    type: 'move',
    label: 'うごく',
    icon: <MoveRight className="h-5 w-5" />,
    duration: 1000,
    value: 100
  },
  {
    id: 'rotate',
    type: 'rotate',
    label: 'まわる',
    icon: <RotateCcw className="h-5 w-5" />,
    duration: 1000,
    value: 90
  },
  {
    id: 'jump',
    type: 'jump',
    label: 'ジャンプ',
    icon: <Play className="h-5 w-5 rotate-90" />,
    duration: 500
  },
  {
    id: 'wait',
    type: 'wait',
    label: 'まつ',
    icon: <Pause className="h-5 w-5" />,
    duration: 1000
  }
];

export function AnimationLearning() {
  const { updateProgress } = useLearningProgress('technology', 'animation');
  const [program, setProgram] = useState<Command[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [characterPosition, setCharacterPosition] = useState({ x: 0, y: 0, rotation: 0 });
  const [completed, setCompleted] = useState(false);

  const handleDragEnd = useCallback((result: any) => {
    if (!result.destination) return;

    if (result.source.droppableId === 'commands' && result.destination.droppableId === 'program') {
      const command = AVAILABLE_COMMANDS.find(c => c.id === result.draggableId);
      if (command) {
        setProgram(prev => [...prev, { ...command, id: `${command.id}-${Date.now()}` }]);
      }
    } else if (result.source.droppableId === 'program') {
      const items = Array.from(program);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      setProgram(items);
    }
  }, [program]);

  const runProgram = useCallback(async () => {
    setIsPlaying(true);
    setCharacterPosition({ x: 0, y: 0, rotation: 0 });

    for (const command of program) {
      await new Promise(resolve => {
        switch (command.type) {
          case 'move':
            setCharacterPosition(prev => ({
              ...prev,
              x: prev.x + (command.value || 0) * Math.cos(prev.rotation * Math.PI / 180),
              y: prev.y + (command.value || 0) * Math.sin(prev.rotation * Math.PI / 180)
            }));
            break;
          case 'rotate':
            setCharacterPosition(prev => ({
              ...prev,
              rotation: prev.rotation + (command.value || 0)
            }));
            break;
          case 'jump':
            // ジャンプアニメーション
            break;
        }
        setTimeout(resolve, command.duration);
      });
    }

    setIsPlaying(false);
    if (program.length >= 5) {
      await updateProgress(true);
      setCompleted(true);
    }
  }, [program, updateProgress]);

  return (
    <TopicBase
      subject="technology"
      topic={ANIMATION_TOPIC}
      onComplete={() => updateProgress(true)}
    >
      <div className="space-y-8">
        {/* プログラミングエリア */}
        <DragDropContext onDragEnd={handleDragEnd}>
          {/* 利用可能なコマンド */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-bold mb-4">つかえるめいれい</h3>
            <Droppable droppableId="commands" direction="horizontal">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex flex-wrap gap-2"
                >
                  {AVAILABLE_COMMANDS.map((command, index) => (
                    <Draggable
                      key={command.id}
                      draggableId={command.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white p-2 rounded-lg shadow-sm flex items-center gap-2"
                        >
                          {command.icon}
                          <span>{command.label}</span>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>

          {/* プログラム */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-bold mb-4">プログラム</h2>
            <Droppable droppableId="program">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="min-h-[100px] border-2 border-dashed border-gray-200 rounded-lg p-4 space-y-2"
                >
                  {program.map((command, index) => (
                    <Draggable
                      key={command.id}
                      draggableId={command.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-blue-50 p-2 rounded-lg flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            {command.icon}
                            <span>{command.label}</span>
                          </div>
                          <button
                            onClick={() => setProgram(prev => prev.filter((_, i) => i !== index))}
                            className="text-red-500 hover:text-red-600 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </DragDropContext>

        {/* 実行エリア */}
        <div className="bg-gray-50 p-6 rounded-xl">
          <div className="flex justify-between mb-4">
            <Button
              onClick={runProgram}
              disabled={isPlaying || program.length === 0}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              うごかす
            </Button>
            <Button
              variant="secondary"
              onClick={() => setProgram([])}
              disabled={program.length === 0}
            >
              リセット
            </Button>
          </div>

          {/* キャラクター表示エリア */}
          <div className="relative h-[300px] bg-white rounded-lg border">
            <div
              className="absolute w-12 h-12 bg-blue-500 rounded-full transition-all duration-500"
              style={{
                transform: `translate(${characterPosition.x}px, ${characterPosition.y}px) rotate(${characterPosition.rotation}deg)`
              }}
            />
          </div>
        </div>
      </div>
    </TopicBase>
  );
} 