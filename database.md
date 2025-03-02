# データベース構造

## テーブル一覧

### 1. works（作品管理）
| カラム名      | 型                     | NULL許可 | デフォルト値 | 説明                    |
|--------------|------------------------|----------|--------------|------------------------|
| id           | uuid                   | NO       | gen_random_uuid() | 作品の一意識別子 |
| user_id      | uuid                   | NO       | -            | 作成者のID（外部キー） |
| title        | text                   | NO       | -            | 作品のタイトル |
| description  | text                   | YES      | -            | 作品の説明 |
| type         | text                   | NO       | -            | 作品の種類（drawing/audio/photo） |
| content_url  | text                   | NO       | -            | 作品のコンテンツURL |
| thumbnail_url| text                   | YES      | -            | サムネイル画像のURL |
| status       | text                   | NO       | 'published'  | 作品の状態（draft/published/archived） |
| visibility   | text                   | NO       | 'public'     | 公開設定（public/private） |
| metadata     | jsonb                  | NO       | '{}'         | 追加メタデータ |
| created_at   | timestamp with time zone| NO      | now()        | 作成日時 |
| updated_at   | timestamp with time zone| YES     | now()        | 最終更新日時 |

インデックス：
- works_pkey: PRIMARY KEY (id)
- works_user_id_idx: (user_id)
- works_type_idx: (type)
- works_status_idx: (status)
- works_created_at_idx: (created_at DESC)
- works_visibility_idx: (visibility)

制約：
- works_pkey: PRIMARY KEY (id)
- works_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
- works_type_check: CHECK (type IN ('drawing', 'audio', 'photo'))
- works_status_check: CHECK (status IN ('draft', 'published', 'archived'))
- works_visibility_check: CHECK (visibility IN ('public', 'private'))

### 2. profiles（ユーザープロファイル）
| カラム名      | 型                     | NULL許可 | デフォルト値 | 説明                    |
|--------------|------------------------|----------|--------------|------------------------|
| id           | uuid                   | NO       | gen_random_uuid() | プロファイルの一意識別子 |
| user_id      | uuid                   | NO       | -            | ユーザーID（外部キー） |
| username     | text                   | NO       | -            | ユーザー名 |
| avatar_url   | text                   | YES      | -            | アバター画像のURL |
| role         | text                   | NO       | 'child'      | ユーザー種別（parent/child） |
| birthday     | date                   | YES      | -            | 生年月日 |
| parent_id    | uuid                   | YES      | -            | 親のユーザーID |
| child_number | integer               | YES      | 1            | 子供の番号 |
| bio          | text                   | YES      | -            | 自己紹介 |
| display_name | varchar(255)          | YES      | -            | 表示名 |
| status       | varchar(50)           | NO       | 'active'     | アカウントの状態 |
| settings     | jsonb                  | YES      | '{}'         | ユーザー設定 |
| preferences  | jsonb                  | YES      | '{"theme": "light", "language": "ja", "notifications": true}' | ユーザー設定 |
| metadata     | jsonb                  | YES      | '{}'         | 追加メタデータ |
| last_login_at| timestamp with time zone| YES     | -            | 最終ログイン日時 |
| last_active_at| timestamp with time zone| YES    | now()        | 最終アクティブ日時 |
| created_at   | timestamp with time zone| NO      | now()        | 作成日時 |
| updated_at   | timestamp with time zone| NO      | now()        | 最終更新日時 |

インデックス：
- profiles_pkey: PRIMARY KEY (id)
- unique_user_id: UNIQUE (user_id)
- profiles_user_role_idx: UNIQUE (user_id, role)
- profiles_user_role_child_number_idx: UNIQUE (user_id, role, COALESCE(child_number, 0))
- idx_profiles_user_id: (user_id)
- idx_profiles_role: (role)
- idx_profiles_status: (status)
- idx_profiles_parent_id: (parent_id) WHERE role = 'child' AND status = 'active'
- idx_profiles_username: (username) WHERE status = 'active'
- idx_profiles_created_at: (created_at)
- idx_profiles_last_login_at: (last_login_at)
- idx_profiles_role_status: (role, status) WHERE status = 'active'
- idx_profiles_metadata: GIN (metadata jsonb_path_ops)
- idx_profiles_settings: GIN (settings jsonb_path_ops)
- idx_profiles_preferences: GIN (preferences jsonb_path_ops)

