import { useEffect, useState } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { enablePush, isIOS, isStandalone, pushSupported, registerWorker, sendTestPush } from './push';
import { ask, tell } from './dialogs';

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
      await tell('To get booking alerts on iPhone: open this page in Safari, tap Share → Add to Home Screen, then open PT Admin from your Home Screen and tap the bell.');
      return;
    }
    if (state === 'unsupported') {
      await tell("This browser can't show notifications.");
      return;
    }
    setBusy(true);
    try {
      if (state === 'off') {
        await enablePush();
        setState('on');
        await tell('Booking alerts are on for this device.');
      } else if (state === 'on' && (await ask('Booking alerts are on for this device. Send a test notification?', { confirmLabel: 'Send test' }))) {
        const sent = await sendTestPush();
        await tell(sent > 0 ? 'Test sent. It should arrive in a few seconds.' : 'No devices received it. Tap the bell again after re-enabling alerts.');
      }
    } catch (err) {
      if (!err.noPushService) {
        await tell(err.message);
        return;
      }
      // This browser can't do notifications, but we can still check the settings in Vercel.
      let settings;
      try {
        await sendTestPush();
        settings = 'Good news: your notification settings in Vercel are correct ✓';
      } catch (checkError) {
        settings = checkError.message;
      }
      await tell(`This browser can't receive notifications (common with Chromium, Helium and Brave). Turn on alerts in the admin app on your iPhone instead, or use Google Chrome or Firefox.\n\n${settings}`);
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
