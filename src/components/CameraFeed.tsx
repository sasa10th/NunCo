import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useFocusStore } from '@/store/focusStore';
import { useFaceAnalysis } from '@/hooks/useFaceAnalysis';
import { useLuminance } from '@/hooks/useLuminance';

export interface CameraFeedHandle {
  stop: () => void;
}

interface CameraFeedProps {
  isActive: boolean;
}

const CameraFeed = forwardRef<CameraFeedHandle, CameraFeedProps>(({ isActive }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const focusState = useFocusStore(s => s.focusState);
  const focusReason = useFocusStore(s => s.focusReason);
  const showOverlay = useFocusStore(s => s.showOverlay);

  useFaceAnalysis(videoRef, canvasRef, isActive);
  useLuminance(videoRef, isActive);

  useEffect(() => {
    if (!isActive) return;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Camera access denied:', err);
      }
    };

    startCamera();

    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    };
  }, [isActive]);

  useImperativeHandle(ref, () => ({
    stop: () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    },
  }));

  const borderColor =
    focusState === 'focused' ? 'border-focus-green' :
    focusState === 'distracted' ? 'border-focus-red' :
    'border-focus-gray';

  const glowClass =
    focusState === 'focused' ? 'glow-green' :
    focusState === 'distracted' ? 'glow-red' :
    'glow-gray';

  const statusBadge =
    focusState === 'focused' ? { text: '집중 중 🟢', cls: 'bg-focus-green/20 text-focus-green' } :
    focusState === 'distracted' ? { text: '집중 아님 🔴', cls: 'bg-focus-red/20 text-focus-red' } :
    { text: '얼굴 없음 ⚫', cls: 'bg-focus-gray/20 text-focus-gray' };

  return (
    <div className={`relative rounded-xl overflow-hidden border-2 ${borderColor} ${glowClass} transition-focus`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover scale-x-[-1]"
      />
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full scale-x-[-1] pointer-events-none transition-opacity duration-300 ${showOverlay ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Status badge */}
      <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${statusBadge.cls} backdrop-blur-sm`}>
        {statusBadge.text}
      </div>

      {/* Distraction reason */}
      {focusReason && (
        <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs bg-card/80 text-focus-red backdrop-blur-sm font-mono">
          {focusReason}
        </div>
      )}
    </div>
  );
});

CameraFeed.displayName = 'CameraFeed';
export default CameraFeed;
