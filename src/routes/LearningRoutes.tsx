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
import { Biology } from '../pages/child/learning/science/Biology';
import { Plant } from '../pages/child/learning/science/Plant';
import { Weather } from '../pages/child/learning/science/Weather';
import { Earth } from '../pages/child/learning/science/Earth';
import { Matter } from '../pages/child/learning/science/Matter';

function LearningRoutes() {
  return (
    <Routes>
      <Route index element={<Learning />} />
      <Route path="science" element={<ScienceLearning />} />
      <Route path="science/biology" element={<Biology />} />
      <Route path="science/plant" element={<Plant />} />
      <Route path="science/weather" element={<Weather />} />
      <Route path="science/earth" element={<Earth />} />
      <Route path="science/matter" element={<Matter />} />
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