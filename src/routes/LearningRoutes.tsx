import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Learning } from '@/components/Learning/Learning';
import { ScienceLearning } from '../components/Learning/ScienceLearning';
import { TechnologyLearning } from '../components/Learning/TechnologyLearning';
import { EngineeringLearning } from '../components/Learning/EngineeringLearning';
import { ArtLearning } from '../components/Learning/ArtLearning';
import { MathLearning } from '../components/Learning/MathLearning';
import { LessonDetail } from '../components/Learning/LessonDetail';
import { LessonContent } from '../components/Learning/LessonContent';
import { ErrorMessage } from '../components/Common/ErrorMessage';

// エラーバウンダリーコンポーネント
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorMessage
          title="エラーが発生しました"
          message="ページの読み込みに失敗しました。"
          onRetry={() => {
            this.setState({ hasError: false });
            window.location.reload();
          }}
        />
      );
    }

    return this.props.children;
  }
}

function LearningRoutes() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route index element={<Learning />} />
        <Route path="science" element={<ScienceLearning />} />
        <Route path="technology" element={<TechnologyLearning />} />
        <Route path="engineering" element={<EngineeringLearning />} />
        <Route path="art" element={<ArtLearning />} />
        <Route path="math" element={<MathLearning />} />
        <Route path="lesson/:lessonId" element={<LessonDetail />} />
        <Route path="lesson/:lessonId/content" element={<LessonContent />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default LearningRoutes; 