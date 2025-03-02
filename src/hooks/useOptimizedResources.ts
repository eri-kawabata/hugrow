import { useState, useEffect } from 'react';

interface ResourceConfig {
  preloadImages?: string[];
  preloadAudio?: string[];
  cacheKey?: string;
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
          if (cached) {
            setLoaded(true);
            return;
          }
        }

        // 画像のプリロード
        if (config.preloadImages) {
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
        if (config.preloadAudio) {
          await Promise.all(
            config.preloadAudio.map(src => {
              return new Promise((resolve, reject) => {
                const audio = new Audio();
                audio.src = src;
                audio.oncanplaythrough = resolve;
                audio.onerror = reject;
              });
            })
          );
        }

        // キャッシュの保存
        if (config.cacheKey) {
          localStorage.setItem(config.cacheKey, 'true');
        }

        setLoaded(true);
      } catch (err) {
        setError(err as Error);
      }
    };

    loadResources();
  }, [config]);

  return { loaded, error };
} 