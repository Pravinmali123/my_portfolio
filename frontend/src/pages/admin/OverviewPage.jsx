import { useEffect, useState } from 'react';
import { getMessages, getProjects, getSkills, getVisitStats } from '../../services/contentService';
import { useExpandableList } from '../../hooks/useExpandableList';
import ViewMoreButton from '../../components/ViewMoreButton';

const deviceIcon = (device) => {
  if (device === 'Mobile') return 'fa-solid fa-mobile-screen';
  if (device === 'Tablet') return 'fa-solid fa-tablet-screen-button';
  return 'fa-solid fa-desktop';
};

const timeAgo = (dateStr) => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

const OverviewPage = () => {
  const [stats, setStats] = useState({ projects: 0, skills: 0, messages: 0, unread: 0 });
  const [recentMessages, setRecentMessages] = useState([]);
  const [visitStats, setVisitStats] = useState({
    totalViews: 0,
    todayViews: 0,
    uniqueVisitors: 0,
    deviceBreakdown: [],
    recentVisits: [],
  });

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const [projectsResp, skillsResp, messagesResp, visitResp] = await Promise.all([
          getProjects(),
          getSkills(),
          getMessages(),
          getVisitStats().catch(() => null),
        ]);
        const projects = projectsResp.success ? projectsResp.data.length : 0;
        const skills = skillsResp.success ? skillsResp.data.length : 0;
        const messages = messagesResp.success ? messagesResp.data.length : 0;
        const unread = messagesResp.success ? messagesResp.data.filter((msg) => !msg.read).length : 0;
        setStats({ projects, skills, messages, unread });
        setRecentMessages(messagesResp.success ? messagesResp.data : []);
        if (visitResp?.success) {
          setVisitStats(visitResp.data);
        }
      } catch (error) {
        console.error(error);
      }
    };
    loadOverview();
  }, []);

  const visitsList = useExpandableList(visitStats.recentVisits, 6);
  const messagesList = useExpandableList(recentMessages, 6);

  return (
    <div className="a-page active" id="page-overview">
      <div className="a-page-header">
        <div className="a-page-title">Dashboard <span>Overview</span></div>
      </div>
      <div className="stats-row">
        <div className="stat-c"><div className="stat-icon"><i className="fa-solid fa-diagram-project" /></div><div className="stat-val">{stats.projects}</div><div className="stat-lbl">Projects</div></div>
        <div className="stat-c"><div className="stat-icon"><i className="fa-solid fa-laptop-code" /></div><div className="stat-val">{stats.skills}</div><div className="stat-lbl">Skills</div></div>
        <div className="stat-c"><div className="stat-icon"><i className="fa-solid fa-comments" /></div><div className="stat-val">{stats.messages}</div><div className="stat-lbl">Messages</div></div>
        <div className="stat-c"><div className="stat-icon"><i className="fa-solid fa-envelope-open-text" /></div><div className="stat-val">{stats.unread}</div><div className="stat-lbl">Unread</div></div>
      </div>
      <div className="stats-row">
        <div className="stat-c"><div className="stat-icon"><i className="fa-solid fa-eye" /></div><div className="stat-val">{visitStats.totalViews}</div><div className="stat-lbl">Total Views</div></div>
        <div className="stat-c"><div className="stat-icon"><i className="fa-solid fa-calendar-day" /></div><div className="stat-val">{visitStats.todayViews}</div><div className="stat-lbl">Today's Views</div></div>
        <div className="stat-c"><div className="stat-icon"><i className="fa-solid fa-users" /></div><div className="stat-val">{visitStats.uniqueVisitors}</div><div className="stat-lbl">Unique Visitors</div></div>
        <div className="stat-c">
          <div className="stat-icon"><i className="fa-solid fa-chart-simple" /></div>
          <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginTop: '.3rem' }}>
            {visitStats.deviceBreakdown.length ? visitStats.deviceBreakdown.map((d) => (
              <span key={d.device} className="badge badge-cyan" style={{ fontSize: '.6rem' }}>
                <i className={deviceIcon(d.device)} style={{ marginRight: '.3rem' }} />{d.device}: {d.count}
              </span>
            )) : <span className="stat-lbl">No device data yet</span>}
          </div>
          <div className="stat-lbl" style={{ marginTop: '.4rem' }}>Device Breakdown</div>
        </div>
      </div>

      <div className="a-card">
        <div className="a-card-head">
          <div className="a-card-title">Who Viewed My Portfolio</div>
          <div className="a-card-count">{visitStats.recentVisits.length} recent</div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Visitor (IP)</th>
                  <th>Location</th>
                  <th>Device</th>
                  <th>Browser</th>
                  <th>Page</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {visitsList.visibleItems.length ? visitsList.visibleItems.map((visit, idx) => (
                  <tr key={visit._id} className={visitsList.getItemClassName(idx)}>
                    <td data-label="#">{idx + 1}</td>
                    <td data-label="Visitor (IP)">{visit.ip}</td>
                    <td data-label="Location">{visit.city || visit.country ? `${visit.city ? visit.city + ', ' : ''}${visit.country}` : '—'}</td>
                    <td data-label="Device">
                      <span className="badge badge-purple"><i className={deviceIcon(visit.device)} style={{ marginRight: '.3rem' }} />{visit.device}</span>
                    </td>
                    <td data-label="Browser">{visit.browser} · {visit.os}</td>
                    <td data-label="Page">{visit.page}</td>
                    <td data-label="When">{timeAgo(visit.createdAt)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--muted)' }}>
                      No visitors tracked yet — views will appear here once someone opens your live portfolio.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {visitsList.hasMore && <ViewMoreButton expanded={visitsList.expanded} onClick={visitsList.toggle} />}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="a-card">
          <div className="a-card-head"><div className="a-card-title">Recent Messages</div><div className="a-card-count">{stats.messages}</div></div>
          <div style={{ padding: '1rem' }}>
            {messagesList.visibleItems.length ? (
              messagesList.visibleItems.map((message, idx) => (
                <div key={message._id} className={`msg-card ${messagesList.getItemClassName(idx)}`.trim()} style={{ marginBottom: '0.75rem' }}>
                  <div className="msg-head"><div className="msg-from">{message.name}</div><div className="msg-date">{new Date(message.createdAt).toLocaleDateString()}</div></div>
                  <div className="msg-subject">{message.subject}</div>
                  <div className="msg-body">{message.message.slice(0, 100)}...</div>
                </div>
              ))
            ) : (
              <div className="empty-state">No messages have arrived yet.</div>
            )}
            {messagesList.hasMore && <ViewMoreButton expanded={messagesList.expanded} onClick={messagesList.toggle} />}
          </div>
        </div>
        <div className="a-card">
          <div className="a-card-head"><div className="a-card-title">Quick Actions</div></div>
          <div style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '.7rem' }}>
            <button className="a-add-btn" type="button" style={{ justifyContent: 'center' }} onClick={() => window.location.assign('/admin/projects')}>
              + Add New Project
            </button>
            <button className="a-add-btn" type="button" style={{ justifyContent: 'center', background: 'linear-gradient(135deg,var(--cyan),var(--purple))' }} onClick={() => window.location.assign('/admin/skills')}>
              + Add New Skill
            </button>
            <button className="a-btn a-btn-port" type="button" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '.65rem' }} onClick={() => window.open('/', '_blank')}>
              ↗ View Live Portfolio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;