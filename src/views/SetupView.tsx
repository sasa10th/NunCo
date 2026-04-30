import { useState } from 'react';
import { useFocusStore } from '@/store/focusStore';
import type { Sensitivity } from '@/store/focusStore';

export default function SetupView() {
  const goalSeconds = useFocusStore(s => s.goalSeconds);
  const sensitivity = useFocusStore(s => s.sensitivity);
  const setGoalSeconds = useFocusStore(s => s.setGoalSeconds);
  const setSensitivity = useFocusStore(s => s.setSensitivity);
  const setPhase = useFocusStore(s => s.setPhase);
  const setSessionStart = useFocusStore(s => s.setSessionStart);

  const [goalMinutes, setGoalMinutes] = useState(Math.round(goalSeconds / 60));
  const [cameraReady, setCameraReady] = useState(false);
  const [requesting, setRequesting] = useState(false);

  const requestCamera = async () => {
    setRequesting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(t => t.stop());
      setCameraReady(true);
    } catch {
      alert('카메라 접근이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요.');
    } finally {
      setRequesting(false);
    }
  };

  const startSession = () => {
    setGoalSeconds(goalMinutes * 60);
    setSessionStart(Date.now());
    setPhase('running');
    // Try fullscreen
    document.documentElement.requestFullscreen?.().catch(() => {});
  };

  const sensitivityLabels: Record<Sensitivity, string> = {
    low: '낮음',
    medium: '보통',
    high: '높음',
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 rounded-2xl bg-card space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">🔒 FocusLock</h1>
          <p className="text-muted-foreground text-sm">AI 기반 실시간 집중도 측정</p>
        </div>

        {/* Goal time */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">목표 공부 시간</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={5}
              max={180}
              step={5}
              value={goalMinutes}
              onChange={e => setGoalMinutes(Number(e.target.value))}
              className="flex-1 accent-primary"
            />
            <span className="font-mono text-lg font-semibold text-foreground w-16 text-right">
              {goalMinutes}분
            </span>
          </div>
        </div>

        {/* Sensitivity */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">집중도 민감도</label>
          <div className="flex gap-2">
            {(['low', 'medium', 'high'] as Sensitivity[]).map(s => (
              <button
                key={s}
                onClick={() => setSensitivity(s)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-focus ${
                  sensitivity === s
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {sensitivityLabels[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Camera */}
        <div className="space-y-3">
          {!cameraReady ? (
            <button
              onClick={requestCamera}
              disabled={requesting}
              className="w-full py-3 rounded-lg bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-focus disabled:opacity-50"
            >
              {requesting ? '권한 요청 중...' : '📷 카메라 권한 허용'}
            </button>
          ) : (
            <div className="text-center text-sm text-focus-green">✓ 카메라 준비 완료</div>
          )}
        </div>

        {/* Start */}
        <button
          onClick={startSession}
          disabled={!cameraReady}
          className="w-full py-4 rounded-xl bg-primary text-primary-foreground text-lg font-bold hover:opacity-90 transition-focus disabled:opacity-30 disabled:cursor-not-allowed"
        >
          집중 시작 🚀
        </button>
      </div>
    </div>
  );
}
