import { useCallback, useEffect, RefObject } from 'react';

export function useCamera(videoRef: RefObject<HTMLVideoElement>) {
  const startCamera = useCallback(async (isFrontCamera: boolean) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: isFrontCamera ? 'user' : 'environment',
          aspectRatio: 3/4,
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('カメラの起動に失敗しました:', error);
    }
  }, [videoRef]);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, [videoRef]);

  const takePhoto = useCallback(async (canvasRef: RefObject<HTMLCanvasElement>) => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // キャンバスのサイズをビデオに合わせる
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // 写真を撮影
    const context = canvas.getContext('2d');
    if (!context) return null;
    
    context.drawImage(video, 0, 0);

    // Blobに変換
    return new Promise<File | null>(resolve => {
      canvas.toBlob(blob => {
        if (!blob) {
          resolve(null);
          return;
        }
        const file = new File([blob], `photo-${Date.now()}.jpg`, {
          type: 'image/jpeg'
        });
        resolve(file);
      }, 'image/jpeg', 0.8);
    });
  }, [videoRef]);

  // コンポーネントのマウント時にカメラを起動
  useEffect(() => {
    startCamera(true);
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  return {
    startCamera,
    stopCamera,
    takePhoto
  };
} 