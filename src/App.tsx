import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Auth } from './components/Auth';
import { SignUp } from './components/SignUp';
import { Home } from './components/Home';
import { WorkUpload } from './components/WorkUpload';
import { DrawingCanvas } from './components/DrawingCanvas';
import { AudioRecorder } from './components/AudioRecorder';
import { CameraUpload } from './components/CameraUpload';
import { Report } from './components/Report';
import { SELQuest } from './components/SELQuest';
import { Timecapsule } from './components/Timecapsule';
import { ParentWorks } from './components/ParentWorks';
import { ParentProfile } from './components/ParentProfile';
import { ChildProfile } from './components/ChildProfile';
import { Learning } from './components/Learning';
import { ScienceLearning } from './components/ScienceLearning';
import { TechnologyLearning } from './components/TechnologyLearning';
import { EngineeringLearning } from './components/EngineeringLearning';
import { ArtsLearning } from './components/ArtsLearning';
import { MathematicsLearning } from './components/MathematicsLearning';
import { Challenge } from './components/Challenge';
import { Toaster } from 'react-hot-toast';

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/home" element={<Home />} />
        <Route path="/works/new" element={<WorkUpload />} />
        <Route path="/drawing" element={<DrawingCanvas />} />
        <Route path="/audio" element={<AudioRecorder />} />
        <Route path="/camera" element={<CameraUpload />} />
        <Route path="/works" element={<ParentWorks />} />
        <Route path="/report" element={<Report />} />
        <Route path="/sel-quest" element={<SELQuest />} />
        <Route path="/timecapsule" element={<Timecapsule />} />
        <Route path="/learning" element={<Learning />} />
        <Route path="/learning/science" element={<ScienceLearning />} />
        <Route path="/learning/technology" element={<TechnologyLearning />} />
        <Route path="/learning/engineering" element={<EngineeringLearning />} />
        <Route path="/learning/arts" element={<ArtsLearning />} />
        <Route path="/learning/mathematics" element={<MathematicsLearning />} />
        <Route path="/challenge" element={<Challenge />} />
        <Route path="/parent/profile" element={<ParentProfile />} />
        <Route path="/parent/child-profile" element={<ChildProfile />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;