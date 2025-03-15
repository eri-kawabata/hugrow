import { useState, useEffect } from 'react';

interface ResourceConfig {
  preloadImages?: string[];
  preloadAudio?: string[];
  cacheKey?: string;
  cacheDuration?: number; // キャッシュの有効期間（ミリ秒）
}

export function useOptimizedResources(config: ResourceConfig) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadResources = async () => {
      try {
        // キャッシュチェック
        if (config.cacheKey) {
          const cached = localStorage.getItem(config.cacheKey);
          const cacheTime = localStorage.getItem(`${config.cacheKey}_time`);
          
          // キャッシュの有効期限をチェック
          if (cached && cacheTime) {
            const now = new Date().getTime();
            const cacheAge = now - parseInt(cacheTime);
            const duration = config.cacheDuration || 24 * 60 * 60 * 1000; // デフォルト24時間
            
            if (cacheAge < duration) {
              setLoaded(true);
              return;
            }
          }
        }

        // 画像のプリロード
        if (config.preloadImages && config.preloadImages.length > 0) {
          await Promise.all(
            config.preloadImages.map(src => {
              return new Promise((resolve, reject) => {
                const img = new Image();
                img.src = src;
                img.onload = resolve;
                img.onerror = reject;
              });
            })
          );
        }

        // 音声のプリロード
        if (config.preloadAudio && config.preloadAudio.length > 0) {
          await Promise.all(
            config.preloadAudio.map(src => {
              return new Promise((resolve, reject) => {
                const audio = new Audio();
                audio.src = src;
                audio.oncanplaythrough = resolve;
                audio.onerror = reject;
                // プリロードを強制
                audio.load();
              });
            })
          );
        }

        // キャッシュの保存
        if (config.cacheKey) {
          localStorage.setItem(config.cacheKey, 'true');
          localStorage.setItem(`${config.cacheKey}_time`, new Date().getTime().toString());
        }

        setLoaded(true);
      } catch (err) {
        setError(err as Error);
        // エラーが発生しても、ユーザー体験を妨げないようにロード完了とする
        setLoaded(true);
      }
    };

    loadResources();
  }, [config.cacheKey, config.cacheDuration, config.preloadImages, config.preloadAudio]);

  return { loaded, error };
} 