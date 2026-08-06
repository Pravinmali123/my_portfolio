// Injects the manifest + Apple/Android "Add to Home Screen" meta tags
// only while the user is on an /admin/* page. Pure DOM side-effect —
// no routes, APIs, or state are touched.
const upsertTag = (selector, createFn) => {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = createFn();
    document.head.appendChild(el);
  }
  return el;
};

export const enableAdminInstallMeta = () => {
  upsertTag('link[rel="manifest"]', () => {
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = '/admin-manifest.webmanifest';
    return link;
  });

  upsertTag('link[rel="apple-touch-icon"]', () => {
    const link = document.createElement('link');
    link.rel = 'apple-touch-icon';
    link.href = '/favicon-180.png';
    return link;
  });

  upsertTag('meta[name="apple-mobile-web-app-capable"]', () => {
    const meta = document.createElement('meta');
    meta.name = 'apple-mobile-web-app-capable';
    meta.content = 'yes';
    return meta;
  });

  upsertTag('meta[name="apple-mobile-web-app-status-bar-style"]', () => {
    const meta = document.createElement('meta');
    meta.name = 'apple-mobile-web-app-status-bar-style';
    meta.content = 'default';
    return meta;
  });

  upsertTag('meta[name="apple-mobile-web-app-title"]', () => {
    const meta = document.createElement('meta');
    meta.name = 'apple-mobile-web-app-title';
    meta.content = 'Admin Panel';
    return meta;
  });

  const themeMeta = upsertTag('meta[name="theme-color"]', () => {
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    return meta;
  });
  themeMeta.setAttribute('content', '#E0E5EC');

  // Register a no-op service worker scoped to /admin — required by
  // Chrome/Edge for the install (⊕) prompt to appear. It never caches
  // anything (see admin-sw.js), so dashboard/API data is always fresh.
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/admin-sw.js', { scope: '/admin/' })
      .catch((err) => console.warn('Admin install service worker failed to register', err));
  }
};