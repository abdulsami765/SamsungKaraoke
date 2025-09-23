export const KEY_CODES = {
  ENTER: 'Enter',
  ESC: 'Escape',
  BACKSPACE: 'Backspace',
};

export function onReturnKey(cb: () => void) {
  const handler = (e: KeyboardEvent) => {
    if (e.key === KEY_CODES.ESC || e.key === KEY_CODES.BACKSPACE) {
      cb();
    }
    // Some TV remotes send keyCode=10009 (Tizen). Browser APIs don’t expose it directly,
    // but Tizen apps can capture it via webapis. We still support generic escape/backspace here.
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}

export function tizenExit() {
  try {
    // @ts-ignore
    if (typeof window !== 'undefined' && window.tizen && tizen.application) {
      // @ts-ignore
      tizen.application.getCurrentApplication().exit();
      return true;
    }
  } catch {}
  return false;
}
