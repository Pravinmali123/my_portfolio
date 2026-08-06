import { useEffect, useState } from 'react';
import { getFileUrl } from '../services/api';

// Fullscreen lightbox for a certificate. Per spec this shows ONLY the
// certificate image (no title/description clutter competing for
// attention) plus a close button and a "Verify on Issuer Site" link that
// opens credentialUrl in a new tab — it never redirects the current tab.
const CertificateModal = ({ certificate, onClose }) => {
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Reset zoom state whenever a different certificate is opened/closed.
  useEffect(() => { setZoomed(false); }, [certificate]);

  if (!certificate) return null;

  return (
    <div className="cert-lightbox-ov open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <button type="button" className="cert-lightbox-close" onClick={onClose} aria-label="Close">
        ✕
      </button>

      <div className="cert-lightbox-box" onClick={(e) => e.target === e.currentTarget && onClose()}>
        {certificate.image ? (
          <div className={`cert-lightbox-img-wrap${zoomed ? ' zoomed' : ''}`}>
        <img
  src={getFileUrl(certificate.image)}
  alt={certificate.title}
  className="cert-lightbox-img"
  onClick={(e) => { e.stopPropagation(); setZoomed((z) => !z); }}
  draggable={false}
  decoding="async"
/>
          </div>
        ) : (
          <div className="cert-lightbox-no-img">🎓 No certificate image uploaded</div>
        )}

        {certificate.credentialUrl && (
          <div className="cert-lightbox-actions">
            <a
              className="dm-btn b-lv"
              href={certificate.credentialUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Verify on Issuer Site <i className="fa-solid fa-arrow-up-right-from-square" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateModal;