import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ArtsAnalytics } from '../components/ArtsAnalytics';
import { SELAnalytics } from '../components/SELAnalytics';
import { LearningAnalytics } from '../components/LearningAnalytics';

export const AnalyticsRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<ArtsAnalytics />} />
      <Route path="arts" element={<ArtsAnalytics />} />
      <Route path="sel" element={<SELAnalytics />} />
      <Route path="learning" element={<LearningAnalytics />} />
    </Routes>
  );
}; 