import { useEffect, useRef } from 'react';
import { useFocusStore, SENSITIVITY_PRESETS } from '@/store/focusStore';

export function useFocusTimer() {
  const phase = useFocusStore(s => s.phase);
  const focusState = useFocusStore(s => s.focusState);
  const goalSeconds = useFocusStore(s => s.goalSeconds);
  const sensitivity = useFocusStore(s => s.sensitivity);
  const setFocusedTime = useFocusStore(s => s.setFocusedTime);
  const setSessionTime = useFocusStore(s => s.setSessionTime);
  const setPhase = useFocusStore(s => s.setPhase);
  const addSession = useFocusStore(s => s.addSession);

  const focusedTimeRef = useRef(0);
  const sessionTimeRef = useRef(0);
  const lastTickRef = useRef(0);
  const distractedSinceRef = useRef<number | null>(null);

  // Reset refs when phase changes to running
  useEffect(() => {
    if (phase === 'running') {
      focusedTimeRef.current = 0;
      sessionTimeRef.current = 0;
      lastTickRef.current = Date.now();
      distractedSinceRef.current = null;
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== 'running') return;

    const graceTime = SENSITIVITY_PRESETS[sensitivity].distractGrace;

    const interval = setInterval(() => {
      const now = Date.now();
      const delta = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      sessionTimeRef.current += delta;
      setSessionTime(sessionTimeRef.current);

      if (focusState === 'focused') {
        distractedSinceRef.current = null;
        focusedTimeRef.current += delta;
        setFocusedTime(focusedTimeRef.current);
      } else if (focusState === 'distracted') {
        if (distractedSinceRef.current === null) {
          distractedSinceRef.current = now;
        }
        const distractedDuration = (now - distractedSinceRef.current) / 1000;
        if (distractedDuration <= graceTime) {
          // Still within grace period — count as focused
          focusedTimeRef.current += delta;
          setFocusedTime(focusedTimeRef.current);
        }
        // Beyond grace: don't count
      }
      // no_face: timer pauses (don't add to focusedTime)

      // Check goal
      if (focusedTimeRef.current >= goalSeconds) {
        const focusRate = sessionTimeRef.current > 0
          ? (focusedTimeRef.current / sessionTimeRef.current) * 100
          : 0;
        addSession({
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
          goalSeconds,
          focusedTime: focusedTimeRef.current,
          sessionTime: sessionTimeRef.current,
          focusRate,
        });
        setPhase('completed');
      }
    }, 100);

    return () => clearInterval(interval);
  }, [phase, focusState, goalSeconds, sensitivity, setFocusedTime, setSessionTime, setPhase, addSession]);
}
