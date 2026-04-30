import { useEffect } from 'react';
import CameraFeed from '@/components/CameraFeed';
import FocusPanel from '@/components/FocusPanel';
import ProgressBar from '@/components/ProgressBar';
import GazeIndicator from '@/components/GazeIndicator';
import FocusGauge from '@/components/FocusGauge';
import EnvironmentPanel from '@/components/EnvironmentPanel';
import { useFocusStore } from '@/store/focusStore';
import { useFocusTimer } from '@/hooks/useFocusTimer';
import { Eye, EyeOff } from 'lucide-react';

export default function FocusView() {
  const phase = useFocusStore(s => s.phase);
  const focusedTime = useFocusStore(s => s.focusedTime);
  const goalSeconds = useFocusStore(s => s.goalSeconds);
  const setPhase = useFocusStore(s => s.setPhase);
  const resetSession = useFocusStore(s => s.resetSession);
  const showOverlay = useFocusStore(s => s.showOverlay);
  const setShowOverlay = useFocusStore(s => s.setShowOverlay);

  const isRunning = phase === 'running';

  useFocusTimer();

  useEffect(() => {
    const handler = () => {
      if (document.hidden && phase === 'running') {
        // Could pause or warn
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [phase]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (phase === 'running') {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [phase]);

  const handlePause = () => {
    setPhase(phase === 'paused' ? 'running' : 'paused');
  };

  const handleReset = () => {
    document.exitFullscreen?.().catch(() => {});
    resetSession();
  };

  const progress = goalSeconds > 0 ? focusedTime / goalSeconds : 0;

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex flex-1 min-h-0 gap-3 p-3">
        {/* Left: Camera + real-time metrics */}
        <div className="flex flex-col gap-3 w-[420px] shrink-0">
          {/* Camera */}
          <div className="relative">
            <CameraFeed isActive={isRunning} />
            <button
              onClick={() => setShowOverlay(!showOverlay)}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-card/70 backdrop-blur-sm text-muted-foreground hover:text-foreground transition-focus"
              title={showOverlay ? '필터 끄기' : '필터 켜기'}
            >
              {showOverlay ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>

          {/* Gaze + Focus gauge row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card rounded-xl p-3 border border-border flex items-center justify-center">
              <GazeIndicator />
            </div>
            <div className="bg-card rounded-xl p-3 border border-border flex flex-col justify-center">
              <FocusGauge />
            </div>
          </div>

          {/* Environment + status metrics */}
          <EnvironmentPanel />
        </div>

        {/* Right: Focus panel */}
        <div className="flex-1 border border-border rounded-xl bg-card overflow-hidden">
          <FocusPanel onPause={handlePause} onReset={handleReset} />
        </div>
      </div>

      {/* Bottom progress bar */}
      <div className="px-3 pb-3">
        <ProgressBar progress={progress} />
      </div>
    </div>
  );
}
