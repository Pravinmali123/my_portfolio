import { useEffect, useMemo, useRef, useState } from 'react';
import { createProject, deleteProject, getProjects, updateProject, uploadProjectImage, uploadProjectVideo } from '../../services/contentService';
import { getFileUrl } from '../../services/api';
import { isHostedVideoFile } from '../../utils/videoUrl';
import { useToast } from '../../context/ToastContext';
import { useDragReorder, reorderArray } from '../../hooks/useDragReorder';
import { useExpandableList } from '../../hooks/useExpandableList';
import ViewMoreButton from '../../components/ViewMoreButton';

const initialForm = {
  title: '',
  category: 'FULLSTACK',
  technologies: '',
  description: '',
  details: '',
  githubUrl: '',
  liveUrl: '',
  videoUrl: '',
  image: '',
};

const isValidHttpUrl = (value) => {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [formValues, setFormValues] = useState(initialForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  // ---------- Thumbnail image ----------
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageDrag, setImageDrag] = useState(false);
  const imageInputRef = useRef(null);

  // ---------- Video demo ----------
  const [videoOpen, setVideoOpen] = useState(true);
  const [videoTab, setVideoTab] = useState('youtube'); // 'youtube' | 'upload'
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('');
  const [videoDrag, setVideoDrag] = useState(false);
  const videoInputRef = useRef(null);

 const loadProjects = async () => {
    try {
      const response = await getProjects();
      if (response.success) {
        const sorted = [...(response.data || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setProjects(sorted);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // ---------- Drag & drop reorder ----------
  const handleProjectReorder = async (fromIndex, toIndex) => {
    const reordered = reorderArray(projects, fromIndex, toIndex);
    setProjects(reordered); // optimistic UI update — instant feedback
    try {
      await Promise.all(
        reordered.map((project, index) => (
          project.order === index ? Promise.resolve() : updateProject(project._id, { order: index })
        ))
      );
      showToast('Project order updated', 's');
    } catch (error) {
      showToast('Order save na thai shaki, reload kari lo', 'e');
      console.error(error);
    }
  };

  const { getContainerProps, getItemProps, getHandleProps, isDragging, isOver } = useDragReorder(handleProjectReorder);

  const resetMediaState = () => {
    setImageFile(null);
    setImagePreview('');
    setImageDrag(false);
    setVideoFile(null);
    setVideoPreviewUrl('');
    setVideoDrag(false);
    setVideoTab('youtube');
    setVideoOpen(true);
  };

  const openProjectModal = (project) => {
    resetMediaState();
    if (project) {
      setSelectedProject(project);
      setFormValues({
        title: project.title || '',
        category: project.category || 'FULLSTACK',
        technologies: (project.technologies || []).join(', '),
        description: project.description || '',
        details: project.details || '',
        githubUrl: project.githubUrl || '',
        liveUrl: project.liveUrl || '',
        videoUrl: project.videoUrl || '',
        image: project.image || '',
      });
      if (project.videoUrl && isHostedVideoFile(project.videoUrl)) {
        setVideoTab('upload');
        setVideoPreviewUrl(getFileUrl(project.videoUrl));
      } else if (project.videoUrl) {
        setVideoTab('youtube');
      }
    } else {
      setSelectedProject(null);
      setFormValues(initialForm);
    }
    setModalOpen(true);
  };

  const closeProjectModal = () => {
    setModalOpen(false);
    setSelectedProject(null);
    setFormValues(initialForm);
    resetMediaState();
  };

  // ---------- Thumbnail image handlers ----------
  const handleImageFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Only image files allowed (JPG, PNG, WEBP)', 'e');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      showToast('Image must be under 3MB', 'e');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setFormValues((prev) => ({ ...prev, image: '' }));
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    setImageDrag(false);
    handleImageFile(e.dataTransfer.files?.[0]);
  };

  const currentImagePreview = imagePreview || (formValues.image ? getFileUrl(formValues.image) : '');

  // ---------- Video handlers ----------
  const handleVideoFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      showToast('Only video files allowed (MP4, WebM)', 'e');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      showToast('Video must be under 50MB', 'e');
      return;
    }
    setVideoFile(file);
    setVideoPreviewUrl(URL.createObjectURL(file));
  };

  const handleVideoDrop = (e) => {
    e.preventDefault();
    setVideoDrag(false);
    handleVideoFile(e.dataTransfer.files?.[0]);
  };

  // ---------- URL "Test" buttons ----------
  const testUrl = (url, label) => {
    if (!isValidHttpUrl(url)) {
      showToast(`Enter a valid ${label} URL first`, 'e');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const saveProject = async () => {
    if (!formValues.title || !formValues.description) {
      showToast('Project title and description are required', 'e');
      return;
    }

    setSaving(true);
    try {
      // 1. Resolve thumbnail image: upload a freshly chosen file, otherwise keep
      // whatever's already saved (uploaded path or pasted URL).
      let imagePath = formValues.image;
      if (imageFile) {
        const uploadResponse = await uploadProjectImage(imageFile);
        if (uploadResponse.success) {
          imagePath = uploadResponse.data.image;
        } else {
          throw new Error('Image upload failed');
        }
      }

      // 2. Resolve video: either the typed YouTube/embed URL, or a freshly
      // uploaded file stored on the server.
      let videoValue = formValues.videoUrl;
      if (videoTab === 'upload' && videoFile) {
        const videoUploadResponse = await uploadProjectVideo(videoFile);
        if (videoUploadResponse.success) {
          videoValue = videoUploadResponse.data.video;
        } else {
          throw new Error('Video upload failed');
        }
      }

      const payload = {
        title: formValues.title,
        category: formValues.category,
        technologies: formValues.technologies.split(',').map((item) => item.trim()).filter(Boolean),
        description: formValues.description,
        details: formValues.details,
        githubUrl: formValues.githubUrl,
        liveUrl: formValues.liveUrl,
        videoUrl: videoValue,
        image: imagePath,
      };

      if (selectedProject) {
        await updateProject(selectedProject._id, payload);
        showToast('Project updated successfully', 's');
      } else {
        await createProject(payload);
        showToast('Project created successfully', 's');
      }
      closeProjectModal();
      loadProjects();
    } catch (error) {
      showToast('Unable to save project', 'e');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async (project) => {
    setDeleteTarget(project);
  };

  const cancelDelete = () => setDeleteTarget(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProject(deleteTarget._id);
      showToast('Project deleted', 's');
      setDeleteTarget(null);
      loadProjects();
    } catch (error) {
      showToast('Unable to delete project', 'e');
      console.error(error);
    }
  };

  const projectCount = projects.length;

  const projectsList = useExpandableList(projects, 6);

const projectRows = useMemo(
  () => projectsList.visibleItems.map((project, index) => (
    <tr
      key={project._id}
      {...getItemProps(index)}
      className={`${isDragging(index) ? 'dnd-dragging' : ''} ${isOver(index) ? 'dnd-over' : ''} ${projectsList.getItemClassName(index)}`.trim()}
    >
      <td className="td-drag"><span {...getHandleProps(index)} className="drag-handle" title="Drag to reorder">⠿</span></td>
      <td data-label="#">{index + 1}</td>
      <td data-label="Title">{project.title}</td>
      <td data-label="Category">{project.category}</td>
      <td data-label="Links">
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {project.githubUrl ? <span className="badge badge-green">GH</span> : null}
          {project.liveUrl ? <span className="badge badge-cyan">Live</span> : null}
          {project.videoUrl ? <span className="badge badge-purple">Video</span> : null}
        </div>
      </td>
      <td className="td-actions" data-label="Actions">
        <button type="button" className="t-btn edit" onClick={() => openProjectModal(project)}>Edit</button>
        <button type="button" className="t-btn del" onClick={() => confirmDelete(project)}>Delete</button>
      </td>
    </tr>
  )),
  [projectsList, getItemProps, getHandleProps, isDragging, isOver]
);

  return (
    <div className="a-page active" id="page-projects">
      <div className="a-page-header">
        <div className="a-page-title">Manage <span>Projects</span></div>
        <button type="button" className="a-add-btn" onClick={() => openProjectModal(null)}>+ Add Project</button>
      </div>
      <div className="a-card">
        <div className="a-card-head">
          <div className="a-card-title">All Projects</div>
          <div className="a-card-count">{projectCount}</div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th style={{ width: '2rem' }} />
                <th>#</th>
                <th>Title</th>
                <th>Category</th>
                <th>Links</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody {...getContainerProps()}>
              {projectRows.length ? projectRows : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--muted)' }}>
                    No projects available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
        {projectsList.hasMore && <ViewMoreButton expanded={projectsList.expanded} onClick={projectsList.toggle} />}
      </div>

      {modalOpen && (
        <div className="modal-ov open" role="dialog" aria-modal="true">
          <div className="modal-box" style={{ maxWidth: '680px' }}>
            <div className="modal-head">
              <div className="modal-title">{selectedProject ? 'Edit Project' : 'Add New Project'}</div>
              <button type="button" className="modal-x" onClick={closeProjectModal}>✕</button>
            </div>
            <div className="modal-body">
              <input type="hidden" value={selectedProject?._id || ''} />

              {/* THUMBNAIL IMAGE */}
              <div className="f-group">
                <label className="f-label">🖼️ Project Thumbnail Image</label>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <div
                    onClick={() => imageInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setImageDrag(true); }}
                    onDragLeave={() => setImageDrag(false)}
                    onDrop={handleImageDrop}
                    className="up-thumb"
                    style={{ borderColor: imageDrag ? 'var(--neon)' : undefined }}
                  >
                    {currentImagePreview ? (
                      <img src={currentImagePreview} alt="Thumbnail preview" />
                    ) : (
                      <>
                        <div style={{ fontSize: '1.4rem' }}>🖼️</div>
                        <div style={{ fontFamily: 'var(--fm)', fontSize: '.62rem', color: 'var(--muted)' }}>Click to upload</div>
                      </>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                    <button type="button" className="a-add-btn" style={{ alignSelf: 'flex-start' }} onClick={() => imageInputRef.current?.click()}>
                      📤 Choose Image
                    </button>
                    <div style={{ fontFamily: 'var(--fm)', fontSize: '.65rem', color: 'var(--muted)', lineHeight: 1.6 }}>
                      JPG, PNG, WEBP · Max 3MB<br />
                      Recommended: 800×500px (16:9)
                    </div>
                  </div>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleImageFile(e.target.files?.[0])}
                  />
                </div>
                <input
                  className="f-input"
                  style={{ marginTop: '.8rem' }}
                  value={imageFile ? '' : formValues.image}
                  disabled={Boolean(imageFile)}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, image: e.target.value }))}
                  placeholder="Or paste image URL: https://..."
                />
              </div>

              <div className="form-row2">
                <div className="f-group">
                  <label className="f-label">Project Title *</label>
                  <input className="f-input" value={formValues.title} onChange={(e) => setFormValues((prev) => ({ ...prev, title: e.target.value }))} placeholder="e.g. Car Rental Website" />
                </div>
                <div className="f-group">
                  <label className="f-label">Category *</label>
                  <select className="f-select" value={formValues.category} onChange={(e) => setFormValues((prev) => ({ ...prev, category: e.target.value }))}>
                    <option value="FULLSTACK">Full Stack</option>
                    <option value="FRONTEND">Frontend</option>
                    <option value="BACKEND">Backend</option>
                    <option value="AI">🤖 AI Project</option>
                  </select>
                </div>
              </div>
              <div className="f-group">
                <label className="f-label">Tech Stack * (comma separated)</label>
                <input className="f-input" value={formValues.technologies} onChange={(e) => setFormValues((prev) => ({ ...prev, technologies: e.target.value }))} placeholder="React.js, Node.js, MongoDB, JWT Auth" />
              </div>
              <div className="f-group">
                <label className="f-label">Short Description * (card preview)</label>
                <textarea className="f-textarea" rows="2" value={formValues.description} onChange={(e) => setFormValues((prev) => ({ ...prev, description: e.target.value }))} placeholder="One line description of the project..." />
              </div>
              <div className="f-group">
                <label className="f-label">Full Description (details modal)</label>
                <textarea className="f-textarea" rows="3" value={formValues.details} onChange={(e) => setFormValues((prev) => ({ ...prev, details: e.target.value }))} placeholder="Detailed description with features, tech used, challenges solved..." />
              </div>

              {/* GITHUB URL */}
              <div className="f-group">
                <label className="f-label">🐙 GitHub Repository URL</label>
                <div style={{ display: 'flex', gap: '.6rem' }}>
                  <input className="f-input" value={formValues.githubUrl} onChange={(e) => setFormValues((prev) => ({ ...prev, githubUrl: e.target.value }))} placeholder="https://github.com/pravinmali/project-name" />
                  <button type="button" className="url-test-btn green" onClick={() => testUrl(formValues.githubUrl, 'GitHub')}>↗ Test</button>
                </div>
              </div>

              {/* LIVE DEMO URL */}
              <div className="f-group">
                <label className="f-label">🌐 Live Demo URL</label>
                <div style={{ display: 'flex', gap: '.6rem' }}>
                  <input className="f-input" value={formValues.liveUrl} onChange={(e) => setFormValues((prev) => ({ ...prev, liveUrl: e.target.value }))} placeholder="https://your-project.vercel.app" />
                  <button type="button" className="url-test-btn cyan" onClick={() => testUrl(formValues.liveUrl, 'Live Demo')}>↗ Test</button>
                </div>
              </div>

              {/* VIDEO DEMO */}
              <div className="f-group">
                <label
                  className="f-label"
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => setVideoOpen((prev) => !prev)}
                >
                  {videoOpen ? '▼' : '▶'} Video Demo
                </label>
                {videoOpen && (
                  <div>
                    <div style={{ display: 'flex', gap: '.6rem', marginBottom: '.8rem' }}>
                      <button
                        type="button"
                        className={`video-tab-btn${videoTab === 'youtube' ? ' active' : ''}`}
                        onClick={() => setVideoTab('youtube')}
                      >
                        ▶ YouTube URL
                      </button>
                      <button
                        type="button"
                        className={`video-tab-btn pink${videoTab === 'upload' ? ' active' : ''}`}
                        onClick={() => setVideoTab('upload')}
                      >
                        🎬 Upload Video
                      </button>
                    </div>

                    {videoTab === 'youtube' ? (
                      <input
                        className="f-input"
                        value={formValues.videoUrl}
                        onChange={(e) => setFormValues((prev) => ({ ...prev, videoUrl: e.target.value }))}
                        placeholder="https://www.youtube.com/watch?v=VIDEO_ID or embed URL"
                      />
                    ) : (
                      <>
                        <div
                          onClick={() => videoInputRef.current?.click()}
                          onDragOver={(e) => { e.preventDefault(); setVideoDrag(true); }}
                          onDragLeave={() => setVideoDrag(false)}
                          onDrop={handleVideoDrop}
                          className="up-video-zone"
                          style={{ borderColor: videoDrag ? 'var(--pink)' : undefined }}
                        >
                          {videoPreviewUrl ? (
                            <video src={videoPreviewUrl} controls style={{ maxWidth: '100%', maxHeight: 180, borderRadius: 8 }} />
                          ) : (
                            <>
                              <div style={{ fontSize: '1.8rem', marginBottom: '.4rem' }}>🎬</div>
                              <div style={{ fontFamily: 'var(--fm)', fontSize: '.75rem', color: 'var(--pink)' }}>Click or Drag &amp; Drop Video</div>
                              <div style={{ fontFamily: 'var(--fm)', fontSize: '.65rem', color: 'var(--muted)', marginTop: '.3rem' }}>MP4, WebM · Max 50MB</div>
                            </>
                          )}
                        </div>
                        <input
                          ref={videoInputRef}
                          type="file"
                          accept="video/*"
                          style={{ display: 'none' }}
                          onChange={(e) => handleVideoFile(e.target.files?.[0])}
                        />
                        <div style={{ fontFamily: 'var(--fm)', fontSize: '.65rem', color: 'var(--neon)', marginTop: '.6rem' }}>
                          ✓ Video server par upload thashe — MongoDB ma path save thashe
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button type="button" className="f-cancel" onClick={closeProjectModal}>Cancel</button>
                <button type="button" className="f-save" disabled={saving} onClick={saveProject}>
                  💾 {saving ? 'Saving...' : 'Save Project'}
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

export default ProjectsPage;