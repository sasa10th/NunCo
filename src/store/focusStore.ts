import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SessionRecord {
  id: string;
  date: string;
  goalSeconds: number;
  focusedTime: number;
  sessionTime: number;
  focusRate: number;
}

export type FocusState = 'focused' | 'distracted' | 'no_face';
export type Phase = 'setup' | 'running' | 'paused' | 'completed' | 'report';
export type Sensitivity = 'low' | 'medium' | 'high';

export const SENSITIVITY_PRESETS: Record<Sensitivity, {
  earThreshold: number;
  headPitchDownMax: number;
  headPitchUpMax: number;
  headYawMax: number;
  distractGrace: number;
  smoothWindow: number;
}> = {
  low: { earThreshold: 0.18, headPitchDownMax: 30, headPitchUpMax: 25, headYawMax: 35, distractGrace: 3.0, smoothWindow: 20 },
  medium: { earThreshold: 0.21, headPitchDownMax: 25, headPitchUpMax: 20, headYawMax: 30, distractGrace: 2.0, smoothWindow: 15 },
  high: { earThreshold: 0.24, headPitchDownMax: 20, headPitchUpMax: 15, headYawMax: 25, distractGrace: 1.0, smoothWindow: 10 },
};

interface FocusStore {
  // Settings
  goalSeconds: number;
  sensitivity: Sensitivity;
  setGoalSeconds: (s: number) => void;
  setSensitivity: (s: Sensitivity) => void;

  // Runtime
  phase: Phase;
  focusState: FocusState;
  focusReason: string;
  setPhase: (p: Phase) => void;
  setFocusState: (s: FocusState) => void;
  setFocusReason: (r: string) => void;

  // Timer
  focusedTime: number;
  sessionTime: number;
  sessionStart: number | null;
  setFocusedTime: (t: number) => void;
  setSessionTime: (t: number) => void;
  setSessionStart: (t: number | null) => void;

  // Debug
  ear: number;
  pitch: number;
  yaw: number;
  setDebugValues: (ear: number, pitch: number, yaw: number) => void;

  // Environment metrics
  luminance: number;
  colorTemp: number;
  setEnvironmentValues: (luminance: number, colorTemp: number) => void;

  // Overlay toggle
  showOverlay: boolean;
  setShowOverlay: (v: boolean) => void;

  // History
  sessions: SessionRecord[];
  addSession: (s: SessionRecord) => void;

  // Reset
  resetSession: () => void;
}

export const useFocusStore = create<FocusStore>()(
  persist(
    (set) => ({
      goalSeconds: 30 * 60,
      sensitivity: 'medium',
      setGoalSeconds: (goalSeconds) => set({ goalSeconds }),
      setSensitivity: (sensitivity) => set({ sensitivity }),

      phase: 'setup',
      focusState: 'no_face',
      focusReason: '',
      setPhase: (phase) => set({ phase }),
      setFocusState: (focusState) => set({ focusState }),
      setFocusReason: (focusReason) => set({ focusReason }),

      focusedTime: 0,
      sessionTime: 0,
      sessionStart: null,
      setFocusedTime: (focusedTime) => set({ focusedTime }),
      setSessionTime: (sessionTime) => set({ sessionTime }),
      setSessionStart: (sessionStart) => set({ sessionStart }),

      ear: 0,
      pitch: 0,
      yaw: 0,
      setDebugValues: (ear, pitch, yaw) => set({ ear, pitch, yaw }),

      luminance: 0,
      colorTemp: 0,
      setEnvironmentValues: (luminance, colorTemp) => set({ luminance, colorTemp }),

      showOverlay: true,
      setShowOverlay: (showOverlay) => set({ showOverlay }),

      sessions: [],
      addSession: (s) => set((state) => ({
        sessions: [...state.sessions.slice(-6), s],
      })),

      resetSession: () => set({
        phase: 'setup',
        focusState: 'no_face',
        focusReason: '',
        focusedTime: 0,
        sessionTime: 0,
        sessionStart: null,
        ear: 0,
        pitch: 0,
        yaw: 0,
        luminance: 0,
        colorTemp: 0,
      }),
    }),
    {
      name: 'focuslock-storage',
      partialize: (state) => ({ sessions: state.sessions }),
    }
  )
);
