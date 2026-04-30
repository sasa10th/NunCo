import type { FocusState } from '@/store/focusStore';

export interface FocusParams {
  earThreshold: number;
  headPitchDownMax: number;
  headPitchUpMax: number;
  headYawMax: number;
  smoothWindow: number;
}

export interface ClassifyResult {
  state: FocusState;
  reason: string;
}

// Ring buffer for smoothing
const stateHistory: FocusState[] = [];

export function classifyFocus(
  ear: number,
  pitch: number,
  yaw: number,
  hasFace: boolean,
  params: FocusParams
): ClassifyResult {
  if (!hasFace) {
    stateHistory.push('no_face');
    if (stateHistory.length > params.smoothWindow) stateHistory.shift();
    return { state: 'no_face', reason: '얼굴 미감지' };
  }

  let rawState: FocusState = 'focused';
  let reason = '';

  if (ear < params.earThreshold) {
    rawState = 'distracted';
    reason = `눈 감음 EAR ${ear.toFixed(2)}`;
  } else if (pitch < -params.headPitchDownMax) {
    rawState = 'distracted';
    reason = `고개 숙임 ${pitch.toFixed(0)}°`;
  } else if (pitch > params.headPitchUpMax) {
    rawState = 'distracted';
    reason = `고개 젖힘 +${pitch.toFixed(0)}°`;
  } else if (Math.abs(yaw) > params.headYawMax) {
    rawState = 'distracted';
    reason = `고개 돌림 ${yaw.toFixed(0)}°`;
  }

  stateHistory.push(rawState);
  if (stateHistory.length > params.smoothWindow) stateHistory.shift();

  // Majority vote
  const counts: Record<string, number> = { focused: 0, distracted: 0, no_face: 0 };
  for (const s of stateHistory) counts[s]++;

  let smoothed: FocusState = 'focused';
  if (counts.no_face > counts.focused && counts.no_face > counts.distracted) {
    smoothed = 'no_face';
    reason = '얼굴 미감지';
  } else if (counts.distracted >= counts.focused) {
    smoothed = 'distracted';
  } else {
    smoothed = 'focused';
    reason = '';
  }

  return { state: smoothed, reason };
}

export function resetClassifier() {
  stateHistory.length = 0;
}
