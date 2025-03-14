import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ParentWorks } from '../components/ParentWorks';
import { ParentWorkDetail } from '../components/ParentWorkDetail';

export const ParentWorksRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<ParentWorks />} />
      <Route path=":workId" element={<ParentWorkDetail />} />
    </Routes>
  );
}; 