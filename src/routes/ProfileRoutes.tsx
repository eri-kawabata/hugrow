import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ParentProfile } from '../components/ParentProfile';
import { ChildProfile } from '../components/ChildProfile';

export const ProfileRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<ParentProfile />} />
      <Route path="child" element={<ChildProfile />} />
    </Routes>
  );
}; 