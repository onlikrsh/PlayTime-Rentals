// Haptic feedback (the little "tick" you feel when tapping).
//
// Android phones support the vibration API. iPhones don't, but since iOS 18 Safari
// plays a haptic tick when a "switch" checkbox is toggled, so on iPhone we toggle a
// hidden one. Either way nothing happens on computers, and errors are ignored.

const isIOS = typeof navigator !== 'undefined'
  && (/iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.userAgent.includes('Mac') && navigator.maxTouchPoints > 1));

let ticking = false; // the hidden switch's own click must not trigger another tick

export function haptic() {
  try {
    if (navigator.vibrate) {
      navigator.vibrate(10);
      return;
    }
    if (!isIOS || ticking) return;
    ticking = true;
    const label = document.createElement('label');
    label.setAttribute('aria-hidden', 'true');
    label.style.display = 'none';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.setAttribute('switch', '');
    label.appendChild(input);
    document.head.appendChild(label);
    label.click();
    label.remove();
  } catch {
    // Haptics are a nice extra; never let them break a tap.
  } finally {
    ticking = false;
  }
}

// A light tick whenever a button, link, tab or checkbox is tapped anywhere on the page.
export function enableTapHaptics() {
  document.addEventListener('click', (event) => {
    if (!ticking && event.target.closest?.('button, a, [role="button"], input[type="checkbox"], summary')) haptic();
  }, true);
}
