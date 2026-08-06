import { useEffect } from 'react';

const CLICKABLE_SELECTORS = [
  'a',
  'button',
  '.btn-p',
  '.btn-s',
  '.soc',
  '.a-btn',
  '.a-menu-item',
  '.t-btn',
  '.a-add-btn',
  '.f-input',
  '.f-select',
  '.f-textarea',
];

const matchesClickable = (target) => {
  return CLICKABLE_SELECTORS.some((selector) => target.closest(selector));
};

const isTouchDevice = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window);

const Cursor = () => {
  useEffect(() => {
    if (isTouchDevice()) return undefined; // mobile/touch par cursor logic j na chalavo

    const cur = document.getElementById('cur');
    const curR = document.getElementById('cur-r');
    if (!cur || !curR) return;

    let mx = 0;
    let my = 0;
    let rx = 0;
    let ry = 0;
    let animationFrame;

    const handleMouseMove = (event) => {
      mx = event.clientX;
      my = event.clientY;
      cur.style.left = `${mx}px`;
      cur.style.top = `${my}px`;
    };

    const animate = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      curR.style.left = `${rx}px`;
      curR.style.top = `${ry}px`;
      animationFrame = requestAnimationFrame(animate);
    };

    const handleHover = (event) => {
      const isHover = matchesClickable(event.target);
      if (isHover) {
        cur.style.width = '15px';
        cur.style.height = '15px';
        curR.style.width = '44px';
        curR.style.height = '44px';
      } else {
        cur.style.width = '10px';
        cur.style.height = '10px';
        curR.style.width = '34px';
        curR.style.height = '34px';
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleHover);
    animationFrame = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleHover);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  if (isTouchDevice()) return null; // mobile/touch par elements render j na karo

  return (
    <>
      <div id="cur" />
      <div id="cur-r" />
    </>
  );
};

export default Cursor;