制約：
- profiles_pkey: PRIMARY KEY (id)
- unique_user_id: UNIQUE (user_id)
- profiles_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
- profiles_parent_id_fkey: FOREIGN KEY (parent_id) REFERENCES profiles(id)
- profiles_role_check: CHECK (role IN ('child', 'parent'))
- profiles_status_check: CHECK (status IN ('active', 'inactive', 'suspended'))
- username_length_check: CHECK (char_length(username) BETWEEN 2 AND 50)
- display_name_length_check: CHECK (display_name IS NULL OR char_length(display_name) BETWEEN 2 AND 50)
- bio_length_check: CHECK (bio IS NULL OR char_length(bio) <= 500)
- valid_birthday_check: CHECK (birthday IS NULL OR birthday <= CURRENT_DATE)
- prevent_circular_parent_refs: CHECK (id <> parent_id)
- valid_parent_child: CHECK ((role = 'parent' AND parent_id IS NULL) OR (role = 'child' AND parent_id IS NOT NULL))

### 3. parent_child_relations（親子関係）
| カラム名      | 型                     | NULL許可 | デフォルト値 | 説明                    |
|--------------|------------------------|----------|--------------|------------------------|
| id           | uuid                   | NO       | gen_random_uuid() | 関係の一意識別子 |
| parent_id    | uuid                   | NO       | -            | 親のユーザーID |
| child_id     | uuid                   | NO       | -            | 子のユーザーID |
| relationship_type | varchar(50)       | YES      | 'parent'     | 関係の種類 |
| permissions  | jsonb                  | YES      | '{"can_view_sel": true, "can_view_works": true, "can_view_progress": true}' | 権限設定 |
| status       | varchar(50)           | YES      | 'active'     | 関係の状態 |
| created_at   | timestamp with time zone| YES     | now()        | 作成日時 |
| updated_at   | timestamp with time zone| YES     | now()        | 最終更新日時 |

インデックス：
- parent_child_relations_pkey: PRIMARY KEY (id)
- unique_parent_child_relation: UNIQUE (parent_id, child_id)
- idx_parent_child_relations_parent_id: (parent_id)
- idx_parent_child_relations_child_id: (child_id)
- idx_parent_child_relations_status: (status)

制約：
- parent_child_relations_pkey: PRIMARY KEY (id)
- unique_parent_child_relation: UNIQUE (parent_id, child_id)
- parent_child_relations_parent_id_fkey: FOREIGN KEY (parent_id) REFERENCES auth.users(id)
- parent_child_relations_child_id_fkey: FOREIGN KEY (child_id) REFERENCES auth.users(id)
- parent_child_relations_status_check: CHECK (status IN ('active', 'inactive', 'pending'))

### 4. learning_progress（学習進捗）
| カラム名       | 型                     | NULL許可 | デフォルト値 | 説明                    |
|---------------|------------------------|----------|--------------|------------------------|
| id            | uuid                   | NO       | gen_random_uuid() | 進捗の一意識別子 |
| user_id       | uuid                   | NO       | -            | ユーザーID |
| lesson_id     | text                   | NO       | -            | レッスンID |
| completed     | boolean                | YES      | false        | 完了フラグ |
| completed_at  | timestamp with time zone| YES     | -            | 完了日時 |
| started_at    | timestamp with time zone| YES     | now()        | 開始日時 |
| last_activity_at | timestamp with time zone| YES  | -            | 最終アクティビティ日時 |
| last_position | numeric                | YES      | 0            | 最後の位置 |
| quiz_score    | integer                | YES      | -            | クイズのスコア |
| score         | numeric                | YES      | -            | 総合スコア |
| difficulty_level | integer             | YES      | -            | 難易度レベル |
| time_spent    | integer                | YES      | -            | 学習時間（秒） |
| attempts      | integer                | YES      | 0            | 試行回数 |
| status        | varchar(50)            | YES      | 'in_progress'| 進捗状態 |
| progress_data | jsonb                  | YES      | '{"total_sections": 1, "current_section": 1, "completed_sections": []}' | 詳細な進捗データ |
| metadata      | jsonb                  | YES      | '{}'         | 追加メタデータ |
| created_at    | timestamp with time zone| NO      | now()        | 作成日時 |
| updated_at    | timestamp with time zone| NO      | now()        | 最終更新日時 |

インデックス：
- learning_progress_pkey: PRIMARY KEY (id)
- idx_learning_progress_user_lesson: (user_id, lesson_id)
- idx_learning_progress_user_id_created: (user_id, created_at)
- idx_learning_progress_status: (status)
- idx_learning_progress_completed: (completed_at) WHERE status = 'completed'
- idx_learning_progress_completed_at: (completed_at)
- idx_learning_progress_metadata: GIN (metadata)
- idx_learning_progress_progress_data: GIN (progress_data jsonb_path_ops)

