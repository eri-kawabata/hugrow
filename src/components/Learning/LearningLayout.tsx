import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

type LearningLayoutProps = {
  title: string;
  children: ReactNode;
  showBackButton?: boolean;
};

export function LearningLayout({ 
  title, 
  children, 
  showBackButton = true 
}: LearningLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-4xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="flex items-center gap-4 mb-8">
          {showBackButton && (
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="もどる"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
          )}
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>

        {/* メインコンテンツ */}
        <main>
          {children}
        </main>
      </div>
    </div>
  );
} 