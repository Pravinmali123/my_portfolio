import { useEffect } from 'react';

// rAF-throttled: only ONE style write per animation frame, no matter how
// many 'scroll' events fire in between. This is what stops the jump/flicker
// you get when scrolling fast in either direction — without throttling,
// dozens of synchronous style writes can land inside a single frame and
// fight the browser's paint cycle.
const useScrollCinematic = () => {
  useEffect(() => {
    const root = document.documentElement;
    let ticking = false;

    const update = () => {
      const scrollTop = window.scrollY || root.scrollTop;
      const docHeight = root.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(1, Math.max(0, scrollTop / docHeight)) : 0;
      root.style.setProperty('--scroll-progress', progress.toFixed(4));
      root.style.setProperty('--scroll-y', `${scrollTop}px`);
      ticking = false;
    };

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);
};

export default useScrollCinematic;