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

function LearningRoutes() {
  return (
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
  );
}

export default LearningRoutes; 