import { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ScrollFX.css';

gsap.registerPlugin(ScrollTrigger);

const BASE_PARTICLE_COUNT = 30;

function buildParticles(count) {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    left: Math.round(Math.random() * 1000) / 10,
    size: +(2 + Math.random() * 4).toFixed(1),
    duration: +(14 + Math.random() * 20).toFixed(1),
    delay: +(-(Math.random() * 30)).toFixed(1),
    drift: Math.round((Math.random() - 0.5) * 120),
    color: i % 3 === 0 ? 'var(--cyan)' : 'var(--neon)',
    opacity: +(0.25 + Math.random() * 0.55).toFixed(2),
  }));
}

const ScrollFX = () => {
  const rootRef = useRef(null);

  const particles = useMemo(() => {
    const isNarrow = typeof window !== 'undefined' && window.innerWidth < 700;
    return buildParticles(isNarrow ? Math.round(BASE_PARTICLE_COUNT / 2) : BASE_PARTICLE_COUNT);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // pointer:coarse = touch/mobile device. GSAP's normalizeScroll fights
    // with the browser's own momentum scroll + dynamic address bar on
    // mobile, which is what causes the "sticky / stop-start" scroll feel.
    // So we only enable it on real desktop/trackpad devices.
    const isMobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;

    if (!reduceMotion && !isMobile) {
      ScrollTrigger.normalizeScroll(true);
    }

    const progressTrigger = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        root.style.setProperty('--scroll-progress', self.progress.toFixed(4));
      },
    });

    // Single shared ticker for both the scroll-linked glow shift and the
    // mouse-follow glow, instead of two independent requestAnimationFrame
    // loops. Two separate rAF loops both writing CSS vars every frame is
    // exactly the kind of pile-up that causes visible stutter when the
    // browser is already busy handling fast scroll input.
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let tx = mx;
    let ty = my;
    const lerp = (a, b, n) => a + (b - a) * n;

    const onMouseMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
    };

    const frame = () => {
      const y = window.scrollY || 0;
      const glowShiftL = Math.sin(y / 380) * 46;
      const glowShiftR = Math.cos(y / 460) * 46;
      const beamRotate = (y / 90).toFixed(2);
      root.style.setProperty('--glow-shift-l', `${glowShiftL.toFixed(1)}px`);
      root.style.setProperty('--glow-shift-r', `${glowShiftR.toFixed(1)}px`);
      root.style.setProperty('--beam-rotate', `${beamRotate}deg`);

      tx = lerp(tx, mx, 0.08);
      ty = lerp(ty, my, 0.08);
      root.style.setProperty('--sfx-mx', `${tx.toFixed(1)}px`);
      root.style.setProperty('--sfx-my', `${ty.toFixed(1)}px`);
    };

    if (!reduceMotion && !isMobile) {
      window.addEventListener('mousemove', onMouseMove, { passive: true });
      gsap.ticker.add(frame);
    }

    return () => {
      progressTrigger.kill();
      gsap.ticker.remove(frame);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <div className="sfx-root" ref={rootRef} aria-hidden="true">
      <div className="sfx-back">
        <div className="sfx-aurora sfx-aurora-l" />
        <div className="sfx-aurora sfx-aurora-r" />

        <div className="sfx-blur-layer sfx-blur-1" />
        <div className="sfx-blur-layer sfx-blur-2" />

        <div className="sfx-beam sfx-beam-l" />
        <div className="sfx-beam sfx-beam-r" />

        <div className="sfx-side-glow sfx-side-glow-l" />
        <div className="sfx-side-glow sfx-side-glow-r" />

        <div className="sfx-cursor-glow" />

        <div className="sfx-particles">
          {particles.map((p) => (
            <span
              key={p.id}
              className="sfx-particle"
              style={{
                left: `${p.left}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                '--dur': `${p.duration}s`,
                '--delay': `${p.delay}s`,
                '--drift': `${p.drift}px`,
                '--pcolor': p.color,
                '--popacity': p.opacity,
              }}
            />
          ))}
        </div>
      </div>

      <div className="sfx-progress-layer">
        <div className="sfx-progress sfx-progress-l">
          <div className="sfx-progress-track">
            <div className="sfx-progress-fill" />
            <div className="sfx-progress-glow" />
          </div>
        </div>
        <div className="sfx-progress sfx-progress-r">
          <div className="sfx-progress-track">
            <div className="sfx-progress-fill" />
            <div className="sfx-progress-glow" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrollFX;