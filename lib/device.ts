export function detectTv(userAgent?: string) {
  const ua = (userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : '') || '').toLowerCase();
  // Tizen/Samsung, Android TV, MiTV/MiBox
  return /tizen|smart-tv|smarttv|samsungtv|mi tv|mitv|mibox|android tv/.test(ua);
}

export function safeName(name: string | undefined) {
  return (name || '').trim().slice(0, 60) || 'TV';
}
