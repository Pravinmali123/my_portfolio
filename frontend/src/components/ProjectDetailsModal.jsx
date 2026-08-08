import { useEffect } from 'react';
import { getFileUrl } from '../services/api';
import { isHostedVideoFile } from '../utils/videoUrl';
import renderFormattedText from '../utils/textFormat.jsx';

const ProjectDetailsModal = ({ project, onClose }) => {
  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!project) return null;

  const hasVideo = Boolean(project.videoUrl);
  const isHostedVideo = isHostedVideoFile(project.videoUrl);
  const imageContent = project.image ? (
    <img src={getFileUrl(project.image)} alt={project.title} loading="lazy" decoding="async" />
  ) : (
    <div className="dm-no-vid">📸 No preview image available</div>
  );


  return (
    <div className="dm-ov open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dm-box">
        <div className="dm-media">
          {hasVideo && isHostedVideo ? (
            <video src={getFileUrl(project.videoUrl)} controls />
          ) : hasVideo ? (
            <iframe
              src={project.videoUrl}
              title={project.title}
              allow="autoplay;encrypted-media;fullscreen;picture-in-picture"
            />
          ) : (
            <div className="dm-thumb-wrap">{imageContent}</div>
          )}
        </div>
        <div className="dm-body">
          <div className="dm-head">
            <div className="dm-title">{project.title}</div>
            <button className="dm-x" onClick={onClose} type="button">
              ✕
            </button>
          </div>
          <div className="dm-tags-row">
            {project.technologies?.map((tag, index) => (
              <span key={tag + index} className={`pr-tag ${index === 1 ? 'cy' : index === 2 ? 'pu' : ''}`}>
                {tag}
              </span>
            ))}
          </div>
          <div className="dm-desc">{renderFormattedText(project.details || project.description)}</div>
          <div className="dm-actions">
            {project.githubUrl ? (
              <a className="dm-btn b-gh" href={project.githubUrl} target="_blank" rel="noreferrer">
                GitHub
              </a>
            ) : null}
            {project.liveUrl ? (
              <a className="dm-btn b-lv" href={project.liveUrl} target="_blank" rel="noreferrer">
                Live Demo
              </a>
            ) : null}
            {hasVideo ? (
              <a
                className="dm-btn b-vd"
                href={isHostedVideo ? getFileUrl(project.videoUrl) : project.videoUrl}
                target="_blank"
                rel="noreferrer"
              >
                Watch Video
              </a>
            ) : (
              <span style={{ fontFamily: 'var(--fm)', fontSize: '0.65rem', color: 'var(--muted)', alignSelf: 'center' }}>
                📹 No video yet
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsModal;