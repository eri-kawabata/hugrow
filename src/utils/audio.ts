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
      audioCache[type] = new Audio(audioFiles[type]);
    }

    const audio = audioCache[type];
    if (audio) {
      // 再生中の場合は最初から再生し直す
      audio.currentTime = 0;
      await audio.play();
    }
  } catch (error) {
    console.error('音声の再生に失敗しました:', error);
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
export const preloadAudio = () => {
  Object.entries(audioFiles).forEach(([type, path]) => {
    const audio = new Audio(path);
    audioCache[type as AudioType] = audio;
    // プリロードを開始
    audio.load();
  });
}; 