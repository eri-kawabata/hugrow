import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ArtsAnalytics } from '../components/ArtsAnalytics';
import { SELAnalytics } from '../components/SELAnalytics';

export const AnalyticsRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="arts" element={<ArtsAnalytics />} />
      <Route path="sel" element={<SELAnalytics />} />
    </Routes>
  );
}; 