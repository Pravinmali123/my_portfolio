import { useEffect, useState } from 'react';

const Loader = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 1500);
    return () => window.clearTimeout(timer);
  }, []);

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
