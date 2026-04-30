import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

const LEFT_EYE_IDX = [362, 385, 387, 263, 373, 380];
const RIGHT_EYE_IDX = [33, 160, 158, 133, 153, 144];

function distance(a: NormalizedLandmark, b: NormalizedLandmark): number {
  return Math.sqrt(
    (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2
  );
}

function eyeAspectRatio(landmarks: NormalizedLandmark[], indices: number[]): number {
  const p = indices.map(i => landmarks[i]);
  // Vertical distances
  const v1 = distance(p[1], p[5]);
  const v2 = distance(p[2], p[4]);
  // Horizontal distance
  const h = distance(p[0], p[3]);
  if (h === 0) return 0;
  return (v1 + v2) / (2.0 * h);
}

export function calculateEAR(landmarks: NormalizedLandmark[]): number {
  const leftEAR = eyeAspectRatio(landmarks, LEFT_EYE_IDX);
  const rightEAR = eyeAspectRatio(landmarks, RIGHT_EYE_IDX);
  return (leftEAR + rightEAR) / 2.0;
}
