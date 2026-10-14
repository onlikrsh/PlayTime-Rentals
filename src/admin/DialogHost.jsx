import { useEffect, useState } from 'react';
import { connectDialogs } from './dialogs';
import { Button } from './ui';

// Shows the pop-ups requested with ask() / tell() as a sheet that slides up from the bottom.
export default function DialogHost() {
  const [dialog, setDialog] = useState(null);

  useEffect(() => {
    connectDialogs(setDialog);
    return () => connectDialogs(null);
  }, []);

  if (!dialog) return null;

  const close = (answer) => {
    setDialog(null);
    dialog.resolve(answer);
  };

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/50 flex items-end sm:items-center justify-center p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] fade-in"
      onClick={() => close(false)}
    >
      <div role="alertdialog" aria-modal="true" className="glass w-full max-w-sm p-6 sheet-in" onClick={(e) => e.stopPropagation()}>
        <p className="text-base sm:text-sm leading-relaxed whitespace-pre-line mb-6">{dialog.message}</p>
        <div className="flex gap-3">
          {dialog.cancelLabel && (
            <Button variant="outline" className="flex-1 py-4" onClick={() => close(false)}>{dialog.cancelLabel}</Button>
          )}
          <Button className="flex-1 py-4" autoFocus onClick={() => close(true)}>{dialog.confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
