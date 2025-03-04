import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { MyWorks } from '../components/MyWorks';
import { WorkUpload } from '../components/WorkUpload';
import { DrawingCanvas } from '../components/DrawingCanvas';
import { AudioRecorder } from '../components/AudioRecorder';
import CameraCapture from '../components/CameraCapture';
import { WorkDetail } from '../components/WorkDetail';

export const ChildWorksRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<MyWorks />} />
      <Route path="new" element={<WorkUpload />} />
      <Route path="drawing" element={<DrawingCanvas />} />
      <Route path="audio" element={<AudioRecorder />} />
      <Route path="camera" element={<CameraCapture />} />
      <Route path=":workId" element={<WorkDetail />} />
    </Routes>
  );
}; 