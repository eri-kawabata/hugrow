import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useParentMode } from '../../hooks/useParentMode';
import { LoadingState } from './LoadingState';

type ProtectedRouteProps = {
  children: React.ReactNode;
  requireParentMode?: boolean;
};

export function ProtectedRoute({ children, requireParentMode }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { isParentMode } = useParentMode();

  useEffect(() => {
    const checkAccess = async () => {
      if (!loading) {
        if (!user) {
          navigate('/login');
          return;
        }

        if (requireParentMode !== undefined) {
          if (requireParentMode && !isParentMode) {
            navigate('/my-works', { replace: true });
            return;
          }
          
          if (!requireParentMode && isParentMode) {
            navigate('/works', { replace: true });
            return;
          }
        }
      }
    };

    checkAccess();
  }, [loading, user, isParentMode, requireParentMode, navigate]);

  if (loading) {
    return <LoadingState />;
  }

  if (!user) {
    return null;
  }

  if (requireParentMode !== undefined) {
    if (requireParentMode && !isParentMode) {
      return null;
    }
    
    if (!requireParentMode && isParentMode) {
      return null;
    }
  }

  return <>{children}</>;
} 