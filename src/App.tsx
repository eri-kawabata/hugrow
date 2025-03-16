import React, { Suspense, lazy, useState } from 'react';
import { 
  Routes, 
  Route, 
  Navigate,
  createRoutesFromElements,
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { SupabaseAuthProvider } from '@/hooks/useSupabaseAuth';
import { Toaster } from 'react-hot-toast';
import { LoadingSpinner } from '@/components/Common/LoadingSpinner';
import { SupabaseTest } from './components/SupabaseTest';
import { ConfirmDialog } from './components/Common/ConfirmDialog';
import { useConfirm } from './hooks/useConfirm';

// 遅延ロードするコンポーネント
const Auth = lazy(() => import('./components/Auth').then(module => ({ default: module.Auth })));
const SignUp = lazy(() => import('./components/SignUp').then(module => ({ default: module.SignUp })));
const PasswordReset = lazy(() => import('./components/Auth/PasswordReset').then(module => ({ default: module.PasswordReset })));
const UpdatePassword = lazy(() => import('./components/Auth/UpdatePassword').then(module => ({ default: module.UpdatePassword })));
const Home = lazy(() => import('./components/Home').then(module => ({ default: module.Home })));
const LearningRoutes = lazy(() => import('./routes/LearningRoutes'));
const ParentWorksRoutes = lazy(() => import('./routes/ParentWorksRoutes').then(module => ({ default: module.ParentWorksRoutes })));
const ChildWorksRoutes = lazy(() => import('./routes/ChildWorksRoutes').then(module => ({ default: module.ChildWorksRoutes })));
const ProfileRoutes = lazy(() => import('./routes/ProfileRoutes').then(module => ({ default: module.ProfileRoutes })));
const AnalyticsRoutes = lazy(() => import('./routes/AnalyticsRoutes').then(module => ({ default: module.AnalyticsRoutes })));
const ParentLayout = lazy(() => import('./components/layouts/ParentLayout').then(module => ({ default: module.ParentLayout })));
const ChildLayout = lazy(() => import('./components/layouts/ChildLayout').then(module => ({ default: module.ChildLayout })));
const ParentDashboard = lazy(() => import('./components/ParentDashboard').then(module => ({ default: module.ParentDashboard })));
const SELQuest = lazy(() => import('./components/SELQuest').then(module => ({ default: module.SELQuest })));
const ChildSelectionScreen = lazy(() => import('./components/ChildSelectionScreen').then(module => ({ default: module.ChildSelectionScreen })));

// グローバルな確認ダイアログのコンテキスト
export const ConfirmContext = React.createContext<ReturnType<typeof useConfirm> | null>(null);

// ルート定義
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={
      <SupabaseAuthProvider>
        <AuthProvider />
      </SupabaseAuthProvider>
    }>
      {/* 認証ルート */}
      <Route path="/auth">
        <Route index element={<Navigate to="/auth/login" replace />} />
        <Route path="login" element={<Auth />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="reset-password" element={<PasswordReset />} />
        <Route path="update-password" element={<UpdatePassword />} />
      </Route>

      {/* Supabaseテスト用ルート */}
      <Route path="/supabase-test" element={<SupabaseTest />} />

      {/* ルートパスのリダイレクト */}
      <Route path="/" element={<Navigate to="/select-child" replace />} />

      {/* 子供選択画面 */}
      <Route path="/select-child" element={<ChildSelectionScreen />} />

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

export default function App() {
  const confirmDialog = useConfirm();
  
  return (
    <>
      <ConfirmContext.Provider value={confirmDialog}>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><LoadingSpinner size="lg" message="読み込み中..." /></div>}>
          <RouterProvider router={router} />
        </Suspense>
        <Toaster position="top-center" />
        <ConfirmDialog 
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={confirmDialog.onCancel}
        />
      </ConfirmContext.Provider>
    </>
  );
}