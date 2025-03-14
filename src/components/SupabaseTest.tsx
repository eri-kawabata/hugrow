import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const SupabaseTest = () => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [buckets, setBuckets] = useState<string[]>([]);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // セッション情報の取得
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        setSessionInfo(sessionData);
        
        // バケット一覧の取得
        const { data: bucketsData, error: bucketsError } = await supabase.storage.listBuckets();
        
        if (bucketsError) {
          throw bucketsError;
        }
        
        setBuckets(bucketsData.map(bucket => bucket.name));
        
        // 接続成功
        setConnectionStatus('connected');
      } catch (error: any) {
        console.error('Supabase接続エラー:', error);
        setConnectionStatus('error');
        setErrorMessage(error.message || 'Supabaseとの接続中にエラーが発生しました');
      }
    };
    
    checkConnection();
  }, []);

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Supabase接続テスト</h2>
      
      {connectionStatus === 'checking' && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">接続を確認中...</span>
        </div>
      )}
      
      {connectionStatus === 'error' && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          <p className="font-bold">エラーが発生しました</p>
          <p>{errorMessage}</p>
        </div>
      )}
      
      {connectionStatus === 'connected' && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          <p className="font-bold">Supabaseに正常に接続されています</p>
          
          <div className="mt-4">
            <h3 className="font-bold">セッション情報:</h3>
            <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-auto max-h-32">
              {JSON.stringify(sessionInfo, null, 2)}
            </pre>
          </div>
          
          <div className="mt-4">
            <h3 className="font-bold">利用可能なバケット:</h3>
            {buckets.length > 0 ? (
              <ul className="list-disc list-inside mt-1">
                {buckets.map(bucket => (
                  <li key={bucket}>{bucket}</li>
                ))}
              </ul>
            ) : (
              <p className="italic mt-1">バケットが見つかりません</p>
            )}
          </div>
        </div>
      )}
      
      <div className="mt-4 text-center text-sm text-gray-600">
        <p>環境変数: {import.meta.env.VITE_SUPABASE_URL ? '設定済み' : '未設定'}</p>
      </div>
    </div>
  );
}; 