制約：
- learning_progress_pkey: PRIMARY KEY (id)
- learning_progress_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
- valid_status: CHECK (status IN ('not_started', 'in_progress', 'completed', 'archived'))
- valid_difficulty_level: CHECK (difficulty_level BETWEEN 1 AND 5)
- valid_score: CHECK (score BETWEEN 0 AND 100)
- valid_attempts: CHECK (attempts >= 0)
- valid_time_spent: CHECK (time_spent >= 0)

### 5. sel_responses（感情分析回答）
| カラム名      | 型                     | NULL許可 | デフォルト値 | 説明                    |
|--------------|------------------------|----------|--------------|------------------------|
| id           | uuid                   | NO       | gen_random_uuid() | 回答の一意識別子 |
| user_id      | uuid                   | NO       | -            | ユーザーID |
| quest_id     | uuid                   | NO       | -            | クエストID |
| emotion      | text                   | NO       | -            | 感情タイプ |
| intensity    | integer                | NO       | -            | 感情の強度 |
| note         | text                   | YES      | -            | メモ |
| created_at   | timestamp with time zone| YES     | now()        | 作成日時 |

インデックス：
- sel_responses_pkey: PRIMARY KEY (id)

制約：
- sel_responses_pkey: PRIMARY KEY (id)
- sel_responses_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
- sel_responses_quest_id_fkey: FOREIGN KEY (quest_id) REFERENCES sel_quests(id) ON DELETE CASCADE
- sel_responses_intensity_check: CHECK (intensity BETWEEN 1 AND 5)

### 6. lessons（レッスン管理）
| カラム名      | 型                     | NULL許可 | デフォルト値 | 説明                    |
|--------------|------------------------|----------|--------------|------------------------|
| id           | uuid                   | NO       | gen_random_uuid() | レッスンの一意識別子 |
| subject      | text                   | NO       | -            | 科目（science/technology/engineering/art/math） |
| title        | text                   | NO       | -            | レッスンのタイトル |
| description  | text                   | NO       | -            | レッスンの説明 |
| difficulty   | integer                | NO       | 1            | 難易度（1-3） |
| duration     | integer                | NO       | -            | 所要時間（分） |
| points       | integer                | NO       | 100          | 獲得ポイント |
| order        | integer                | NO       | -            | 表示順序 |
| status       | text                   | NO       | 'active'     | 状態（active/inactive） |
| created_at   | timestamp with time zone| NO      | now()        | 作成日時 |
| updated_at   | timestamp with time zone| YES     | now()        | 最終更新日時 |

### 7. lesson_steps（レッスンステップ）
| カラム名      | 型                     | NULL許可 | デフォルト値 | 説明                    |
|--------------|------------------------|----------|--------------|------------------------|
| id           | uuid                   | NO       | gen_random_uuid() | ステップの一意識別子 |
| lesson_id    | uuid                   | NO       | -            | レッスンID（外部キー） |
| title        | text                   | NO       | -            | ステップのタイトル |
| content      | text                   | NO       | -            | 学習内容 |
| type         | text                   | NO       | 'content'    | タイプ（content/quiz） |
| order        | integer                | NO       | -            | 表示順序 |
| metadata     | jsonb                  | NO       | '{}'         | 追加メタデータ |
| created_at   | timestamp with time zone| NO      | now()        | 作成日時 |
| updated_at   | timestamp with time zone| YES     | now()        | 最終更新日時 |

### 8. lesson_quizzes（クイズ問題）
| カラム名      | 型                     | NULL許可 | デフォルト値 | 説明                    |
|--------------|------------------------|----------|--------------|------------------------|
| id           | uuid                   | NO       | gen_random_uuid() | クイズの一意識別子 |
| step_id      | uuid                   | NO       | -            | ステップID（外部キー） |
| question     | text                   | NO       | -            | 問題文 |
| choices      | jsonb                  | NO       | '[]'         | 選択肢の配列 |
| correct_index| integer                | NO       | -            | 正解の選択肢インデックス |
| explanation  | text                   | YES      | -            | 解説 |
| points       | integer                | NO       | 10           | 獲得ポイント |
| created_at   | timestamp with time zone| NO      | now()        | 作成日時 |
| updated_at   | timestamp with time zone| YES     | now()        | 最終更新日時 |

### 9. quiz_responses（クイズ回答履歴）
| カラム名      | 型                     | NULL許可 | デフォルト値 | 説明                    |
|--------------|------------------------|----------|--------------|------------------------|
| id           | uuid                   | NO       | gen_random_uuid() | 回答の一意識別子 |
| user_id      | uuid                   | NO       | -            | ユーザーID（外部キー） |
| quiz_id      | uuid                   | NO       | -            | クイズID（外部キー） |
| selected_index| integer               | NO       | -            | 選択した回答のインデックス |
| is_correct   | boolean                | NO       | -            | 正解かどうか |
| time_taken   | integer                | NO       | -            | 回答にかかった時間（秒） |
| created_at   | timestamp with time zone| NO      | now()        | 作成日時 |

