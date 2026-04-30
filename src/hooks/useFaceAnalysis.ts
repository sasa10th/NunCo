import { useRef, useEffect, useCallback } from 'react';
import { FaceLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';
import { calculateEAR } from '@/lib/earCalculator';
import { extractHeadPose } from '@/lib/headPose';
import { classifyFocus, resetClassifier } from '@/lib/focusClassifier';
import { useFocusStore, SENSITIVITY_PRESETS } from '@/store/focusStore';

export function useFaceAnalysis(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  isActive: boolean
) {
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(-1);

  const setFocusState = useFocusStore(s => s.setFocusState);
  const setFocusReason = useFocusStore(s => s.setFocusReason);
  const setDebugValues = useFocusStore(s => s.setDebugValues);
  const sensitivity = useFocusStore(s => s.sensitivity);

  const initLandmarker = useCallback(async () => {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );
    const landmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numFaces: 1,
      outputFacialTransformationMatrixes: true,
      outputFaceBlendshapes: false,
    });
    landmarkerRef.current = landmarker;
  }, []);

  const processFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const landmarker = landmarkerRef.current;

    if (!video || !canvas || !landmarker || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const now = performance.now();
    if (now === lastTimeRef.current) {
      rafRef.current = requestAnimationFrame(processFrame);
      return;
    }
    lastTimeRef.current = now;

    const results = landmarker.detectForVideo(video, now);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      rafRef.current = requestAnimationFrame(processFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const params = SENSITIVITY_PRESETS[sensitivity];
    const hasFace = results.faceLandmarks && results.faceLandmarks.length > 0;

    if (hasFace) {
      const landmarks = results.faceLandmarks[0];
      const ear = calculateEAR(landmarks);

      let pitch = 0, yaw = 0;
      if (results.facialTransformationMatrixes && results.facialTransformationMatrixes.length > 0) {
        const pose = extractHeadPose(results.facialTransformationMatrixes[0]);
        pitch = pose.pitch;
        yaw = pose.yaw;
      }

      const result = classifyFocus(ear, pitch, yaw, true, params);
      setFocusState(result.state);
      setFocusReason(result.reason);
      setDebugValues(ear, pitch, yaw);

      // Draw landmarks
      const drawingUtils = new DrawingUtils(ctx);
      const color = result.state === 'focused' ? '#22c55e' : '#ef4444';
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_TESSELATION,
        { color: color + '40', lineWidth: 0.5 }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
        { color, lineWidth: 1.5 }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
        { color, lineWidth: 1.5 }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
        { color, lineWidth: 1.5 }
      );
    } else {
      const result = classifyFocus(0, 0, 0, false, params);
      setFocusState(result.state);
      setFocusReason(result.reason);
      setDebugValues(0, 0, 0);
    }

    rafRef.current = requestAnimationFrame(processFrame);
  }, [sensitivity, videoRef, canvasRef, setFocusState, setFocusReason, setDebugValues]);

  useEffect(() => {
    if (!isActive) return;
    
    let cancelled = false;

    const start = async () => {
      await initLandmarker();
      if (!cancelled) {
        resetClassifier();
        rafRef.current = requestAnimationFrame(processFrame);
      }
    };

    start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
    };
  }, [isActive, initLandmarker, processFrame]);
}
