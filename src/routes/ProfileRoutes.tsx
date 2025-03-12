import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ParentProfile } from '../components/ParentProfile';

export const ProfileRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<ParentProfile />} />
    </Routes>
  );
}; 