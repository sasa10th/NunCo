import { useFocusStore } from '@/store/focusStore';

export default function GazeIndicator() {
  const pitch = useFocusStore(s => s.pitch);
  const yaw = useFocusStore(s => s.yaw);
  const focusState = useFocusStore(s => s.focusState);

  // Clamp values for visual representation
  const clampedYaw = Math.max(-45, Math.min(45, yaw));
  const clampedPitch = Math.max(-45, Math.min(45, pitch));

  // Map to pixel offset (max 28px from center in a 80px circle)
  const dotX = (clampedYaw / 45) * 28;
  const dotY = (clampedPitch / 45) * 28;

  const dotColor =
    focusState === 'focused' ? 'bg-focus-green shadow-[0_0_8px_hsl(var(--focus-green)/0.6)]' :
    focusState === 'distracted' ? 'bg-focus-red shadow-[0_0_8px_hsl(var(--focus-red)/0.6)]' :
    'bg-focus-gray';

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">시선 방향</span>
      <div className="relative w-20 h-20 rounded-full border border-border bg-secondary/30">
        {/* Crosshair */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-px bg-border/50" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-full w-px bg-border/50" />
        </div>
        {/* Gaze dot */}
        <div
          className={`absolute w-3 h-3 rounded-full ${dotColor} transition-all duration-150 ease-out`}
          style={{
            left: `calc(50% + ${dotX}px - 6px)`,
            top: `calc(50% + ${dotY}px - 6px)`,
          }}
        />
      </div>
      <div className="flex gap-3 text-[10px] font-mono text-muted-foreground">
        <span>Y: {yaw.toFixed(1)}°</span>
        <span>P: {pitch.toFixed(1)}°</span>
      </div>
    </div>
  );
}