インデックス：
- lessons: PRIMARY KEY (id), INDEX (subject, status)
- lesson_steps: PRIMARY KEY (id), FOREIGN KEY (lesson_id), INDEX (lesson_id, order)
- lesson_quizzes: PRIMARY KEY (id), FOREIGN KEY (step_id), INDEX (step_id)
- quiz_responses: PRIMARY KEY (id), FOREIGN KEY (user_id, quiz_id), INDEX (user_id, quiz_id, created_at)

## セキュリティポリシー

各テーブルに対して以下のRLSポリシーが設定されています：

### works テーブル
- `Users can create their own works`: 認証済みユーザーは自分の作品を作成可能
- `Users can update their own works`: 認証済みユーザーは自分の作品を更新可能
- `Users can view all works`: 認証済みユーザーは全ての作品を閲覧可能

### profiles テーブル
- `Users can view own profile`: ユーザーは自分のプロフィールを閲覧可能
- `Users can update own profile`: ユーザーは自分のプロフィールを更新可能
- `Users can insert own profile`: ユーザーは自分のプロフィールを作成可能
- `Parents can view children profiles`: 親は子どものプロフィールを閲覧可能（parent_child_relationsテーブルを使用）

### parent_child_relations テーブル
- `parent_child_relations_insert_as_parent`: 親のみが親子関係を作成可能
- `parent_child_relations_view_as_parent`: 親は自分が関係する親子関係を閲覧可能
- `parent_child_relations_view_as_child`: 子は自分が関係する親子関係を閲覧可能

### learning_progress テーブル
- `Users can view own progress`: ユーザーは自分の進捗を閲覧可能
- `Users can update own progress`: ユーザーは自分の進捗を更新可能
- `Parents can view children progress`: 親は子どもの進捗を閲覧可能
- `learning_progress_insert_policy`: 認証済みユーザーは自分の進捗を作成可能
- `learning_progress_select_policy`: 認証済みユーザーは自分の進捗を閲覧可能
- `learning_progress_update_policy`: 認証済みユーザーは自分の進捗を更新可能

### sel_responses テーブル
- `Users can create their own responses`: 認証済みユーザーは自分の回答を作成可能
- `Users can view their own responses`: 認証済みユーザーは自分の回答を閲覧可能
- `Users can manage their own responses`: 包括的な管理ポリシー
  - ユーザーは自分の回答に対して全ての操作が可能
  - 親は子どもの回答に対してアクセス可能

## トリガー

各テーブルには以下のトリガーが設定されています：

### works テーブル
- `works_updated_at`: 更新時に`updated_at`カラムを現在時刻に自動更新

### profiles テーブル
- `set_profiles_updated_at`: 更新時に`updated_at`カラムを現在時刻に自動更新
- `update_profile_timestamps`: プロフィール更新時のタイムスタンプ管理
- `update_profiles_updated_at`: プロフィール更新時の最終更新日時管理

### parent_child_relations テーブル
- `update_parent_child_relations_updated_at`: 親子関係更新時に`updated_at`カラムを現在時刻に自動更新

### learning_progress テーブル
- `update_learning_progress_timestamps`: 学習進捗更新時のタイムスタンプ管理

これらのトリガーは全て`BEFORE UPDATE`タイミングで実行され、レコードが更新される前にタイムスタンプを更新します。これにより、データの変更履歴を正確に追跡することができます。

## 補足情報

### インデックス戦略
- 頻繁に検索されるカラムにはインデックスを作成
- 複合インデックスは必要に応じて追加
- 大規模なテーブルの場合、定期的なインデックスの再構築を検討

### バックアップポリシー
- 日次バックアップの実施
- ポイントインタイムリカバリ（PITR）の有効化
- 重要なデータ変更前のスナップショット作成

### パフォーマンス最適化のヒント
1. 大量データの取得時はページネーションを使用
2. 必要なカラムのみを選択
3. 適切なインデックスの使用
4. 不要なJOINの削除

### 一般的なクエリ例
```sql
-- 子どもの作品一覧を取得（親向け）
SELECT w.*, p.username
FROM works w
JOIN profiles p ON w.user_id = p.user_id
WHERE w.user_id IN (
  SELECT child_id
  FROM parent_child_relations
  WHERE parent_id = :current_user_id
)
ORDER BY w.created_at DESC;

-- ユーザーの学習進捗状況
SELECT *
FROM learning_progress
WHERE user_id = :user_id
ORDER BY created_at DESC;

-- 感情分析の集計
SELECT emotion, COUNT(*) as count
FROM sel_responses
WHERE user_id = :user_id
AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY emotion;
``` 