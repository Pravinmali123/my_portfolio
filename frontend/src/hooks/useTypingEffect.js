import { useEffect, useState } from 'react';

const useTypingEffect = (titles = [], speed = 100, deleteSpeed = 55, pauseTime = 2000) => {
  const [display, setDisplay] = useState('');
  const [index, setIndex] = useState(0);
  const [position, setPosition] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!titles.length) return;
    const current = titles[index % titles.length];
    const timeout = window.setTimeout(() => {
      if (deleting) {
        if (position > 0) {
          setPosition(position - 1);
          setDisplay(current.slice(0, position - 1));
        } else {
          setDeleting(false);
          setIndex((prev) => (prev + 1) % titles.length);
        }
      } else {
        if (position < current.length) {
          setPosition(position + 1);
          setDisplay(current.slice(0, position + 1));
        } else {
          window.setTimeout(() => setDeleting(true), pauseTime);
        }
      }
    }, deleting ? deleteSpeed : speed);

    return () => window.clearTimeout(timeout);
  }, [titles, index, position, deleting, speed, deleteSpeed, pauseTime]);

  return display;
};

export default useTypingEffect;
