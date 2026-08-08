import { useEffect, useState } from 'react';
import { useLoading } from '../context/LoadingContext';

const MIN_DISPLAY_MS = 900;

const Loader = ({ waitForReady = false }) => {
  const { appReady } = useLoading();
  const [visible, setVisible] = useState(true);
  const [minTimeDone, setMinTimeDone] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMinTimeDone(true), MIN_DISPLAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (waitForReady) return undefined;
    const timer = window.setTimeout(() => setVisible(false), 1500);
    return () => window.clearTimeout(timer);
  }, [waitForReady]);

  useEffect(() => {
    if (waitForReady && appReady && minTimeDone) setVisible(false);
  }, [waitForReady, appReady, minTimeDone]);

  if (!visible) return null;

  return (
    <div id="loader">
     <div className="ld-logo">
  <div className="pm-ld-logo-wrap">
    <div className="pm-ld-logo-glow" />
    <img className="pm-ld-logo-img" src="/images/logo-pm.png" alt="PM logo" />
  </div>
  <span className="ld-logo-text">PM<span className="dot">.</span>dev</span>
</div>
      <div className="ld-bar">
        <div className="ld-fill" />
      </div>
      <div className="ld-txt">LOADING...</div>
    </div>
  );
};

export default Loader;
