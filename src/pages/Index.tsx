import { useFocusStore } from '@/store/focusStore';
import SetupView from '@/views/SetupView';
import FocusView from '@/views/FocusView';
import CompletedView from '@/views/CompletedView';
import ReportView from '@/views/ReportView';

const Index = () => {
  const phase = useFocusStore(s => s.phase);

  switch (phase) {
    case 'setup':
      return <SetupView />;
    case 'running':
    case 'paused':
      return <FocusView />;
    case 'completed':
      return <CompletedView />;
    case 'report':
      return <ReportView />;
    default:
      return <SetupView />;
  }
};

export default Index;
