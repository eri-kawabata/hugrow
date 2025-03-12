import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// .envファイルから環境変数を読み込む
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('環境変数が設定されていません。');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAvatarsBucket() {
  try {
    const { data, error } = await supabase.storage.createBucket('avatars', {
      public: true, // プロフィール画像は公開アクセスが必要
      allowedMimeTypes: ['image/*'], // 画像ファイルのみ許可
      fileSizeLimit: '5MB', // 最大ファイルサイズを5MBに制限
    });

    if (error) {
      console.error('バケットの作成に失敗しました:', error);
    } else {
      console.log('avatarsバケットが正常に作成されました:', data);
    }
  } catch (err) {
    console.error('エラーが発生しました:', err);
  }
}

createAvatarsBucket(); 