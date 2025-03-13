import React, { memo, useCallback, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Image, Music, Camera, Plus, Filter, X, Palette } from 'lucide-react';
import { useWorks, Work } from '@/hooks/useWorks';
import { LoadingSpinner } from '@/components/Common/LoadingSpinner';
import { ErrorMessage } from '@/components/Common/ErrorMessage';
import { EmptyState } from '@/components/Common/EmptyState';

// 作品タイプのフィルター型
type WorkTypeFilter = 'all' | Work['type'];

const WorkTypeIcon = memo(({ type }: { type: Work['type'] }) => {
  const icons = {
    drawing: <Palette className="h-6 w-6 text-[#5d7799]" />,
    audio: <Music className="h-6 w-6 text-[#5d7799]" />,
    photo: <Camera className="h-6 w-6 text-[#5d7799]" />,
  };

  return icons[type] || null;
});

WorkTypeIcon.displayName = 'WorkTypeIcon';

const CreateWorkButton = memo(() => (
  <Link
    to="/child/works/new"
    className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#8ec5d6] to-[#5d7799] text-white rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-bold"
  >
    <Plus className="h-5 w-5" />
    <span>新しい作品を作る</span>
  </Link>
));

CreateWorkButton.displayName = 'CreateWorkButton';

const WorkCard = memo(({ work }: { work: Work }) => {
  // 作品タイプに基づく背景色とボーダー色を設定
  const cardStyles = {
    drawing: {
      border: 'border-[#8ec5d6]',
      bg: 'from-white to-[#8ec5d6]/20',
      iconBg: 'bg-[#8ec5d6]/30 group-hover:bg-[#8ec5d6]/40',
      shadow: 'shadow-[#8ec5d6]/20',
    },
    audio: {
      border: 'border-[#f5f6bf]',
      bg: 'from-white to-[#f5f6bf]/20',
      iconBg: 'bg-[#f5f6bf]/30 group-hover:bg-[#f5f6bf]/40',
      shadow: 'shadow-[#f5f6bf]/20',
    },
    photo: {
      border: 'border-[#f7c5c2]',
      bg: 'from-white to-[#f7c5c2]/20',
      iconBg: 'bg-[#f7c5c2]/30 group-hover:bg-[#f7c5c2]/40',
      shadow: 'shadow-[#f7c5c2]/20',
    },
  };

  // 作品タイプに基づくラベルを設定
  const typeLabels = {
    drawing: 'お絵かき',
    audio: '音声',
    photo: '写真',
  };

  const style = cardStyles[work.type];

  return (
    <Link
      to={`/child/works/${work.id}`}
      className={`group block bg-gradient-to-br ${style.bg} rounded-[24px] shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 ${style.border} hover:scale-105 animate-fade-in ${style.shadow}`}
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className={`p-3.5 rounded-xl transition-colors ${style.iconBg} transform group-hover:rotate-3 duration-300`}>
            <WorkTypeIcon type={work.type} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-[#5d7799] truncate text-xl">{work.title}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs px-2.5 py-1 rounded-full bg-white/70 text-[#5d7799] font-medium border border-[#5d7799]/10">
                {typeLabels[work.type]}
              </span>
              <p className="text-sm text-[#5d7799]/80">
                {new Date(work.created_at).toLocaleDateString('ja-JP')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
});

WorkCard.displayName = 'WorkCard';

const FilterButton = memo(({ type, activeFilter, onClick }: { 
  type: WorkTypeFilter, 
  activeFilter: WorkTypeFilter, 
  onClick: (type: WorkTypeFilter) => void 
}) => {
  // フィルタータイプに基づくラベルとアイコンを設定
  const filterConfig = {
    all: { 
      label: 'すべて', 
      icon: <Filter className="h-4 w-4" />,
      color: 'bg-gradient-to-r from-[#8ec5d6] via-[#f7c5c2] to-[#f5f6bf]',
      activeColor: 'bg-gradient-to-r from-[#8ec5d6] via-[#f7c5c2] to-[#f5f6bf]',
      textColor: 'text-white',
    },
    drawing: { 
      label: 'お絵かき', 
      icon: <Palette className="h-4 w-4" />,
      color: 'bg-[#8ec5d6]/20',
      activeColor: 'bg-[#8ec5d6]',
      textColor: 'text-[#5d7799]',
      activeTextColor: 'text-white',
    },
    audio: { 
      label: '音声', 
      icon: <Music className="h-4 w-4" />,
      color: 'bg-[#f5f6bf]/20',
      activeColor: 'bg-[#f5f6bf]',
      textColor: 'text-[#5d7799]',
      activeTextColor: 'text-white',
    },
    photo: { 
      label: '写真', 
      icon: <Camera className="h-4 w-4" />,
      color: 'bg-[#f7c5c2]/20',
      activeColor: 'bg-[#f7c5c2]',
      textColor: 'text-[#5d7799]',
      activeTextColor: 'text-white',
    },
  };

  const isActive = type === activeFilter;
  const config = filterConfig[type];

  return (
    <button
      onClick={() => onClick(type)}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
        isActive 
          ? `${config.activeColor} ${config.activeTextColor || 'text-white'} shadow-md transform scale-110` 
          : `${config.color} ${config.textColor} hover:opacity-90 hover:shadow-sm border border-[#5d7799]/10`
      }`}
    >
      <span className={`${isActive ? 'transform scale-110' : ''} transition-transform duration-300`}>
        {config.icon}
      </span>
      <span>{config.label}</span>
    </button>
  );
});

FilterButton.displayName = 'FilterButton';

const WorksGrid = memo(({ works }: { works: Work[] }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
    {works.map((work, index) => (
      <div 
        key={work.id} 
        className="animate-fade-in" 
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <WorkCard work={work} />
      </div>
    ))}
  </div>
));

WorksGrid.displayName = 'WorksGrid';

const Header = memo(({ 
  activeFilter, 
  setActiveFilter 
}: { 
  activeFilter: WorkTypeFilter, 
  setActiveFilter: (filter: WorkTypeFilter) => void 
}) => (
  <div>
    <div className="bg-gradient-to-r from-[#8ec5d6] via-[#f7c5c2] to-[#f5f6bf] px-4 py-12 rounded-b-[40px] shadow-lg relative overflow-hidden">
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
      <div className="relative z-10">
        <h1 className="text-4xl font-bold text-white text-center drop-shadow-md mb-2">
          わたしの作品
        </h1>
        <p className="text-white/90 text-center text-sm max-w-md mx-auto">
          あなたの素敵な作品をここで見ることができます
        </p>
      </div>
    </div>
    
    <div className="px-6 -mt-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-full shadow-lg p-2 flex flex-wrap items-center justify-center gap-3 max-w-2xl mx-auto">
        <FilterButton type="all" activeFilter={activeFilter} onClick={setActiveFilter} />
        <FilterButton type="drawing" activeFilter={activeFilter} onClick={setActiveFilter} />
        <FilterButton type="audio" activeFilter={activeFilter} onClick={setActiveFilter} />
        <FilterButton type="photo" activeFilter={activeFilter} onClick={setActiveFilter} />
      </div>
    </div>
  </div>
));

Header.displayName = 'Header';

export function MyWorks() {
  const { works, loading, error, fetchWorks } = useWorks();
  const [activeFilter, setActiveFilter] = useState<WorkTypeFilter>('all');
  const [filteredWorks, setFilteredWorks] = useState<Work[]>([]);

  // フィルターが変更されたときに作品をフィルタリング
  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredWorks(works);
    } else {
      setFilteredWorks(works.filter(work => work.type === activeFilter));
    }
  }, [activeFilter, works]);

  const handleRetry = useCallback(() => {
    fetchWorks();
  }, [fetchWorks]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fbfd]">
        <div className="max-w-5xl mx-auto">
          <Header activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
          <div className="px-6 pt-8">
            <div className="flex justify-center items-center min-h-[50vh] bg-white rounded-[32px] shadow-sm p-8">
              <LoadingSpinner size="lg" message="作品を読み込んでいます..." />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fbfd]">
        <div className="max-w-5xl mx-auto">
          <Header activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
          <div className="px-6 pt-8">
            <div className="bg-white rounded-[32px] shadow-sm p-8">
              <ErrorMessage
                title="作品の読み込みに失敗しました"
                message="ネットワーク接続を確認して、もう一度お試しください。"
                actionLabel="再試行"
                onAction={handleRetry}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fbfd]">
      <div className="max-w-5xl mx-auto">
        <Header activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
        <div className="space-y-12 pb-28">
          <div className="px-6 pt-8">
            {filteredWorks.length === 0 ? (
              <div className="bg-white rounded-[32px] shadow-sm p-8 mt-6">
                <EmptyState
                  title={`${filterTypeToJapanese(activeFilter)}作品がありません`}
                  message="新しい作品を作ってみましょう！"
                  actionLabel="作品を作る"
                  actionTo="/child/works/new"
                  icon={<Image className="h-16 w-16 text-[#5d7799]/50" />}
                />
              </div>
            ) : (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-bold text-[#5d7799]">
                    {activeFilter === 'all' ? 'すべての作品' : `${filterTypeToJapanese(activeFilter)}作品`}
                    <span className="ml-2 text-sm font-normal text-[#5d7799]/70">
                      ({filteredWorks.length}件)
                    </span>
                  </h2>
                  <CreateWorkButton />
                </div>
                <WorksGrid works={filteredWorks} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// フィルタータイプを日本語に変換するヘルパー関数
function filterTypeToJapanese(type: WorkTypeFilter): string {
  switch (type) {
    case 'drawing': return 'お絵かき';
    case 'audio': return '音声';
    case 'photo': return '写真';
    default: return 'すべて';
  }
} 