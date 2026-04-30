import { useRef, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { useFocusStore } from '@/store/focusStore';

export function useLuminance(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  isActive: boolean
) {
  const frameCountRef = useRef(0);
  const lastLuminanceRef = useRef<number | null>(null);
  const suppressUntilRef = useRef(0);
  const rafRef = useRef(0);
  const setEnvironmentValues = useFocusStore(s => s.setEnvironmentValues);

  const checkLuminance = useCallback(() => {
    if (!isActive) return;
    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(checkLuminance);
      return;
    }

    frameCountRef.current++;
    if (frameCountRef.current % 15 === 0) {
      const canvas = document.createElement('canvas');
      const size = 32;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;
        let sumLum = 0;
        let sumR = 0, sumG = 0, sumB = 0;
        const pixelCount = size * size;
        for (let i = 0; i < data.length; i += 4) {
          sumLum += (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
          sumR += data[i];
          sumG += data[i + 1];
          sumB += data[i + 2];
        }
        const avgLum = sumLum / pixelCount;
        const avgR = sumR / pixelCount;
        const avgB = sumB / pixelCount;

        // Estimate color temperature from R/B ratio (rough approximation)
        // Higher R/B = warmer (lower K), Higher B/R = cooler (higher K)
        const rb = avgR / Math.max(avgB, 1);
        // Map ratio ~0.5-2.0 to ~8000K-2500K
        const colorTemp = Math.round(Math.max(2500, Math.min(8000, 6500 - (rb - 1) * 3000)));

        setEnvironmentValues(Math.round(avgLum), colorTemp);

        if (lastLuminanceRef.current !== null) {
          const delta = Math.abs(avgLum - lastLuminanceRef.current);
          if (delta > 40 && Date.now() > suppressUntilRef.current) {
            suppressUntilRef.current = Date.now() + 3000;
            toast({
              title: '⚡ 조도 변화 감지됨',
              description: '판정을 1초간 보류합니다.',
              duration: 2000,
            });
          }
        }
        lastLuminanceRef.current = avgLum;
      }
    }

    rafRef.current = requestAnimationFrame(checkLuminance);
  }, [isActive, videoRef, setEnvironmentValues]);

  useEffect(() => {
    if (!isActive) return;
    rafRef.current = requestAnimationFrame(checkLuminance);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isActive, checkLuminance]);
}
