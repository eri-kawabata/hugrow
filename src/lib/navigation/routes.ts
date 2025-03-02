import { lazy } from 'react';

// レイジーロード用のルート定義
export const routes = {
  home: {
    path: '/',
    component: lazy(() => import('../../components/Home')),
    auth: false
  },
  login: {
    path: '/login',
    component: lazy(() => import('../../components/Auth/Login')),
    auth: false
  },
  report: {
    path: '/report',
    component: lazy(() => import('../../components/Report')),
    auth: true
  },
  selQuest: {
    path: '/sel-quest',
    component: lazy(() => import('../../components/SELQuest')),
    auth: true
  },
  settings: {
    path: '/settings',
    component: lazy(() => import('../../components/Settings')),
    auth: true
  }
} as const;

// 画面遷移の定義
export const navigationFlow = {
  // ログイン前フロー
  public: {
    home: ['login'],
    login: ['home', 'report']
  },
  // ログイン後フロー
  private: {
    report: ['selQuest', 'settings'],
    selQuest: ['report'],
    settings: ['report']
  }
} as const;

// 権限に基づくアクセス制御
export const roleBasedAccess = {
  child: ['report', 'selQuest'],
  parent: ['report', 'selQuest', 'settings'],
  admin: ['report', 'selQuest', 'settings']
} as const; 