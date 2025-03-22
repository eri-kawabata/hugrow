// 音声ファイルの型定義
type AudioType = 'complete' | 'levelUp' | 'badge' | 'click';

// 音声ファイルのキャッシュ
const audioCache: { [key in AudioType]?: HTMLAudioElement } = {};

// 音声ファイルのパス
const audioFiles: { [key in AudioType]: string } = {
  complete: '/sounds/complete.mp3',
  levelUp: '/sounds/level-up.mp3',
  badge: '/sounds/badge.mp3',
  click: '/sounds/click.mp3'
};

// 音声を再生する関数
export const playSound = async (type: AudioType) => {
  try {
    // ユーザーの操作なしには音声を再生できない場合があるため、
    // ユーザーインタラクションがあった後に初期化する
    if (!audioCache[type]) {
      const audio = new Audio();
      audio.preload = 'auto';
      
      // 音声ファイルの存在確認
      const response = await fetch(audioFiles[type]);
      if (!response.ok) {
        throw new Error(`音声ファイル ${audioFiles[type]} が見つかりません`);
      }
      
      audio.src = audioFiles[type];
      audioCache[type] = audio;
      
      // 音声ファイルの読み込みを待機
      await new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', resolve);
        audio.addEventListener('error', reject);
        audio.load();
      });
    }

    const audio = audioCache[type];
    if (audio) {
      // 再生中の場合は最初から再生し直す
      audio.currentTime = 0;
      try {
        await audio.play();
      } catch (playError) {
        console.warn('音声の再生に失敗しました:', playError);
        // 再生に失敗した場合は、キャッシュをクリアして再試行
        audioCache[type] = undefined;
      }
    }
  } catch (error) {
    console.warn('音声の初期化に失敗しました:', error);
  }
};

// 音量を設定する関数
export const setVolume = (volume: number) => {
  Object.values(audioCache).forEach(audio => {
    if (audio) {
      audio.volume = Math.max(0, Math.min(1, volume));
    }
  });
};

// 音声を事前にロードする関数
export const preloadAudio = async () => {
  try {
    await Promise.all(
      Object.entries(audioFiles).map(async ([type, path]) => {
        try {
          const audio = new Audio();
          audio.preload = 'auto';
          
          // 音声ファイルの存在確認
          const response = await fetch(path);
          if (!response.ok) {
            throw new Error(`音声ファイル ${path} が見つかりません`);
          }
          
          audio.src = path;
          audioCache[type as AudioType] = audio;
          
          // 音声ファイルの読み込みを待機
          await new Promise((resolve, reject) => {
            audio.addEventListener('canplaythrough', resolve);
            audio.addEventListener('error', reject);
            audio.load();
          });
        } catch (error) {
          console.warn(`音声ファイル ${path} の初期化に失敗しました:`, error);
        }
      })
    );
  } catch (error) {
    console.warn('音声ファイルのプリロードに失敗しました:', error);
  }
}; 