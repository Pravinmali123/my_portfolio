import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import '../../styles/admin-theme.css';
// import '../../styles/admin-theme.css';
import '../../styles/admin-neumorphism.css';
import { enableAdminInstallMeta } from '../../utils/adminInstallMeta';

const LoginPage = () => {
  const [email, setemail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin/overview';

  useEffect(() => {
    enableAdminInstallMeta();
  }, []);

  // Landed here via the axios 401 interceptor (stale/expired token) —
  // let the admin know *why* they're suddenly at the login screen instead
  // of leaving them to wonder if something's broken.
  useEffect(() => {
    if (new URLSearchParams(location.search).get('sessionExpired') === '1') {
      showToast('Session expired — please log in again.', 'e');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async () => {
    setError('');
    try {
      await login(email, password);
      showToast('Welcome back, admin!', 's');
      navigate("/admin/overview", { replace: true });
    } catch (err) {
      setError('Invalid email or password');
      showToast('Login failed. Check credentials.', 'e');
    }
  };

  return (
    <div id="login-screen">
      <div className="login-blob lb1" />
      <div className="login-blob lb2" />
      <div className="login-card">
        <div className="login-avatar">
          <img className="login-avatar-img" src="/images/logo-pm.png" alt="PM logo" />
        </div>
        <div className="login-logo">Admin Panel</div>
        <div className="login-sub">PRAVIN MALI · PORTFOLIO MANAGER</div>
        <div className="f-group">
          <label className="f-label">email</label>
          <div className="f-input-wrap">
             <i className="fa-solid fa-envelope f-input-icon" />
          <input
            className="f-input  has-icon"
            type="text"
            value={email}
            onChange={(e) => setemail(e.target.value)}
            placeholder="Enter email"
            autoComplete="off"
          />
          </div>
        </div>
        <div className="f-group">
          <label className="f-label">Password</label>
          <div className="f-input-wrap">
            <i className="fa-solid fa-lock f-input-icon" />
            <input
              className="f-input has-icon"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
            />
            <button
              type="button"
              className="f-input-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
            </button>
          </div>
        </div>
        <button className="login-btn" type="button" onClick={handleSubmit}>
          <i className="fa-solid fa-user-shield" /> Login to Dashboard
        </button>
        <div className={`login-error ${error ? 'show' : ''}`}>{error}</div>
      </div>
    </div>
  );
};

export default LoginPage;