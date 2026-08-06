import { useEffect, useState } from 'react';

/**
 * Replaces two separate raw `scroll` listeners (one for the "back to top"
 * button, one for highlighting the active nav link) with a single
 * rAF-batched loop.
 *
 * Why this matters: every extra `addEventListener('scroll', ...)` that does
 * its own DOM reads/writes runs independently on every scroll tick. Stack a
 * few of them (nav highlight + back-to-top + GSAP ScrollTrigger + the
 * cinematic-progress hook) and the browser ends up doing several rounds of
 * layout/paint per frame — which is exactly what shows up as stutter or a
 * visible "jump" when you scroll fast, especially when reversing direction.
 * Batching the reads with a single rAF flag removes that pile-up.
 */
const useUnifiedScroll = ({ topBtnThreshold = 480, navLinkSelector = '.nav-links a' } = {}) => {
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      const y = window.scrollY || document.documentElement.scrollTop;

      setShowTopBtn(y > topBtnThreshold);

      const links = document.querySelectorAll(navLinkSelector);
      links.forEach((link) => {
        const targetId = link.getAttribute('href');
        if (!targetId || targetId === '#') return;
        const section = document.querySelector(targetId);
        if (!section) return;
        const rect = section.getBoundingClientRect();
        const isActive = rect.top <= 90 && rect.bottom >= 90;
        link.classList.toggle('active', isActive);
      });

      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topBtnThreshold, navLinkSelector]);

  return { showTopBtn };
};

export default useUnifiedScroll;
