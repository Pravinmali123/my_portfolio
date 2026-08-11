import { useEffect, useRef, useState } from 'react';
import {
  getAbout,
  updateAbout,
  uploadProfileImage,
  getPrimaryResume,
  uploadResume,
} from '../../services/contentService';
import { getFileUrl } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useDragReorder, reorderArray } from '../../hooks/useDragReorder';

const emptyForm = {
  name: '',
  role: '',
  email: '',
  phone: '',
  whatsapp: '',
  location: '',
  linkedin: '',
  github: '',
  portfolioUrl: '',
  summary: '',
  yearsExperience: '',
  projectsCompleted: '',
  technologiesLearned: '',
  statCardType: 'years',
  statCardValue: '',
  titles: '',
};

const emptyLanguage = { name: '', flag: '', level: '' };
const emptyEducation = { period: '', title: '', institution: '', description: '' };

// Curated presets so admin doesn't have to manually type a flag emoji
// (which is hard on a normal keyboard and is what caused the Gujarati
// card to show plain "IN" text instead of a properly-sized flag).
const LANGUAGE_PRESETS = [
  { name: 'Gujarati', flag: '🇮🇳' },
  { name: 'Hindi', flag: '🇮🇳' },
  { name: 'English', flag: '🇬🇧' },
  { name: 'Marathi', flag: '🇮🇳' },
  { name: 'Punjabi', flag: '🇮🇳' },
  { name: 'Bengali', flag: '🇮🇳' },
  { name: 'Tamil', flag: '🇮🇳' },
  { name: 'Telugu', flag: '🇮🇳' },
  { name: 'Urdu', flag: '🇵🇰' },
  { name: 'French', flag: '🇫🇷' },
  { name: 'German', flag: '🇩🇪' },
  { name: 'Spanish', flag: '🇪🇸' },
];
const LEVEL_PRESETS = ['Fluent', 'Native', 'Advanced', 'Intermediate', 'Basic'];

