import { useEffect, useMemo, useRef, useState } from 'react';
import {
  createCertification,
  deleteCertification,
  getCertifications,
  updateCertification,
  uploadCertificationImage,
} from '../../services/contentService';
import { getFileUrl } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useDragReorder, reorderArray } from '../../hooks/useDragReorder';
import { useExpandableList } from '../../hooks/useExpandableList';
import ViewMoreButton from '../../components/ViewMoreButton';

const initialForm = {
  title: '',
  issuer: '',
  category: 'Programming',
  issueDate: '',
  credentialId: '',
  credentialUrl: '',
  description: '',
  image: '',
};

const CATEGORY_OPTIONS = ['Programming', 'Frontend', 'Backend', 'Fullstack', 'Cloud', 'Database', 'Other'];

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

// The date input needs YYYY-MM-DD, but data coming back from the API is a
// full ISO timestamp — this trims it down for the <input type="date">.
const toDateInputValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const CertificationsPage = () => {
  const [certifications, setCertifications] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCertification, setSelectedCertification] = useState(null);
  const [formValues, setFormValues] = useState(initialForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  // ---------- Badge image ----------
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const imageInputRef = useRef(null);

  const loadCertifications = async () => {
    try {
      const response = await getCertifications();
      if (response.success) {
        const sorted = [...(response.data || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setCertifications(sorted);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadCertifications();
  }, []);

  // ---------- Drag & drop reorder ----------
  const handleReorder = async (fromIndex, toIndex) => {
    const reordered = reorderArray(certifications, fromIndex, toIndex);
    setCertifications(reordered); // optimistic UI update — instant feedback
    try {
      await Promise.all(
        reordered.map((cert, index) => (
          cert.order === index ? Promise.resolve() : updateCertification(cert._id, { order: index })
        ))
      );
      showToast('Certification order updated', 's');
    } catch (error) {
      showToast('Order save na thai shaki, reload kari lo', 'e');
      console.error(error);
    }
  };

  const { getContainerProps, getItemProps, getHandleProps, isDragging, isOver } = useDragReorder(handleReorder);

  const resetImageState = () => {
    setImageFile(null);
    setImagePreview('');
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const openModal = (certification) => {
    if (certification) {
      setSelectedCertification(certification);
      setFormValues({
        title: certification.title || '',
        issuer: certification.issuer || '',
        category: certification.category || 'Programming',
        issueDate: toDateInputValue(certification.issueDate),
        credentialId: certification.credentialId || '',
        credentialUrl: certification.credentialUrl || '',
        description: certification.description || '',
        image: certification.image || '',
      });
      setImagePreview(certification.image ? getFileUrl(certification.image) : '');
    } else {
      setSelectedCertification(null);
      setFormValues(initialForm);
      setImagePreview('');
    }
    setImageFile(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedCertification(null);
    setFormValues(initialForm);
    resetImageState();
  };

  const handleImageChange = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please choose an image file', 'e');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      showToast('Image must be under 3MB', 'e');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const saveCertification = async () => {
    if (!formValues.title || !formValues.issuer) {
      showToast('Title and issuer are required', 'e');
      return;
    }

    setSaving(true);
    try {
      let imagePath = formValues.image;
      if (imageFile) {
        const uploadResponse = await uploadCertificationImage(imageFile);
        if (uploadResponse.success) {
          imagePath = uploadResponse.data.image;
        } else {
          throw new Error('Image upload failed');
        }
      }

      const payload = {
        title: formValues.title,
        issuer: formValues.issuer,
        category: formValues.category,
        issueDate: formValues.issueDate || undefined,
        credentialId: formValues.credentialId,
        credentialUrl: formValues.credentialUrl,
        description: formValues.description,
        image: imagePath,
      };

      if (selectedCertification) {
        await updateCertification(selectedCertification._id, payload);
        showToast('Certification updated successfully', 's');
      } else {
        await createCertification(payload);
        showToast('Certification created successfully', 's');
      }
      closeModal();
      loadCertifications();
   } catch (error) {
  const serverMsg = error?.response?.data?.message
    || error?.response?.data?.errors?.[0]?.msg
    || error?.message;
  showToast(serverMsg || 'Unable to save certification', 'e');
  console.error(error);
} finally {
  setSaving(false);
}
  };

  const confirmDelete = (certification) => setDeleteTarget(certification);
  const cancelDelete = () => setDeleteTarget(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCertification(deleteTarget._id);
      showToast('Certification deleted', 's');
      setDeleteTarget(null);
      loadCertifications();
    } catch (error) {
      showToast('Unable to delete certification', 'e');
      console.error(error);
    }
  };

  const certificationCount = certifications.length;

  const certificationsList = useExpandableList(certifications, 6);

  const rows = useMemo(
    () => certificationsList.visibleItems.map((cert, index) => (
      <tr
        key={cert._id}
        {...getItemProps(index)}
        className={`${isDragging(index) ? 'dnd-dragging' : ''} ${isOver(index) ? 'dnd-over' : ''} ${certificationsList.getItemClassName(index)}`.trim()}
      >
        <td className="td-drag"><span {...getHandleProps(index)} className="drag-handle" title="Drag to reorder">⠿</span></td>
        <td data-label="#">{index + 1}</td>
        <td data-label="Certification">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {cert.image ? (
              <img src={getFileUrl(cert.image)} alt="" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }} />
            ) : (
              <span><i className="fa-solid fa-certificate" /></span>
            )}
            <span>{cert.title}</span>
          </div>
        </td>
        <td data-label="Issuer">{cert.issuer}</td>
        <td data-label="Category">{cert.category || 'General'}</td>
        <td data-label="Issued">{formatDate(cert.issueDate) || '—'}</td>
        <td className="td-actions" data-label="Actions">
          <button type="button" className="t-btn edit" onClick={() => openModal(cert)}>Edit</button>
          <button type="button" className="t-btn del" onClick={() => confirmDelete(cert)}>Delete</button>
        </td>
      </tr>
    )),
    [certificationsList, getItemProps, getHandleProps, isDragging, isOver]
  );

  return (
    <div className="a-page active" id="page-certifications">
      <div className="a-page-header">
        <div className="a-page-title">Manage <span>Certifications</span></div>
        <button type="button" className="a-add-btn" onClick={() => openModal(null)}>+ Add Certification</button>
      </div>
      <div className="a-card">
        <div className="a-card-head">
          <div className="a-card-title">All Certifications</div>
          <div className="a-card-count">{certificationCount}</div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '2rem' }} />
                  <th>#</th>
                  <th>Certification</th>
                  <th>Issuer</th>
                  <th>Category</th>
                  <th>Issued</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody {...getContainerProps()}>
                {rows.length ? rows : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--muted)' }}>
                      No certifications added yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {certificationsList.hasMore && <ViewMoreButton expanded={certificationsList.expanded} onClick={certificationsList.toggle} />}
      </div>

      {modalOpen && (
        <div className="modal-ov open" role="dialog" aria-modal="true">
          <div className="modal-box" style={{ maxWidth: '520px' }}>
            <div className="modal-head">
              <div className="modal-title">{selectedCertification ? 'Edit Certification' : 'Add New Certification'}</div>
              <button type="button" className="modal-x" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="f-group">
                <label className="f-label">Title *</label>
                <input className="f-input" value={formValues.title} onChange={(e) => setFormValues((prev) => ({ ...prev, title: e.target.value }))} placeholder="e.g. AWS Certified Developer" />
              </div>
              <div className="form-row2">
                <div className="f-group">
                  <label className="f-label">Issuing Organization *</label>
                  <input className="f-input" value={formValues.issuer} onChange={(e) => setFormValues((prev) => ({ ...prev, issuer: e.target.value }))} placeholder="e.g. Amazon Web Services" />
                </div>
                <div className="f-group">
                  <label className="f-label">Category</label>
                  <select className="f-select" value={formValues.category} onChange={(e) => setFormValues((prev) => ({ ...prev, category: e.target.value }))}>
                    {CATEGORY_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row2">
                <div className="f-group">
                  <label className="f-label">Issue Date</label>
                  <input className="f-input" type="date" value={formValues.issueDate} onChange={(e) => setFormValues((prev) => ({ ...prev, issueDate: e.target.value }))} />
                </div>
                <div className="f-group">
                  <label className="f-label">Credential ID</label>
                  <input className="f-input" value={formValues.credentialId} onChange={(e) => setFormValues((prev) => ({ ...prev, credentialId: e.target.value }))} placeholder="Optional" />
                </div>
              </div>
              <div className="f-group">
                <label className="f-label">Credential URL</label>
                <input className="f-input" value={formValues.credentialUrl} onChange={(e) => setFormValues((prev) => ({ ...prev, credentialUrl: e.target.value }))} placeholder="https://..." />
              </div>
              <div className="f-group">
                <label className="f-label">Short Description (card preview)</label>
                <textarea
                  className="f-input"
                  rows={3}
                  value={formValues.description}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g. Certified in modern JavaScript including ES6+ features, async programming, and more."
                />
              </div>
              <div className="f-group">
                <label className="f-label">Certificate Image (shown full-size on the card)</label>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="f-input"
                  onChange={(e) => handleImageChange(e.target.files?.[0])}
                />
                {imagePreview && (
                  <div style={{ marginTop: '.6rem' }}>
                    <img src={imagePreview} alt="Certificate preview" style={{ width: '100%', maxWidth: 260, borderRadius: 12, objectFit: 'cover' }} />
                  </div>
                )}
              </div>
              <div className="form-actions">
                <button type="button" className="f-cancel" onClick={closeModal}>Cancel</button>
                <button type="button" className="f-save" onClick={saveCertification} disabled={saving}>
                  {saving ? 'Saving…' : '💾 Save Certification'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="modal-ov open del-modal" role="dialog" aria-modal="true">
          <div className="modal-box">
            <div className="modal-body" style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="del-icon">🗑️</div>
              <div className="modal-title" style={{ marginBottom: '.6rem' }}>Confirm Delete</div>
              <div className="del-msg">Are you sure you want to delete <strong>{deleteTarget.title}</strong>?</div>
              <div className="del-actions">
                <button type="button" className="del-no" onClick={cancelDelete}>Cancel</button>
                <button type="button" className="del-yes" onClick={handleDelete}>Yes, Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificationsPage;