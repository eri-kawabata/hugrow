// ナビゲーションの定数定義
export const NAVIGATION_RULES = {
  // 認証前のルート
  public: {
    routes: ['/login', '/signup'],
    redirect: '/login'
  },

  // 子供モード用のルート
  child: {
    routes: [
      '/home',           // ホーム
      '/my-works',       // 作品一覧
      '/camera',         // カメラ
      '/drawing',        // お絵かき
      '/works/new',      // 新規作品
      '/learning',       // 学習トップ
      '/learning/science',
      '/learning/technology',
      '/learning/engineering',
      '/learning/art',
      '/learning/math',
      '/challenge'       // チャレンジ
    ],
    bottomNav: [
      { path: '/', icon: 'Home', label: 'ホーム' },
      { path: '/my-works', icon: 'Image', label: 'さくひんしゅう' },
      { path: '/camera', icon: 'Camera', label: 'カメラ' }
    ],
    redirect: '/home'
  },

  // 保護者モード用のルート
  parent: {
    routes: [
      '/home',                     // ホーム
      '/works',                    // 作品一覧
      '/report',                   // レポート
      '/sel-quest',               // SEL質問
      '/sel-analytics',           // SEL分析
      '/parent/profile',          // プロフィール
      '/parent/child-profile',    // 子供プロフィール
      '/learning/arts/analytics'  // 学習分析
    ],
    bottomNav: [
      { path: '/', icon: 'Home', label: 'ホーム' },
      { path: '/works', icon: 'Image', label: '作品一覧' }
    ],
    redirect: '/home'
  }
} as const;

export const LEARNING_ROUTES = {
  // 子供モード用の学習ルート
  child: {
    routes: [
      {
        path: '/learning',
        label: '学習トップ',
        children: [
          { path: '/learning/science', label: '理科' },
          { path: '/learning/technology', label: '技術' },
          { path: '/learning/engineering', label: '工学' },
          { path: '/learning/art', label: '芸術' },
          { path: '/learning/math', label: '算数' }
        ]
      }
    ],
    redirect: '/learning'
  },

  // 保護者モード用の学習ルート
  parent: {
    routes: [
      {
        path: '/learning/arts/analytics',
        label: '学習分析',
      }
    ],
    redirect: '/learning/arts/analytics'
  }
} as const;

// ルートの種類を判定する関数
export function getRouteType(path: string): 'public' | 'child' | 'parent' | null {
  if (NAVIGATION_RULES.public.routes.includes(path)) return 'public';
  if (NAVIGATION_RULES.child.routes.includes(path)) return 'child';
  if (NAVIGATION_RULES.parent.routes.includes(path)) return 'parent';
  return null;
}

// アクセス可能かチェックする関数
export function canAccess(path: string, isParentMode: boolean): boolean {
  const routeType = getRouteType(path);
  if (routeType === 'public') return true;
  if (isParentMode) return routeType === 'parent';
  return routeType === 'child';
}

// リダイレクト先を取得する関数
export function getRedirectPath(isParentMode: boolean): string {
  return isParentMode 
    ? NAVIGATION_RULES.parent.redirect 
    : NAVIGATION_RULES.child.redirect;
} 