const AboutPage = () => {
  const [form, setForm] = useState(emptyForm);
  const [languages, setLanguages] = useState([]);
  const [newLanguage, setNewLanguage] = useState(emptyLanguage);
  const [strengths, setStrengths] = useState([]);
  const [newStrength, setNewStrength] = useState('');
  const [education, setEducation] = useState([]);
  const [newEducation, setNewEducation] = useState(emptyEducation);
  const [profileImage, setProfileImage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  const [resumeInfo, setResumeInfo] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);

  const [imageDrag, setImageDrag] = useState(false);
  const [resumeDrag, setResumeDrag] = useState(false);

  const photoInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  const { showToast } = useToast();

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const loadAbout = async () => {
    try {
      const response = await getAbout();
      if (response.success) {
        const a = response.data || {};
        setForm({
          name: a.name || '',
          role: a.subtitle || a.title || '',
          email: a.contactInfo?.email || '',
          phone: a.contactInfo?.phone || '',
          whatsapp: a.contactInfo?.whatsapp || '',
          location: [a.location?.city, a.location?.state, a.location?.country].filter(Boolean).join(', '),
          linkedin: a.contactInfo?.linkedin || '',
          github: a.contactInfo?.github || '',
          portfolioUrl: a.portfolioUrl || '',
          summary: a.summary || '',
          yearsExperience: a.yearsExperience ?? '',
          projectsCompleted: a.projectsCompleted ?? '',
          technologiesLearned: a.technologiesLearned ?? '',
          statCardType: a.statCardType || 'years',
          statCardValue: a.statCardValue ?? '',
          titles: Array.isArray(a.titles) ? a.titles.join(', ') : '',
        });
        setLanguages(Array.isArray(a.languages) ? a.languages : []);
        setStrengths(Array.isArray(a.strengths) ? a.strengths : []);
        setEducation(Array.isArray(a.education) ? a.education : []);
        setProfileImage(a.profileImage ? getFileUrl(a.profileImage) : '');
      }
    } catch (error) {
      console.error(error);
      showToast('About info load na thai shakyu', 'e');
    }
  };

  const loadResume = async () => {
    try {
      const response = await getPrimaryResume();
      if (response.success) {
        setResumeInfo(response.data);
      }
    } catch (error) {
      // No resume uploaded yet — silently ignore
      setResumeInfo(null);
    }
  };

  useEffect(() => {
    loadAbout();
    loadResume();
  }, []);

  const handleSaveAbout = async () => {
    setSaving(true);
    try {
      const [city, state, country] = form.location.split(',').map((s) => s?.trim() || '');
      const payload = {
        name: form.name,
        subtitle: form.role,
        summary: form.summary,
        portfolioUrl: form.portfolioUrl,
        yearsExperience: Number(form.yearsExperience) || 0,
        projectsCompleted: Number(form.projectsCompleted) || 0,
        technologiesLearned: Number(form.technologiesLearned) || 0,
        statCardType: form.statCardType,
        statCardValue: form.statCardValue === '' ? null : Number(form.statCardValue) || 0,
        titles: form.titles
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        location: { city, state, country },
        contactInfo: {
          email: form.email,
          phone: form.phone,
          whatsapp: form.whatsapp,
          linkedin: form.linkedin,
          github: form.github,
        },
        languages,
        strengths,
        education,
      };
      const response = await updateAbout(payload);
      if (response.success) {
        showToast('About info save thai gayi ✓', 's');
        loadAbout();
      }
    } catch (error) {
      console.error(error);
      showToast('About info save na thai shaki', 'e');
    } finally {
      setSaving(false);
    }
  };

  // ---------- Languages ----------
  const addLanguage = () => {
    if (!newLanguage.name.trim()) {
      showToast('Language nu naam lakho', 'e');
      return;
    }
    setLanguages((prev) => [...prev, { ...newLanguage, name: newLanguage.name.trim() }]);
    setNewLanguage(emptyLanguage);
  };

  const removeLanguage = (index) => {
    setLanguages((prev) => prev.filter((_, i) => i !== index));
  };

  const languageDrag = useDragReorder((from, to) => {
    setLanguages((prev) => reorderArray(prev, from, to));
  });

  // ---------- Key Strengths ----------
  const addStrength = () => {
    const value = newStrength.trim();
    if (!value) {
      showToast('Strength lakho', 'e');
      return;
    }
    if (strengths.includes(value)) {
      showToast('Aa strength pehla thi j chhe', 'e');
      return;
    }
    setStrengths((prev) => [...prev, value]);
    setNewStrength('');
  };

  const removeStrength = (index) => {
    setStrengths((prev) => prev.filter((_, i) => i !== index));
  };

  const strengthDrag = useDragReorder((from, to) => {
    setStrengths((prev) => reorderArray(prev, from, to));
  });

  // ---------- Education ----------
  const addEducation = () => {
    if (!newEducation.title.trim() || !newEducation.institution.trim()) {
      showToast('Degree/Title ane Institution lakhvu jaruri chhe', 'e');
      return;
    }
    setEducation((prev) => [...prev, { ...newEducation }]);
    setNewEducation(emptyEducation);
  };

  const removeEducation = (index) => {
    setEducation((prev) => prev.filter((_, i) => i !== index));
  };

  const educationDrag = useDragReorder((from, to) => {
    setEducation((prev) => reorderArray(prev, from, to));
  });

  // ---------- Profile Photo ----------
  const handlePhotoFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Only image files allowed', 'e');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be under 5MB', 'e');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handlePhotoDrop = (e) => {
    e.preventDefault();
    setImageDrag(false);
    handlePhotoFile(e.dataTransfer.files?.[0]);
  };

  const handleSavePhoto = async () => {
    if (!imageFile) {
      showToast('Pehla ek photo pasand karo', 'e');
      return;
    }
    setUploadingImage(true);
    try {
      const response = await uploadProfileImage(imageFile);
      if (response.success) {
        setProfileImage(getFileUrl(response.data.profileImage));
        setImageFile(null);
        setImagePreview('');
        showToast('Profile photo save thai gayi — Portfolio ma show thashe ✓', 's');
      }
    } catch (error) {
      console.error(error);
      showToast('Photo upload fail thayu', 'e');
    } finally {
      setUploadingImage(false);
    }
  };

  // ---------- Resume ----------
  const handleResumeFile = (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      showToast('Only PDF files allowed', 'e');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast('Resume must be under 10MB', 'e');
      return;
    }
    setResumeFile(file);
  };

  const handleResumeDrop = (e) => {
    e.preventDefault();
    setResumeDrag(false);
    handleResumeFile(e.dataTransfer.files?.[0]);
  };

  const handleSaveResume = async () => {
    if (!resumeFile) {
      showToast('Pehla ek PDF pasand karo', 'e');
      return;
    }
    setUploadingResume(true);
    try {
      const response = await uploadResume(resumeFile);
      if (response.success) {
        setResumeInfo(response.data);
        setResumeFile(null);
        showToast('Resume save thai gayu — Portfolio ma available thashe ✓', 's');
      }
    } catch (error) {
      console.error(error);
      showToast('Resume upload fail thayu', 'e');
    } finally {
      setUploadingResume(false);
    }
  };

  return (
    <div className="a-page active" id="page-about">
      <div className="a-page-header">
        <div className="a-page-title">Edit <span>About Info</span></div>
        <button type="button" className="a-add-btn" disabled={saving} onClick={handleSaveAbout}>
          💾 {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* RESUME UPLOAD CARD */}
      <div className="a-card" style={{ padding: '1.5rem' }}>
        <div style={{ fontFamily: 'var(--fd)', fontSize: '1rem', fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '.6rem' }}>
          📄 Resume / CV Upload
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flexShrink: 0, textAlign: 'center', minWidth: 100 }}>
            <div style={{ fontSize: '3rem', marginBottom: '.4rem' }}>📄</div>
            <div style={{ fontFamily: 'var(--fm)', fontSize: '.65rem', color: 'var(--muted)' }}>
              {resumeInfo ? resumeInfo.filename : 'Not uploaded'}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div
              onDragOver={(e) => { e.preventDefault(); setResumeDrag(true); }}
              onDragLeave={() => setResumeDrag(false)}
              onDrop={handleResumeDrop}
              onClick={() => resumeInputRef.current?.click()}
              style={{
                border: `2px dashed ${resumeDrag ? 'var(--cyan)' : 'rgba(0,245,255,.25)'}`,
                borderRadius: 10,
                padding: '1.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all .3s',
                background: resumeDrag ? 'rgba(0,245,255,.05)' : 'rgba(0,245,255,.02)',
                marginBottom: '.8rem',
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '.4rem' }}>📎</div>
              <div style={{ fontFamily: 'var(--fm)', fontSize: '.72rem', color: 'var(--cyan)' }}>
                {resumeFile ? resumeFile.name : 'Click or Drag & Drop Resume'}
              </div>
              <div style={{ fontFamily: 'var(--fm)', fontSize: '.62rem', color: 'var(--muted)', marginTop: '.3rem' }}>
                PDF only · Max 10MB
              </div>
            </div>
            <input
              ref={resumeInputRef}
              type="file"
              accept=".pdf,application/pdf"
              style={{ display: 'none' }}
              onChange={(e) => handleResumeFile(e.target.files?.[0])}
            />
            {resumeFile && (
              <button
                type="button"
                className="a-add-btn"
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={uploadingResume}
                onClick={handleSaveResume}
              >
                💾 {uploadingResume ? 'Uploading...' : 'Save Resume — Portfolio Ma Available Thashe'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* PROFILE PHOTO CARD */}
      <div className="a-card" style={{ padding: '1.5rem' }}>
        <div style={{ fontFamily: 'var(--fd)', fontSize: '1rem', fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '.6rem' }}>
          🖼️ Profile Photo
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: 120, height: 120, flexShrink: 0 }}>
            <div style={{
              width: 120, height: 120, borderRadius: '50%',
              background: 'linear-gradient(135deg,#1a1a1a,#0d0d0d)',
              border: '2px solid var(--border)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
              boxShadow: '0 0 30px rgba(57,245,20,.1)',
            }}>
              {imagePreview || profileImage ? (
                <img src={imagePreview || profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{
                  fontFamily: 'var(--fd)', fontSize: '2.5rem', fontWeight: 800,
                  background: 'linear-gradient(135deg,var(--neon),var(--cyan))',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  {(form.name || 'PM').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: '.88rem', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '1rem' }}>
              Aapni <strong style={{ color: 'var(--text)' }}>profile photo</strong> upload karo.
            </div>
            <div
              onDragOver={(e) => { e.preventDefault(); setImageDrag(true); }}
              onDragLeave={() => setImageDrag(false)}
              onDrop={handlePhotoDrop}
              onClick={() => photoInputRef.current?.click()}
              style={{
                border: `2px dashed ${imageDrag ? 'var(--neon)' : 'rgba(57,255,20,.25)'}`,
                borderRadius: 10,
                padding: '1.2rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all .3s',
                background: imageDrag ? 'rgba(57,255,20,.05)' : 'rgba(57,255,20,.02)',
              }}
            >
              <div style={{ fontSize: '1.8rem', marginBottom: '.5rem' }}>📸</div>
              <div style={{ fontFamily: 'var(--fm)', fontSize: '.72rem', color: 'var(--neon)' }}>
                {imageFile ? imageFile.name : 'Click here or Drag & Drop'}
              </div>
              <div style={{ fontFamily: 'var(--fm)', fontSize: '.65rem', color: 'var(--muted)', marginTop: '.3rem' }}>
                JPG, PNG, WEBP · Max 5MB
              </div>
            </div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => handlePhotoFile(e.target.files?.[0])}
            />
            {imageFile && (
              <button
                type="button"
                className="a-add-btn"
                style={{ width: '100%', justifyContent: 'center', marginTop: '.7rem' }}
                disabled={uploadingImage}
                onClick={handleSavePhoto}
              >
                💾 {uploadingImage ? 'Uploading...' : 'Save Photo — Portfolio Ma Show Thashe'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FORM FIELDS */}
      <div className="a-card" style={{ padding: '1.5rem' }}>
        <div className="form-row2">
          <div className="f-group">
            <label className="f-label">Full Name</label>
            <input className="f-input" value={form.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Pravin Mali" />
          </div>
          <div className="f-group">
            <label className="f-label">Title / Role</label>
            <input className="f-input" value={form.role} onChange={(e) => updateField('role', e.target.value)} placeholder="Full Stack Developer" />
          </div>
        </div>
        <div className="form-row2">
          <div className="f-group">
            <label className="f-label">Email</label>
            <input className="f-input" value={form.email} onChange={(e) => updateField('email', e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="f-group">
            <label className="f-label">Phone</label>
            <input className="f-input" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="+91 0000000000" />
          </div>
        </div>
        <div className="form-row2">
          <div className="f-group">
            <label className="f-label">WhatsApp Number</label>
            <input className="f-input" value={form.whatsapp} onChange={(e) => updateField('whatsapp', e.target.value)} placeholder="+91 0000000000" />
          </div>
          <div className="f-group">
            <label className="f-label">Location</label>
            <input className="f-input" value={form.location} onChange={(e) => updateField('location', e.target.value)} placeholder="Surat, Gujarat, India" />
          </div>
        </div>
        <div className="form-row2">
          <div className="f-group">
            <label className="f-label">LinkedIn URL</label>
            <input className="f-input" value={form.linkedin} onChange={(e) => updateField('linkedin', e.target.value)} placeholder="https://linkedin.com/in/username" />
          </div>
          <div className="f-group">
            <label className="f-label">GitHub URL</label>
            <input className="f-input" value={form.github} onChange={(e) => updateField('github', e.target.value)} placeholder="https://github.com/username" />
          </div>
        </div>
        <div className="form-row2">
          <div className="f-group">
            <label className="f-label">Portfolio URL</label>
            <input className="f-input" value={form.portfolioUrl} onChange={(e) => updateField('portfolioUrl', e.target.value)} placeholder="https://yourportfolio.dev" />
          </div>
        </div>
        <div className="f-group">
          <label className="f-label">Profile Summary</label>
          <textarea className="f-textarea" rows="4" value={form.summary} onChange={(e) => updateField('summary', e.target.value)} placeholder="Write your profile summary here..." />
        </div>
        <div className="form-row2">
          <div className="f-group">
            <label className="f-label">Projects Completed</label>
            <input className="f-input" type="number" value={form.projectsCompleted} onChange={(e) => updateField('projectsCompleted', e.target.value)} placeholder="5" />
          </div>
          <div className="f-group">
            <label className="f-label">Technologies Learned</label>
            <input className="f-input" type="number" value={form.technologiesLearned} onChange={(e) => updateField('technologiesLearned', e.target.value)} placeholder="10" />
          </div>
        </div>
        <div className="form-row2">
          <div className="f-group">
            <label className="f-label">2nd Stat Card Shows</label>
            <select className="f-select" value={form.statCardType} onChange={(e) => updateField('statCardType', e.target.value)}>
              <option value="years">Years of Experience</option>
              <option value="skills">Total Skills</option>
            </select>
          </div>
        </div>
        {form.statCardType === 'skills' ? (
          <div className="form-row2">
            <div className="f-group">
              <label className="f-label">Skills Count to Show</label>
              <input
                className="f-input"
                type="number"
                value={form.statCardValue}
                onChange={(e) => updateField('statCardValue', e.target.value)}
                placeholder="e.g. 12 (blank = auto count from Skills list)"
              />
              <div style={{ fontSize: '.68rem', color: 'var(--muted)', marginTop: '.4rem' }}>
                Live preview: card will show <strong style={{ color: 'var(--neon)' }}>
                  {form.statCardValue === '' ? '(auto count)' : form.statCardValue}+ Skills
                </strong>
              </div>
            </div>
          </div>
        ) : (
          <div className="form-row2">
            <div className="f-group">
              <label className="f-label">Years of Experience</label>
              <input
                className="f-input"
                type="number"
                value={form.yearsExperience}
                onChange={(e) => updateField('yearsExperience', e.target.value)}
                placeholder="1"
              />
              <div style={{ fontSize: '.68rem', color: 'var(--muted)', marginTop: '.4rem' }}>
                Live preview: card will show <strong style={{ color: 'var(--neon)' }}>
                  {form.yearsExperience || 0}+ Years Experience
                </strong>
              </div>
            </div>
          </div>
        )}
        <div className="f-group">
          <label className="f-label">Typing Titles (comma separated)</label>
          <input className="f-input" value={form.titles} onChange={(e) => updateField('titles', e.target.value)} placeholder="Full Stack Developer, React.js Developer, Node.js Developer" />
        </div>
      </div>

      {/* LANGUAGES CARD */}
      <div className="a-card" style={{ padding: '1.5rem' }}>
        <div style={{ fontFamily: 'var(--fd)', fontSize: '1rem', fontWeight: 700, marginBottom: '.4rem', display: 'flex', alignItems: 'center', gap: '.6rem' }}>
          🌐 Languages
        </div>
        <div style={{ fontSize: '.78rem', color: 'var(--muted)', marginBottom: '1rem' }}>
          Portfolio na "Languages" section ma dekhaay chhe. Add/Remove kari shako chho.
        </div>

        {languages.length > 0 && (
          <div {...languageDrag.getContainerProps()} style={{ display: 'flex', flexWrap: 'wrap', gap: '.7rem', marginBottom: '1.2rem' }}>
            {languages.map((lang, index) => (
              <div
                key={`${lang.name}-${index}`}
                {...languageDrag.getItemProps(index)}
                className={`dnd-chip ${languageDrag.isDragging(index) ? 'dnd-dragging' : ''} ${languageDrag.isOver(index) ? 'dnd-over' : ''}`.trim()}
                style={{
                  display: 'flex', alignItems: 'center', gap: '.6rem',
                  border: '1px solid var(--border)', borderRadius: 10,
                  padding: '.6rem .9rem', background: 'rgba(255,255,255,.02)',
                }}
              >
                <span {...languageDrag.getHandleProps(index)} className="drag-handle" title="Drag to reorder">⠿</span>
                <span style={{ fontSize: '1.1rem' }}>{lang.flag}</span>
                <span style={{ fontSize: '.82rem', fontWeight: 600 }}>{lang.name}</span>
                <span style={{ fontSize: '.72rem', color: 'var(--cyan)' }}>{lang.level}</span>
                <button
                  type="button"
                  onClick={() => removeLanguage(index)}
                  style={{
                    background: 'none', border: 'none', color: 'var(--red, #f87171)',
                    cursor: 'pointer', fontSize: '1rem', lineHeight: 1, padding: 0, marginLeft: '.3rem',
                  }}
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}>
          <select
            className="f-input"
            style={{ flex: '1 1 200px' }}
            value={newLanguage.name}
            onChange={(e) => {
              const preset = LANGUAGE_PRESETS.find((p) => p.name === e.target.value);
              setNewLanguage((prev) => ({
                ...prev,
                name: e.target.value,
                flag: preset ? preset.flag : prev.flag,
              }));
            }}
          >
            <option value="">-- Language pasand karo --</option>
            {LANGUAGE_PRESETS.map((preset) => (
              <option key={preset.name} value={preset.name}>{preset.flag} {preset.name}</option>
            ))}
          </select>
          <select
            className="f-input"
            style={{ flex: '1 1 160px' }}
            value={newLanguage.level}
            onChange={(e) => setNewLanguage((prev) => ({ ...prev, level: e.target.value }))}
          >
            <option value="">-- Level pasand karo --</option>
            {LEVEL_PRESETS.map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
          <button type="button" className="a-add-btn" onClick={addLanguage}>➕ Add Language</button>
        </div>
        <div style={{ fontSize: '.68rem', color: 'var(--muted)', marginTop: '.5rem' }}>
          Tip: flag emoji manually type na karo — list mathi j pasand karo, nahitar card ni size bagdi shake.
        </div>
      </div>

      {/* KEY STRENGTHS CARD */}
      <div className="a-card" style={{ padding: '1.5rem' }}>
        <div style={{ fontFamily: 'var(--fd)', fontSize: '1rem', fontWeight: 700, marginBottom: '.4rem', display: 'flex', alignItems: 'center', gap: '.6rem' }}>
          💪 Key Strengths
        </div>
        <div style={{ fontSize: '.78rem', color: 'var(--muted)', marginBottom: '1rem' }}>
          Portfolio na "Key Strengths" tags. Add/Remove kari shako chho.
        </div>

        {strengths.length > 0 && (
          <div {...strengthDrag.getContainerProps()} style={{ display: 'flex', flexWrap: 'wrap', gap: '.6rem', marginBottom: '1.2rem' }}>
            {strengths.map((strength, index) => (
              <div
                key={`${strength}-${index}`}
                {...strengthDrag.getItemProps(index)}
                className={`dnd-chip ${strengthDrag.isDragging(index) ? 'dnd-dragging' : ''} ${strengthDrag.isOver(index) ? 'dnd-over' : ''}`.trim()}
                style={{
                  display: 'flex', alignItems: 'center', gap: '.5rem',
                  border: '1px solid rgba(167,139,250,.3)', borderRadius: 999,
                  padding: '.45rem .9rem', background: 'rgba(167,139,250,.06)',
                }}
              >
                <span {...strengthDrag.getHandleProps(index)} className="drag-handle" title="Drag to reorder">⠿</span>
                <span style={{ fontSize: '.78rem', color: 'var(--purple)', fontWeight: 600 }}>{strength}</span>
                <button
                  type="button"
                  onClick={() => removeStrength(index)}
                  style={{
                    background: 'none', border: 'none', color: 'var(--red, #f87171)',
                    cursor: 'pointer', fontSize: '.95rem', lineHeight: 1, padding: 0,
                  }}
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: '.6rem' }}>
          <input
            className="f-input"
            style={{ flex: 1 }}
            value={newStrength}
            onChange={(e) => setNewStrength(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addStrength(); } }}
            placeholder="Naavi strength lakho (e.g. Clean Code)"
          />
          <button type="button" className="a-add-btn" onClick={addStrength}>➕ Add</button>
        </div>
      </div>

      {/* EDUCATION CARD */}
      <div className="a-card" style={{ padding: '1.5rem' }}>
        <div style={{ fontFamily: 'var(--fd)', fontSize: '1rem', fontWeight: 700, marginBottom: '.4rem', display: 'flex', alignItems: 'center', gap: '.6rem' }}>
          🎓 Education
        </div>
        <div style={{ fontSize: '.78rem', color: 'var(--muted)', marginBottom: '1rem' }}>
          Portfolio na "Education" section ma dekhaay chhe. Add/Remove kari shako chho.
        </div>

        {education.length > 0 && (
          <div {...educationDrag.getContainerProps()} style={{ display: 'flex', flexDirection: 'column', gap: '.8rem', marginBottom: '1.2rem' }}>
            {education.map((edu, index) => (
              <div
                key={`${edu.title}-${index}`}
                {...educationDrag.getItemProps(index)}
                className={`dnd-card ${educationDrag.isDragging(index) ? 'dnd-dragging' : ''} ${educationDrag.isOver(index) ? 'dnd-over' : ''}`.trim()}
                style={{
                  border: '1px solid var(--border)', borderRadius: 10,
                  padding: '.9rem 1rem', background: 'rgba(255,255,255,.02)',
                  display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start',
                }}
              >
                <span
                  {...educationDrag.getHandleProps(index)}
                  className="drag-handle"
                  title="Drag to reorder"
                  style={{ ...educationDrag.getHandleProps(index).style, marginTop: '.15rem' }}
                >
                  ⠿
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--fm)', fontSize: '.68rem', color: 'var(--cyan)', marginBottom: '.25rem' }}>{edu.period}</div>
                  <div style={{ fontWeight: 700, fontSize: '.88rem', marginBottom: '.15rem' }}>{edu.title}</div>
                  <div style={{ fontSize: '.78rem', color: 'var(--muted)' }}>{edu.institution}</div>
                  {edu.description && <div style={{ fontSize: '.74rem', color: 'var(--muted)', marginTop: '.3rem' }}>{edu.description}</div>}
                </div>
                <button
                  type="button"
                  onClick={() => removeEducation(index)}
                  style={{
                    background: 'none', border: 'none', color: 'var(--red, #f87171)',
                    cursor: 'pointer', fontSize: '1rem', lineHeight: 1, padding: 0, flexShrink: 0,
                  }}
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="form-row2">
          <div className="f-group">
            <label className="f-label">Period (e.g. 2021 or 2021–2024)</label>
            <input className="f-input" value={newEducation.period} onChange={(e) => setNewEducation((prev) => ({ ...prev, period: e.target.value }))} placeholder="2021" />
          </div>
          <div className="f-group">
            <label className="f-label">Degree / Title</label>
            <input className="f-input" value={newEducation.title} onChange={(e) => setNewEducation((prev) => ({ ...prev, title: e.target.value }))} placeholder="B.A. – Bachelor of Arts" />
          </div>
        </div>
        <div className="form-row2">
          <div className="f-group">
            <label className="f-label">Institution</label>
            <input className="f-input" value={newEducation.institution} onChange={(e) => setNewEducation((prev) => ({ ...prev, institution: e.target.value }))} placeholder="University / Institute naam" />
          </div>
          <div className="f-group">
<label className="f-label">Description (optional, *bold* words allowed)</label>
<textarea className="f-textarea" rows="2" value={newEducation.description} onChange={(e) => setNewEducation((prev) => ({ ...prev, description: e.target.value }))} placeholder="React.js, Node.js, ..." />
          </div>
        </div>
        <button type="button" className="a-add-btn" onClick={addEducation}>➕ Add Education</button>
      </div>

      <button
        type="button"
        className="a-add-btn"
        style={{ width: '100%', justifyContent: 'center', marginTop: '.5rem' }}
        disabled={saving}
        onClick={handleSaveAbout}
      >
        💾 {saving ? 'Saving...' : 'Save All Changes'}
      </button>
    </div>
  );
};

export default AboutPage;