import { useEffect } from 'react';

/**
 * Drop-in replacement for the reveal + stats-counter IntersectionObserver
 * block that used to live inline in PortfolioPage.jsx.
 *
 * What was causing the "side effect" while scrolling top→bottom→top:
 *   1. rootMargin was asymmetric-looking but actually just narrow
 *      ('-60px 0px -60px 0px'), so near the very top/bottom of a section
 *      the visibility flag could flip on and off multiple times per second
 *      while you scrolled — each flip restarts the CSS transition, which
 *      you see as flicker/pop instead of one clean animation.
 *   2. classList.add/remove ran directly inside the IntersectionObserver
 *      callback with no batching, so fast scrolling could queue up several
 *      class toggles inside a single frame.
 *
 * Fix: symmetric rootMargin, a small hysteresis timer so a class flip only
 * commits if the element's intersection state is still true/false ~50ms
 * later (ignores the noisy in-between state), and batching the actual
 * DOM writes with requestAnimationFrame.
 */
const useScrollReveal = () => {
  useEffect(() => {
    const revealElements = document.querySelectorAll('.reveal');
    const pending = new Map();

    const commit = (el, shouldShow) => {
      requestAnimationFrame(() => {
        el.classList.toggle('visible', shouldShow);
        if (shouldShow && el.classList.contains('reveal-heading')) {
          observer.unobserve(el);
        }
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target;
          const shouldShow = entry.isIntersecting;

          if (pending.has(el)) clearTimeout(pending.get(el));

          const timer = setTimeout(() => {
            pending.delete(el);
            commit(el, shouldShow);
          }, 45);

          pending.set(el, timer);
        });
      },
      { threshold: [0, 0.12, 0.5], rootMargin: '-80px 0px -80px 0px' }
    );

    revealElements.forEach((el) => observer.observe(el));

    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          if (node.matches?.('.reveal')) observer.observe(node);
          node.querySelectorAll?.('.reveal').forEach((el) => observer.observe(el));
        });
      });
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    // Stats counters: replay the count-up every time the About stats are
    // scrolled into view, reset to 0 when they leave.
    const statsIntervals = new Map();
    let statsVisible = false;

    const runCounters = (counters) => {
      counters.forEach((target) => {
        if (statsIntervals.has(target)) clearInterval(statsIntervals.get(target));
        const value = Number(target.dataset.count) || 0;
        let current = 0;
        const increment = Math.max(1, Math.round(value / 40));
        const interval = setInterval(() => {
          current += increment;
          if (current >= value) {
            current = value;
            clearInterval(interval);
            statsIntervals.delete(target);
          }
          target.textContent = `${current}+`;
        }, 35);
        statsIntervals.set(target, interval);
      });
    };

    const statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          statsVisible = entry.isIntersecting;
          const counters = entry.target.querySelectorAll('[data-count]');
          if (entry.isIntersecting) {
            runCounters(counters);
          } else {
            counters.forEach((target) => {
              if (statsIntervals.has(target)) {
                clearInterval(statsIntervals.get(target));
                statsIntervals.delete(target);
              }
              target.textContent = '0+';
            });
          }
        });
      },
      { threshold: 0.5 }
    );
    const statsSection = document.querySelector('.stats-g');
    if (statsSection) statsObserver.observe(statsSection);

    // The stats numbers (Projects / Years Exp / Technologies) are set as a
    // data-count attribute that React re-renders once the About data
    // finishes loading from the API (getAbout()) or is updated in the
    // admin panel. That render can land AFTER the counter above already
    // finished animating to the old default value — the card then stays
    // stuck on the stale number forever, even though data-count itself is
    // correct in the DOM. This watches data-count for changes and re-plays
    // the counter immediately (only while the stats are on screen), so the
    // card always ends up showing the current admin-set value.
    const statsAttrObserver = new MutationObserver((mutations) => {
      if (!statsVisible) return;
      const changedTargets = mutations
        .filter((m) => m.type === 'attributes' && m.attributeName === 'data-count')
        .map((m) => m.target);
      if (changedTargets.length) runCounters(changedTargets);
    });
    if (statsSection) {
      statsSection.querySelectorAll('[data-count]').forEach((el) => {
        statsAttrObserver.observe(el, { attributes: true, attributeFilter: ['data-count'] });
      });
    }

    return () => {
      mutationObserver.disconnect();
      statsAttrObserver.disconnect();
      revealElements.forEach((el) => observer.unobserve(el));
      pending.forEach((timer) => clearTimeout(timer));
      pending.clear();
      if (statsSection) statsObserver.unobserve(statsSection);
      statsIntervals.forEach((interval) => clearInterval(interval));
      statsIntervals.clear();
    };
  }, []);
};

export default useScrollReveal;