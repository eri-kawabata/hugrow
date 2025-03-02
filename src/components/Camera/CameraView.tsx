import { useCallback, useRef, useState } from 'react';
import { Camera, RotateCw, X } from 'lucide-react';
import { useCamera } from '../../hooks/useCamera';

interface CameraViewProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export function CameraView({ onCapture, onClose }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const { startCamera, stopCamera, takePhoto } = useCamera(videoRef);

  const handleFlipCamera = useCallback(async () => {
    await stopCamera();
    setIsFrontCamera(prev => !prev);
    await startCamera(!isFrontCamera);
  }, [isFrontCamera, startCamera, stopCamera]);

  const handleTakePhoto = useCallback(async () => {
    const file = await takePhoto(canvasRef);
    if (file) {
      onCapture(file);
    }
  }, [takePhoto, onCapture]);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
      {/* カメラプレビュー */}
      <div className="relative w-full max-w-lg aspect-[3/4] bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {/* カメラ切り替えボタン */}
        <button
          onClick={handleFlipCamera}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        >
          <RotateCw className="h-6 w-6" />
        </button>
      </div>

      {/* シャッターボタン */}
      <div className="fixed bottom-8">
        <button
          onClick={handleTakePhoto}
          className="p-4 rounded-full bg-white hover:bg-gray-100 transition-colors"
        >
          <Camera className="h-8 w-8 text-black" />
        </button>
      </div>
    </div>
  );
} 