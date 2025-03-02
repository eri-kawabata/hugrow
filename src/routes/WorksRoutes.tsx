import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { WorkUpload } from '../components/WorkUpload';
import { DrawingCanvas } from '../components/DrawingCanvas';
import { AudioRecorder } from '../components/AudioRecorder';
import { CameraCapture } from '../components/CameraCapture';
import { ParentWorks } from '../components/ParentWorks';
import { MyWorks } from '../components/MyWorks';
import { ProtectedRoute } from '../components/Common/ProtectedRoute';

export const WorksRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="parent" element={
        <ProtectedRoute requireParentMode={true}>
          <ParentWorks />
        </ProtectedRoute>
      } />
      <Route path="my" element={
        <ProtectedRoute requireParentMode={false}>
          <MyWorks />
        </ProtectedRoute>
      } />
      <Route path="new" element={<WorkUpload />} />
      <Route path="drawing" element={<DrawingCanvas />} />
      <Route path="audio" element={<AudioRecorder />} />
      <Route path="camera" element={<CameraCapture />} />
    </Routes>
  );
}; 