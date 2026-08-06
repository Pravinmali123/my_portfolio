/**
 * Centered "View More" / "Show Less" toggle button.
 * Shared by every admin list and portfolio grid that supports expand/collapse.
 * Reuses existing theme classes only — no new visual system introduced.
 */
const ViewMoreButton = ({ expanded, onClick }) => (
  <div className="vm-wrap">
    <button type="button" className="vm-btn" onClick={onClick}>
      <span>{expanded ? 'Show Less' : 'View More'}</span>
      <i className={`fa-solid fa-chevron-down vm-btn-icon${expanded ? ' vm-btn-icon-up' : ''}`} />
    </button>
  </div>
);

export default ViewMoreButton;