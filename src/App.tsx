import React, { Suspense } from 'react';
import { 
  Routes, 
  Route, 
  Navigate,
  createRoutesFromElements,
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import { Auth } from './components/Auth';
import { SignUp } from './components/SignUp';
import { PasswordReset } from './components/Auth/PasswordReset';
import { UpdatePassword } from './components/Auth/UpdatePassword';
import { Home } from './components/Home';
import { LearningRoutes } from './routes/LearningRoutes';
import { ParentWorksRoutes } from './routes/ParentWorksRoutes';
import { ChildWorksRoutes } from './routes/ChildWorksRoutes';
import { ProfileRoutes } from './routes/ProfileRoutes';
import { AnalyticsRoutes } from './routes/AnalyticsRoutes';
import { ParentLayout } from './components/layouts/ParentLayout';
import { ChildLayout } from './components/layouts/ChildLayout';
import { ParentDashboard } from './components/ParentDashboard';
import { SELQuest } from './components/SELQuest';
import { AuthProvider } from '@/hooks/useAuth';
import { Toaster } from 'react-hot-toast';
import { LoadingSpinner } from '@/components/Common/LoadingSpinner';

// ルート定義
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<AuthProvider />}>
      {/* 認証ルート */}
      <Route path="/auth">
        <Route index element={<Navigate to="/auth/login" replace />} />
        <Route path="login" element={<Auth />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="reset-password" element={<PasswordReset />} />
        <Route path="update-password" element={<UpdatePassword />} />
      </Route>

      {/* ルートパスのリダイレクト */}
      <Route path="/" element={<Navigate to="/auth/login" replace />} />

      {/* 保護者用ルート */}
      <Route path="/parent" element={<ParentLayout />}>
        <Route index element={<Navigate to="/parent/dashboard" replace />} />
        <Route path="dashboard" element={<ParentDashboard />} />
        <Route path="analytics/*" element={<AnalyticsRoutes />} />
        <Route path="works/*" element={<ParentWorksRoutes />} />
        <Route path="profile/*" element={<ProfileRoutes />} />
      </Route>

      {/* 子供用ルート */}
      <Route path="/child" element={<ChildLayout />}>
        <Route index element={<Navigate to="/child/home" replace />} />
        <Route path="home" element={<Home />} />
        <Route path="learning/*" element={<LearningRoutes />} />
        <Route path="works/*" element={<ChildWorksRoutes />} />
        <Route path="sel-quest" element={<SELQuest />} />
      </Route>

      {/* 404リダイレクト */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  ),
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  }
);

export function App() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    }>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#363636',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            borderRadius: '0.5rem',
            padding: '1rem',
          },
        }}
      />
    </Suspense>
  );
}

export default App;