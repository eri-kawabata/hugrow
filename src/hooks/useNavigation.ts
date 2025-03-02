import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes, navigationFlow, roleBasedAccess } from '../lib/navigation/routes';
import { useAuth } from './useAuth';

export function useNavigation() {
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const canNavigate = useCallback((to: keyof typeof routes) => {
    // 認証チェック
    if (routes[to].auth && !user) {
      return false;
    }

    // 権限チェック
    if (role && !roleBasedAccess[role].includes(to)) {
      return false;
    }

    // 遷移フローチェック
    const flow = user ? navigationFlow.private : navigationFlow.public;
    const currentPath = window.location.pathname.slice(1) || 'home';
    
    return flow[currentPath]?.includes(to);
  }, [user, role]);

  const navigateTo = useCallback((to: keyof typeof routes) => {
    if (canNavigate(to)) {
      navigate(routes[to].path);
      return true;
    }
    return false;
  }, [navigate, canNavigate]);

  return {
    canNavigate,
    navigateTo
  };
} 