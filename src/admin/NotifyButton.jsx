import { useEffect, useState } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { enablePush, isIOS, isStandalone, pushSupported, registerWorker, sendTestPush } from './push';

const initialState = () => {
  if (pushSupported()) return 'checking';
  return isIOS() && !isStandalone() ? 'install' : 'unsupported';
};

// Bell in the header: turns booking alerts on for this device, or sends a test once they're on.
export default function NotifyButton() {
  const [state, setState] = useState(initialState); // checking | install | unsupported | off | on
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (state !== 'checking') return;
    registerWorker()
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => setState(subscription && Notification.permission === 'granted' ? 'on' : 'off'))
      .catch(() => setState('unsupported'));
  }, [state]);

  const onClick = async () => {
    if (state === 'install') {
      alert('To get booking alerts on iPhone: open this page in Safari, tap Share → Add to Home Screen, then open PT Admin from your Home Screen and tap the bell.');
      return;
    }
    if (state === 'unsupported') {
      alert("This browser can't show notifications.");
      return;
    }
    setBusy(true);
    try {
      if (state === 'off') {
        await enablePush();
        setState('on');
        alert('Booking alerts are on for this device.');
      } else if (state === 'on' && window.confirm('Booking alerts are on. Send a test notification?')) {
        const sent = await sendTestPush();
        alert(sent > 0 ? 'Test sent. It should arrive in a few seconds.' : 'No devices received it. Tap the bell again after re-enabling alerts.');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  const on = state === 'on';
  return (
    <button
      onClick={onClick}
      disabled={busy || state === 'checking'}
      aria-label={on ? 'Booking alerts on' : 'Turn on booking alerts'}
      className={`p-2 rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/10 ${on ? 'text-accent' : 'text-foreground'} ${busy ? 'animate-pulse' : ''}`}
    >
      {on ? <BellRing className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
    </button>
  );
}
