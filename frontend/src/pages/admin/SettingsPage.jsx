import { useEffect, useState } from 'react';
import { changePassword } from '../../services/authService';
import { getAbout, updateAbout } from '../../services/contentService';
import { useToast } from '../../context/ToastContext';

const SettingsPage = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showGithubActivity, setShowGithubActivity] = useState(false);
  const [githubToggleBusy, setGithubToggleBusy] = useState(false);
  const [aboutData, setAboutData] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await getAbout();
        if (response.success) {
          setAboutData(response.data);
          setShowGithubActivity(Boolean(response.data.showGithubActivity));
        }
      } catch (error) {
        console.error(error);
      }
    };
    loadSettings();
  }, []);

  const handleGithubActivityToggle = async () => {
    if (!aboutData) {
      showToast('Still loading settings, please try again in a moment', 'e');
      return;
    }
    const nextValue = !showGithubActivity;
    setShowGithubActivity(nextValue); // optimistic
    setGithubToggleBusy(true);
    try {
      // The backend's About validator requires summary/yearsExperience on
      // every PUT — sending just { showGithubActivity } fails validation.
      // So we send the full profile back with only this one field changed.
      const payload = { ...aboutData, showGithubActivity: nextValue };
      const response = await updateAbout(payload);
      if (response.success) {
        setAboutData(response.data);
      }
      showToast(`GitHub Activity section turned ${nextValue ? 'ON' : 'OFF'}`, 's');
    } catch (error) {
      setShowGithubActivity(!nextValue); // revert on failure
      showToast('Unable to update this setting', 'e');
      console.error(error);
    } finally {
      setGithubToggleBusy(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Please fill all password fields', 'e');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New password and confirmation do not match', 'e');
      return;
    }
    try {
      // Backend's validatePasswordChange middleware requires confirmPassword
      // in the body too (it re-checks newPassword === confirmPassword
      // server-side) — sending only currentPassword/newPassword here made
      // every change-password request fail validation with "Passwords do
      // not match", even when they matched.
      await changePassword({ currentPassword, newPassword, confirmPassword });
      showToast('Password updated successfully', 's');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      showToast('Unable to change password', 'e');
      console.error(error);
    }
  };

  return (
    <div className="a-page active" id="page-settings">
      <div className="a-page-header">
        <div className="a-page-title">Account <span>Settings</span></div>
      </div>
      <div className="a-card" style={{ maxWidth: '640px' }}>
        <div className="a-card-head">
          <div className="a-card-title">Portfolio Sections</div>
          <div className="a-card-count">Live Site</div>
        </div>
        <div className="modal-body">
          <div className="toggle-row">
            <div className="toggle-row-text">
              <div className="toggle-row-title"><i className="fa-brands fa-github" /> GitHub Activity Section</div>
              <div className="toggle-row-desc">Shows GitHub stats, streak, and contribution graph on your live portfolio (Skills → Projects). Turn on any time — no code changes needed.</div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={showGithubActivity}
              className={`a-switch ${showGithubActivity ? 'on' : ''}`}
              onClick={handleGithubActivityToggle}
              disabled={githubToggleBusy || !aboutData}
            >
              <span className="a-switch-knob" />
            </button>
          </div>
        </div>
      </div>
      <div className="a-card" style={{ maxWidth: '640px' }}>
        <div className="a-card-head">
          <div className="a-card-title">Security</div>
          <div className="a-card-count">Password</div>
        </div>
        <div className="modal-body">
          <div className="f-group">
            <label className="f-label">Current Password</label>
            <div className="f-input-wrap">
              <i className="fa-solid fa-lock f-input-icon" />
              <input className="f-input has-icon" type={showCurrent ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              <button type="button" className="f-input-toggle" onClick={() => setShowCurrent((p) => !p)} tabIndex={-1} aria-label={showCurrent ? 'Hide password' : 'Show password'}>
                <i className={`fa-solid ${showCurrent ? 'fa-eye-slash' : 'fa-eye'}`} />
              </button>
            </div>
          </div>
          <div className="f-group">
            <label className="f-label">New Password</label>
            <div className="f-input-wrap">
              <i className="fa-solid fa-lock f-input-icon" />
              <input className="f-input has-icon" type={showNew ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <button type="button" className="f-input-toggle" onClick={() => setShowNew((p) => !p)} tabIndex={-1} aria-label={showNew ? 'Hide password' : 'Show password'}>
                <i className={`fa-solid ${showNew ? 'fa-eye-slash' : 'fa-eye'}`} />
              </button>
            </div>
          </div>
          <div className="f-group">
            <label className="f-label">Confirm New Password</label>
            <div className="f-input-wrap">
              <i className="fa-solid fa-lock f-input-icon" />
              <input className="f-input has-icon" type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              <button type="button" className="f-input-toggle" onClick={() => setShowConfirm((p) => !p)} tabIndex={-1} aria-label={showConfirm ? 'Hide password' : 'Show password'}>
                <i className={`fa-solid ${showConfirm ? 'fa-eye-slash' : 'fa-eye'}`} />
              </button>
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="f-save" onClick={handlePasswordChange}>Update Password</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;