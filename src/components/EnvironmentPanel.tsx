import { useFocusStore } from '@/store/focusStore';
import { Sun, Thermometer, User, Activity } from 'lucide-react';

export default function EnvironmentPanel() {
  const luminance = useFocusStore(s => s.luminance);
  const colorTemp = useFocusStore(s => s.colorTemp);
  const focusState = useFocusStore(s => s.focusState);
  const ear = useFocusStore(s => s.ear);
  const pitch = useFocusStore(s => s.pitch);
  const yaw = useFocusStore(s => s.yaw);

  const lumLabel = luminance < 60 ? '어두움' : luminance < 140 ? '적정' : '밝음';
  const lumColor = luminance < 60 ? 'text-focus-red' : luminance < 140 ? 'text-focus-green' : 'text-amber-400';

  const tempLabel = colorTemp < 4000 ? '따뜻함' : colorTemp < 5500 ? '자연광' : '차가움';
  const tempColor = colorTemp < 4000 ? 'text-orange-400' : colorTemp < 5500 ? 'text-focus-green' : 'text-blue-400';

  const stateLabel =
    focusState === 'focused' ? '집중 중' :
    focusState === 'distracted' ? '집중 아님' : '얼굴 없음';
  const stateColor =
    focusState === 'focused' ? 'text-focus-green' :
    focusState === 'distracted' ? 'text-focus-red' : 'text-focus-gray';
  const stateDot =
    focusState === 'focused' ? 'bg-focus-green' :
    focusState === 'distracted' ? 'bg-focus-red' : 'bg-focus-gray';

  return (
    <div className="grid grid-cols-2 gap-2">
      {/* Luminance */}
      <MetricCard
        icon={<Sun className="w-3.5 h-3.5 text-muted-foreground" />}
        label="조도"
        value={`${luminance}`}
        unit="lux"
        sub={lumLabel}
        subColor={lumColor}
      />
      {/* Color Temperature */}
      <MetricCard
        icon={<Thermometer className="w-3.5 h-3.5 text-muted-foreground" />}
        label="색온도"
        value={`${colorTemp}`}
        unit="K"
        sub={tempLabel}
        subColor={tempColor}
      />
      {/* Current State */}
      <div className="bg-card rounded-lg p-3 border border-border">
        <div className="flex items-center gap-1.5 mb-1.5">
          <User className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">상태</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${stateDot} animate-pulse`} />
          <span className={`text-sm font-semibold ${stateColor}`}>{stateLabel}</span>
        </div>
      </div>
      {/* Head Pose */}
      <div className="bg-card rounded-lg p-3 border border-border">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Activity className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">수치</span>
        </div>
        <div className="flex gap-2 text-[11px] font-mono text-muted-foreground">
          <span>EAR {ear.toFixed(2)}</span>
          <span>P {pitch.toFixed(0)}°</span>
          <span>Y {yaw.toFixed(0)}°</span>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, unit, sub, subColor }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  sub: string;
  subColor: string;
}) {
  return (
    <div className="bg-card rounded-lg p-3 border border-border">
      <div className="flex items-center gap-1.5 mb-1.5">
        {icon}
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-sm font-semibold font-mono text-foreground">{value}</span>
        <span className="text-[10px] text-muted-foreground">{unit}</span>
      </div>
      <span className={`text-[10px] font-medium ${subColor}`}>{sub}</span>
    </div>
  );
}
