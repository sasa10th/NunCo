import { useFocusStore } from '@/store/focusStore';

export default function FocusGauge() {
  const ear = useFocusStore(s => s.ear);
  const focusState = useFocusStore(s => s.focusState);

  // EAR typically ranges 0.15-0.35; normalize to 0-1
  const normalized = Math.max(0, Math.min(1, (ear - 0.15) / 0.2));

  const label =
    focusState === 'focused' ? '집중' :
    focusState === 'distracted' ? '분산' : '대기';

  const color =
    focusState === 'focused' ? 'text-focus-green' :
    focusState === 'distracted' ? 'text-focus-red' :
    'text-focus-gray';

  const barColor =
    focusState === 'focused' ? 'bg-focus-green' :
    focusState === 'distracted' ? 'bg-focus-red' :
    'bg-focus-gray';

  return (
    <div className="space-y-2 w-full">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">집중도</span>
        <span className={`text-sm font-semibold font-mono ${color}`}>{label}</span>
      </div>
      <div className="h-2 rounded-full bg-secondary/50 overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-300 ease-out`}
          style={{ width: `${normalized * 100}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
        <span>EAR: {ear.toFixed(3)}</span>
        <span>{(normalized * 100).toFixed(0)}%</span>
      </div>
    </div>
  );
}
