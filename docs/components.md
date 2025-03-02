# コンポーネント設計

## 共通コンポーネント

### レイアウト
```mermaid
flowchart TD
    A[BaseLayout] --> B[Header]
    A --> C[Footer]
    A --> D[Outlet]
```

### 認証関連
```mermaid
flowchart TD
    A[AuthProvider] --> B[Auth]
    A --> C[SignUp]
    B --> D[InputField]
    B --> E[LoginButton]
    C --> D
    C --> F[SignUpButton]
```

### 共通UI
```mermaid
flowchart TD
    A[Common] --> B[LoadingSpinner]
    A --> C[ErrorMessage]
    A --> D[EmptyState]
    A --> E[ProtectedRoute]
```

## 保護者向けコンポーネント

### ダッシュボード
```mermaid
flowchart TD
    A[ParentDashboard] --> B[AnalyticsSummary]
    A --> C[RecentWorks]
    A --> D[SELSummary]
```

### 分析
```mermaid
flowchart TD
    A[AnalyticsRoutes] --> B[SELAnalytics]
    A --> C[ArtsAnalytics]
    B --> D[EmotionChart]
    B --> E[EmotionTimeline]
    C --> F[LearningChart]
    C --> G[ProgressTimeline]
```

### 作品管理
```mermaid
flowchart TD
    A[ParentWorksRoutes] --> B[ParentWorks]
    A --> C[WorkDetail]
    B --> D[WorkCard]
    B --> E[WorksGrid]
    C --> F[WorkContent]
```

## 子供向けコンポーネント

### 学習
```mermaid
flowchart TD
    A[LearningRoutes] --> B[Learning]
    A --> C[ScienceLearning]
    A --> D[TechnologyLearning]
    A --> E[EngineeringLearning]
    A --> F[ArtLearning]
    A --> G[MathLearning]
```

### 作品作成
```mermaid
flowchart TD
    A[ChildWorksRoutes] --> B[MyWorks]
    A --> C[WorkUpload]
    A --> D[DrawingCanvas]
    A --> E[AudioRecorder]
    A --> F[CameraUpload]
    A --> G[WorkDetail]
```

### きもちクエスト
```mermaid
flowchart TD
    A[SELQuest] --> B[EmotionSelector]
    A --> C[EmotionIntensity]
    A --> D[EmotionNote]
```

## コンポーネント一覧

### 共通コンポーネント
- `BaseLayout` - 基本レイアウト
- `Header` - ヘッダー
- `Footer` - フッター
- `LoadingSpinner` - ローディング表示
- `ErrorMessage` - エラーメッセージ
- `EmptyState` - 空の状態表示
- `ProtectedRoute` - 認証保護ルート

### 認証コンポーネント
- `AuthProvider` - 認証状態管理
- `Auth` - ログインフォーム
- `SignUp` - 新規登録フォーム
- `InputField` - 入力フィールド
- `LoginButton` - ログインボタン
- `SignUpButton` - 新規登録ボタン

### 保護者向けコンポーネント
- `ParentLayout` - 保護者用レイアウト
- `ParentDashboard` - ダッシュボード
- `SELAnalytics` - 感情分析
- `ArtsAnalytics` - 学習分析
- `ParentWorks` - 作品一覧
- `WorkDetail` - 作品詳細

### 子供向けコンポーネント
- `ChildLayout` - 子供用レイアウト
- `Home` - ホーム画面
- `Learning` - 学習トップ
- `MyWorks` - 作品一覧
- `WorkUpload` - 作品アップロード
- `DrawingCanvas` - お絵かき
- `AudioRecorder` - 音声録音
- `CameraUpload` - 写真撮影
- `SELQuest` - きもちクエスト

## コンポーネント設計方針

### 1. 責務の分離
- Presentational Components（見た目）とContainer Components（ロジック）の分離
- 共通UIコンポーネントの再利用

### 2. パフォーマンス最適化
- `React.memo`による不要な再レンダリングの防止
- 適切なコンポーネントの分割
- Suspenseによる遅延ローディング

### 3. エラーハンドリング
- エラー境界の適切な配置
- ユーザーフレンドリーなエラーメッセージ
- リトライ機能の実装

### 4. アクセシビリティ
- WAI-ARIAの適切な使用
- キーボード操作のサポート
- スクリーンリーダー対応

### 5. 状態管理
- コンポーネントローカルな状態はuseState
- 共有が必要な状態はコンテキスト
- 複雑な状態管理はカスタムフック 