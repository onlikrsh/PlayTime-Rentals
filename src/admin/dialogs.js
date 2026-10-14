// In-app pop-ups that replace the browser's alert() and confirm(). Those show the
// website address as a title and feel out of place in an app on the Home Screen.
//
//   await tell('Saved')                                 → message with an OK button
//   if (await ask('Delete this?', { confirmLabel: 'Delete' })) …   → true / false

let show = null; // connected by <DialogHost /> when the app starts

export const connectDialogs = (fn) => { show = fn; };

export function ask(message, { confirmLabel = 'OK', cancelLabel = 'Cancel' } = {}) {
  return new Promise((resolve) => {
    if (show) show({ message, confirmLabel, cancelLabel, resolve });
    else resolve(window.confirm(message));
  });
}

export function tell(message) {
  return new Promise((resolve) => {
    if (show) show({ message, confirmLabel: 'OK', cancelLabel: null, resolve: () => resolve() });
    else {
      window.alert(message);
      resolve();
    }
  });
}
