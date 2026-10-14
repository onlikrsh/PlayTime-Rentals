// Haptic feedback (the little "tick" you feel when tapping).
//
// Android: the vibration API.
// iPhone: Safari has no vibration API, but it plays a haptic tick when a finger
// toggles an <input type="checkbox" switch>. Since iOS 26.5 that only works for a
// real tap (switches clicked from code stay silent), so every button and link gets
// an invisible switch laid over it: the tap lands on the switch (tick), and the
// click is passed on to the button or link, which then works as normal.

const isIOS = typeof navigator !== 'undefined'
  && typeof navigator.vibrate !== 'function'
  && (/iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.userAgent.includes('Mac') && navigator.maxTouchPoints > 1));

const TAPPABLE = 'button, a[href], [role="button"], summary';
const OVERLAY = 'data-haptic-overlay';

// A single tick from code: works on Android, and on iPhones before iOS 26.5.
export function haptic() {
  try {
    if (typeof navigator.vibrate === 'function') {
      navigator.vibrate(10);
      return;
    }
    if (!isIOS) return;
    const label = document.createElement('label');
    label.setAttribute('aria-hidden', 'true');
    label.style.display = 'none';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.setAttribute('switch', '');
    label.appendChild(input);
    document.body.appendChild(label);
    label.click();
    label.remove();
  } catch {
    // Haptics are a nice extra; never let them break a tap.
  }
}

// iPhone: lay an invisible switch over a button or link.
function addSwitchOverlay(host) {
  let sw = host.querySelector(`:scope > input[${OVERLAY}]`);
  if (!sw) {
    if (host.closest('.leaflet-container')) return; // leave the map's own controls alone
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    sw = document.createElement('input');
    sw.type = 'checkbox';
    sw.setAttribute('switch', '');
    sw.setAttribute(OVERLAY, '');
    sw.setAttribute('aria-hidden', 'true');
    sw.tabIndex = -1;
    sw.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;margin:0;padding:0;border:0;'
      + '-webkit-appearance:switch;appearance:auto;opacity:0;z-index:10;cursor:inherit;';
    sw.addEventListener('click', (event) => {
      event.stopPropagation(); // the switch's own click shouldn't reach the app…
      host.click();            // …the button or link does its normal job instead
    });
    host.appendChild(sw);
  }
  // Disabled buttons: let the tap fall through (no tick, nothing happens)
  sw.style.pointerEvents = host.disabled ? 'none' : 'auto';
}

function installSwitchOverlays() {
  const scan = () => document.querySelectorAll(TAPPABLE).forEach(addSwitchOverlay);
  // React adds, re-renders and enables/disables buttons all the time: give new ones
  // their switch straight away (before the next tap can land).
  new MutationObserver(scan).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled'] });
  scan();
}

// A tick whenever a button, link or tab is tapped anywhere on the page.
export function enableTapHaptics() {
  if (isIOS) {
    installSwitchOverlays();
    return;
  }
  document.addEventListener('click', (event) => {
    if (event.target.closest?.(`${TAPPABLE}, input[type="checkbox"]`)) haptic();
  }, true);
}
