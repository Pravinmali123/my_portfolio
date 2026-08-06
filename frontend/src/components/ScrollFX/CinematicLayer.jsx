import { useEffect, useRef } from 'react';
import './CinematicLayer.css';

const CinematicLayer = () => {
  const layerRef = useRef(null);

  useEffect(() => {
    const el = layerRef.current;
    if (!el) return;

    const handleScroll = () => {
      const progress = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--scroll-progress')
      ) || 0;
      el.style.setProperty('--layer-progress', progress.toFixed(4));
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="cinematic-layer" ref={layerRef} aria-hidden="true">
      <div className="cinematic-vignette" />
      <div className="cinematic-grain" />
    </div>
  );
};

export default CinematicLayer;