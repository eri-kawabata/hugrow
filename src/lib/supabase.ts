import { createClient } from '@supabase/supabase-js';

// 環境変数から設定を取得
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 環境変数のチェック
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase環境変数が設定されていません');
}

// Supabaseクライアントの初期化（最小限の設定）
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// 初期化確認
console.log('Supabaseクライアント初期化完了');

// 認証状態の確認
(async () => {
  try {
    const { data } = await supabase.auth.getSession();
    console.log('認証セッション状態:', data.session ? '認証済み' : '未認証');
  } catch (e) {
    console.error('認証セッション確認エラー');
  }
})();

// ストレージバケットの初期化を試みる
(async () => {
  try {
    // 既存のバケットを確認
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('バケット一覧の取得に失敗:', error);
      return;
    }
    
    console.log('利用可能なバケット:', buckets?.map(b => b.name) || []);
    
    // avatarsバケットが存在しない場合は作成を試みる
    if (!buckets?.some(bucket => bucket.name === 'avatars')) {
      console.log('avatarsバケットが見つからないため作成を試みます');
      
      try {
        const { data, error: createError } = await supabase.storage.createBucket('avatars', {
          public: true
        });
        
        if (createError) {
          console.error('avatarsバケットの作成に失敗:', createError);
        } else {
          console.log('avatarsバケットを作成しました:', data);
        }
      } catch (e) {
        console.error('バケット作成中にエラーが発生:', e);
      }
    }
  } catch (e) {
    console.error('ストレージ初期化中にエラーが発生:', e);
  }
})();