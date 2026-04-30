import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useFocusStore } from '@/store/focusStore';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function CompletedView() {
  const focusedTime = useFocusStore(s => s.focusedTime);
  const sessionTime = useFocusStore(s => s.sessionTime);
  const resetSession = useFocusStore(s => s.resetSession);
  const setPhase = useFocusStore(s => s.setPhase);
  const firedRef = useRef(false);

  const focusRate = sessionTime > 0 ? (focusedTime / sessionTime) * 100 : 0;

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    document.exitFullscreen?.().catch(() => {});
    
    // Fire confetti
    const duration = 3000;
    const end = Date.now() + duration;
    const interval = setInterval(() => {
      if (Date.now() > end) { clearInterval(interval); return; }
      confetti({
        particleCount: 50,
        startVelocity: 30,
        spread: 360,
        origin: { x: Math.random(), y: Math.random() * 0.5 },
      });
    }, 250);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 rounded-2xl bg-card space-y-8 text-center">
        <div className="text-6xl">🎉</div>
        <h1 className="text-3xl font-bold text-foreground">목표 달성!</h1>
        <p className="text-muted-foreground">훌륭합니다! 집중 목표를 완수했어요.</p>

        <div className="grid grid-cols-3 gap-4">
          <StatCard label="세션 시간" value={formatTime(sessionTime)} />
          <StatCard label="집중 시간" value={formatTime(focusedTime)} />
          <StatCard label="집중률" value={`${focusRate.toFixed(0)}%`} highlight />
        </div>

        <p className="text-sm text-focus-green">🔓 앱 잠금이 해제되었습니다</p>

        <div className="flex gap-3">
          <button
            onClick={() => setPhase('report')}
            className="flex-1 py-3 rounded-xl bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-focus"
          >
            리포트 보기
          </button>
          <button
            onClick={resetSession}
            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-focus"
          >
            새 세션 시작
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="p-3 rounded-lg bg-secondary/50 space-y-1">
      <div className="text-[10px] uppercase text-muted-foreground tracking-wider">{label}</div>
      <div className={`font-mono text-xl font-bold ${highlight ? 'text-focus-gold' : 'text-foreground'}`}>
        {value}
      </div>
    </div>
  );
}
