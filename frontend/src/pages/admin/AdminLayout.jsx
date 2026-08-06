import { useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import '../../styles/admin-theme.css';
// import '../../styles/admin-theme.css';
import '../../styles/admin-neumorphism.css';
import { enableAdminInstallMeta } from '../../utils/adminInstallMeta';

const AdminLayout = () => {
  const { logout, user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    enableAdminInstallMeta();
  }, []);

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 's');
  };

  const openPortfolio = () => {
    window.open('/', '_blank');
  };

  return (
    <div id="admin-app" className="active">
      <nav className="a-nav">
  <div className="a-nav-left">
          <div className="a-logo">
            <img className="a-logo-img" src="/images/logo-pm.png" alt="PM logo" />
            <span>Admin</span>
          </div>
          <div className="a-nav-badge">● LIVE</div>
        </div>
        <div className="a-nav-right">
          <div className="a-nav-user">Logged in as <span>{user?.username || 'Admin'}</span></div>
          <button type="button" className="a-btn a-btn-port" onClick={openPortfolio}>↗ View Portfolio</button>
          <button type="button" className="a-btn a-btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </nav>
      <div className="a-body">
        <aside className="a-sidebar">
          <div className="a-menu-section">Main</div>
          <NavLink to="overview" className={({ isActive }) => `a-menu-item ${isActive ? 'active' : ''}`}>
            <span className="a-menu-icon"><i className="fa-solid fa-gauge-high" /></span>Overview
          </NavLink>
          <div className="a-menu-section">Content</div>
          <NavLink to="projects" className={({ isActive }) => `a-menu-item ${isActive ? 'active' : ''}`}>
            <span className="a-menu-icon"><i className="fa-solid fa-diagram-project" /></span>Projects
          </NavLink>
          <NavLink to="skills" className={({ isActive }) => `a-menu-item ${isActive ? 'active' : ''}`}>
            <span className="a-menu-icon"><i className="fa-solid fa-laptop-code" /></span>Skills
          </NavLink>
          <NavLink to="certifications" className={({ isActive }) => `a-menu-item ${isActive ? 'active' : ''}`}>
            <span className="a-menu-icon"><i className="fa-solid fa-certificate" /></span>Certifications
          </NavLink>
          <NavLink to="about" className={({ isActive }) => `a-menu-item ${isActive ? 'active' : ''}`}>
            <span className="a-menu-icon"><i className="fa-solid fa-address-card" /></span>About Info
          </NavLink>
          <div className="a-menu-section">Inbox</div>
          <NavLink to="messages" className={({ isActive }) => `a-menu-item ${isActive ? 'active' : ''}`}>
            <span className="a-menu-icon"><i className="fa-solid fa-comments" /></span>Messages
          </NavLink>
          <div className="a-menu-section">Settings</div>
          <NavLink to="settings" className={({ isActive }) => `a-menu-item ${isActive ? 'active' : ''}`}>
            <span className="a-menu-icon"> <i className="fa-solid fa-key"></i></span>Password
          </NavLink>
        </aside>
        <main className="a-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
