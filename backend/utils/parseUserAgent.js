// Lightweight User-Agent parser — no external dependency needed.
// Good enough to identify browser / OS / device-type for analytics display.

export const parseUserAgent = (ua = '') => {
  const s = ua || '';

  // ---------- Device type ----------
  let device = 'Desktop';
  if (/iPad|Tablet/i.test(s)) device = 'Tablet';
  else if (/Mobi|Android(?!.*Tablet)|iPhone|iPod/i.test(s)) device = 'Mobile';

  // ---------- Browser ----------
  let browser = 'Unknown';
  if (/Edg\//i.test(s)) browser = 'Edge';
  else if (/OPR\/|Opera/i.test(s)) browser = 'Opera';
  else if (/Chrome\//i.test(s) && !/Chromium/i.test(s)) browser = 'Chrome';
  else if (/Firefox\//i.test(s)) browser = 'Firefox';
  else if (/Safari\//i.test(s) && /Version\//i.test(s)) browser = 'Safari';
  else if (/MSIE|Trident/i.test(s)) browser = 'Internet Explorer';

  // ---------- OS ----------
  let os = 'Unknown';
  if (/Windows NT 10/i.test(s)) os = 'Windows 10/11';
  else if (/Windows NT/i.test(s)) os = 'Windows';
  else if (/Mac OS X/i.test(s)) os = 'macOS';
  else if (/Android/i.test(s)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(s)) os = 'iOS';
  else if (/Linux/i.test(s)) os = 'Linux';

  return { browser, os, device };
};

export default parseUserAgent;
