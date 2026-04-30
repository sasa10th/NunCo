import { useFocusStore } from '@/store/focusStore';
import ProgressRing from './ProgressRing';
import DebugPanel from './DebugPanel';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

interface FocusPanelProps {
  onPause: () => void;
  onReset: () => void;
}

export default function FocusPanel({ onPause, onReset }: FocusPanelProps) {
  const focusedTime = useFocusStore(s => s.focusedTime);
  const sessionTime = useFocusStore(s => s.sessionTime);
  const goalSeconds = useFocusStore(s => s.goalSeconds);
  const phase = useFocusStore(s => s.phase);

  const progress = goalSeconds > 0 ? focusedTime / goalSeconds : 0;

  return (
    <div className="flex flex-col items-center gap-6 p-6 h-full">
      {/* Progress ring with time */}
      <div className="relative flex items-center justify-center">
        <ProgressRing progress={progress} size={180} strokeWidth={10} />
        <div className="absolute flex flex-col items-center">
          <span className="text-3xl font-mono font-bold text-foreground transition-focus">
            {formatTime(focusedTime)}
          </span>
          <span className="text-xs text-muted-foreground">집중 시간</span>
        </div>
      </div>

      {/* Goal info */}
      <div className="text-center space-y-1">
        <div className="text-sm text-muted-foreground">
          목표: {formatTime(goalSeconds)}
        </div>
        <div className="text-xs text-muted-foreground">
          세션 경과: {formatTime(sessionTime)}
        </div>
        <div className="font-mono text-lg font-semibold text-foreground">
          {Math.min(Math.round(progress * 100), 100)}%
        </div>
      </div>

      {/* Debug values */}
      <DebugPanel />

      {/* Controls */}
      <div className="flex gap-3 mt-auto w-full">
        <button
          onClick={onPause}
          className="flex-1 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-focus"
        >
          {phase === 'paused' ? '재개' : '일시정지'}
        </button>
        <button
          onClick={onReset}
          className="flex-1 py-2 rounded-lg bg-destructive/20 text-destructive text-sm font-medium hover:bg-destructive/30 transition-focus"
        >
          초기화
        </button>
      </div>
    </div>
  );
}
