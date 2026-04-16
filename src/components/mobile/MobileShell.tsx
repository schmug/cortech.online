import { AppView } from './AppView';
import { Dock } from './Dock';
import { HomeScreen } from './HomeScreen';
import { StatusBar } from './StatusBar';
import { useMobile } from './store';

export default function MobileShell() {
  const openAppId = useMobile((s) => s.openAppId);

  return (
    <div className="ct-backdrop flex min-h-[100dvh] flex-col text-[var(--color-text)]">
      <StatusBar />
      <HomeScreen />
      <Dock />
      {openAppId && <AppView appId={openAppId} />}
    </div>
  );
}
