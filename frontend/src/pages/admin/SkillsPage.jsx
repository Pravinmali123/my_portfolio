import { useEffect, useMemo, useState } from 'react';
import { createSkill, deleteSkill, getSkills, updateSkill, getAbout, updateAbout } from '../../services/contentService';
import { useToast } from '../../context/ToastContext';
import { useDragReorder, reorderArray } from '../../hooks/useDragReorder';
import { useExpandableList } from '../../hooks/useExpandableList';
import ViewMoreButton from '../../components/ViewMoreButton';

const initialSkillForm = {
  name: '',
  icon: '',
  category: 'FRONTEND',
  proficiency: 80,
};

const SkillsPage = () => {
  const [skills, setSkills] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [formValues, setFormValues] = useState(initialSkillForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { showToast } = useToast();
  const [aboutData, setAboutData] = useState(null);
  const [showPercentage, setShowPercentage] = useState(true);
  const [pctToggleBusy, setPctToggleBusy] = useState(false);

  const loadAboutSetting = async () => {
    try {
      const response = await getAbout();
      if (response.success) {
        setAboutData(response.data);
        setShowPercentage(response.data.showSkillPercentage === undefined ? true : Boolean(response.data.showSkillPercentage));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handlePercentageToggle = async () => {
    if (!aboutData) {
      showToast('Still loading settings, please try again in a moment', 'e');
      return;
    }
    const nextValue = !showPercentage;
    setShowPercentage(nextValue);
    setPctToggleBusy(true);
    try {
      const payload = { ...aboutData, showSkillPercentage: nextValue };
      const response = await updateAbout(payload);
      if (response.success) {
        setAboutData(response.data);
      }
      showToast(`Skill percentage turned ${nextValue ? 'ON' : 'OFF'}`, 's');
    } catch (error) {
      setShowPercentage(!nextValue);
      showToast('Unable to update this setting', 'e');
      console.error(error);
    } finally {
      setPctToggleBusy(false);
    }
  };

const loadSkills = async () => {
    try {
      const response = await getSkills();
      if (response.success) {
        const sorted = [...(response.data || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setSkills(sorted);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadSkills();
    loadAboutSetting();
  }, []);

  // ---------- Drag & drop reorder ----------
  const handleSkillReorder = async (fromIndex, toIndex) => {
    const reordered = reorderArray(skills, fromIndex, toIndex);
    setSkills(reordered); // optimistic UI update — instant feedback
    try {
      await Promise.all(
        reordered.map((skill, index) => (
          skill.order === index ? Promise.resolve() : updateSkill(skill._id, { order: index })
        ))
      );
      showToast('Skill order updated', 's');
    } catch (error) {
      showToast('Order save na thai shaki, reload kari lo', 'e');
      console.error(error);
    }
  };

  const { getContainerProps, getItemProps, getHandleProps, isDragging, isOver } = useDragReorder(handleSkillReorder);

  const openSkillModal = (skill) => {
    if (skill) {
      setSelectedSkill(skill);
      setFormValues({
        name: skill.name || '',
        icon: skill.icon || '',
        category: skill.category || 'FRONTEND',
        proficiency: skill.proficiency || 80,
      });
    } else {
      setSelectedSkill(null);
      setFormValues(initialSkillForm);
    }
    setModalOpen(true);
  };

  const closeSkillModal = () => {
    setModalOpen(false);
    setSelectedSkill(null);
    setFormValues(initialSkillForm);
  };

  const saveSkill = async () => {
    if (!formValues.name) {
      showToast('Skill name is required', 'e');
      return;
    }

    const payload = {
      name: formValues.name,
      icon: formValues.icon,
      category: formValues.category,
      proficiency: formValues.proficiency,
    };

    try {
      if (selectedSkill) {
        await updateSkill(selectedSkill._id, payload);
        showToast('Skill updated successfully', 's');
      } else {
        await createSkill(payload);
        showToast('Skill created successfully', 's');
      }
      closeSkillModal();
      loadSkills();
    } catch (error) {
      showToast('Unable to save skill', 'e');
      console.error(error);
    }
  };

  const confirmDelete = (skill) => {
    setDeleteTarget(skill);
  };

  const cancelDelete = () => setDeleteTarget(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSkill(deleteTarget._id);
      showToast('Skill deleted', 's');
      setDeleteTarget(null);
      loadSkills();
    } catch (error) {
      showToast('Unable to delete skill', 'e');
      console.error(error);
    }
  };

  const skillCount = skills.length;

  const skillsList = useExpandableList(skills, 6);

  const skillRows = useMemo(
    () => skillsList.visibleItems.map((skill, index) => (
      <tr
        key={skill._id}
        {...getItemProps(index)}
        className={`${isDragging(index) ? 'dnd-dragging' : ''} ${isOver(index) ? 'dnd-over' : ''} ${skillsList.getItemClassName(index)}`.trim()}
      >
        <td className="td-drag"><span {...getHandleProps(index)} className="drag-handle" title="Drag to reorder">⠿</span></td>
        <td data-label="#">{index + 1}</td>
        <td  data-label="Skill">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>{skill.icon || '•'}</span>
            <span>{skill.name}</span>
          </div>
        </td>
        <td data-label="Category">{skill.category}</td>
        <td data-label="Level">
          <div className="t-bar-wrap">
            <div className="t-bar-bg"><div className="t-bar-fill" style={{ width: `${skill.proficiency}%` }} /></div>
            <span className="t-pct">{skill.proficiency}%</span>
          </div>
        </td>
        <td className="td-actions"  data-label="Actions">
          <button type="button" className="t-btn edit" onClick={() => openSkillModal(skill)}>Edit</button>
          <button type="button" className="t-btn del" onClick={() => confirmDelete(skill)}>Delete</button>
        </td>
      </tr>
    )),
    [skillsList, getItemProps, getHandleProps, isDragging, isOver]
  );

  return (
    <div className="a-page active" id="page-skills">
      <div className="a-page-header">
        <div className="a-page-title">Manage <span>Skills</span></div>
        <button type="button" className="a-add-btn" onClick={() => openSkillModal(null)}>+ Add Skill</button>
      </div>
      <div className="a-card">
        <div className="modal-body">
          <div className="toggle-row">
            <div className="toggle-row-text">
              <div className="toggle-row-title"><i className="fa-solid fa-percent" /> Show Skill Percentage</div>
              <div className="toggle-row-desc">Shows the proficiency % number on each skill card on your live portfolio. Turn off to hide just the number — the progress bar always stays visible.</div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={showPercentage}
              className={`a-switch ${showPercentage ? 'on' : ''}`}
              onClick={handlePercentageToggle}
              disabled={pctToggleBusy || !aboutData}
            >
              <span className="a-switch-knob" />
            </button>
          </div>
        </div>
      </div>
      <div className="a-card">
        <div className="a-card-head">
          <div className="a-card-title">All Skills</div>
          <div className="a-card-count">{skillCount}</div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th style={{ width: '2rem' }} />
                <th>#</th>
                <th>Skill</th>
                <th>Category</th>
                <th>Level</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody {...getContainerProps()}>
              {skillRows.length ? skillRows : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--muted)' }}>
                    No skills available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
        {skillsList.hasMore && <ViewMoreButton expanded={skillsList.expanded} onClick={skillsList.toggle} />}
      </div>

      {modalOpen && (
        <div className="modal-ov open" role="dialog" aria-modal="true">
          <div className="modal-box" style={{ maxWidth: '460px' }}>
            <div className="modal-head">
              <div className="modal-title">{selectedSkill ? 'Edit Skill' : 'Add New Skill'}</div>
              <button type="button" className="modal-x" onClick={closeSkillModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row2">
                <div className="f-group">
                  <label className="f-label">Skill Name *</label>
                  <input className="f-input" value={formValues.name} onChange={(e) => setFormValues((prev) => ({ ...prev, name: e.target.value }))} placeholder="e.g. React.js" />
                </div>
                <div className="f-group">
                  <label className="f-label">Icon (Emoji)</label>
                  <input className="f-input" value={formValues.icon} onChange={(e) => setFormValues((prev) => ({ ...prev, icon: e.target.value }))} placeholder="⚛️" maxLength={4} />
                </div>
              </div>
              <div className="f-group">
                <label className="f-label">Category *</label>
                <select className="f-select" value={formValues.category} onChange={(e) => setFormValues((prev) => ({ ...prev, category: e.target.value }))}>
                  <option value="FRONTEND">Frontend</option>
                  <option value="BACKEND">Backend</option>
                  <option value="DATABASE">Database</option>
                  <option value="TOOLS">Tools</option>
                </select>
              </div>
              <div className="f-group">
                <label className="f-label">Proficiency Level: <span style={{ color: 'var(--neon)' }}>{formValues.proficiency}%</span></label>
                <div className="range-wrap">
                  <input
                    className="f-range"
                    type="range"
                    min="10"
                    max="100"
                    value={formValues.proficiency}
                    onChange={(e) => setFormValues((prev) => ({ ...prev, proficiency: Number(e.target.value) }))}
                  />
                  <div className="range-val">{formValues.proficiency}%</div>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="f-cancel" onClick={closeSkillModal}>Cancel</button>
                <button type="button" className="f-save" onClick={saveSkill}>💾 Save Skill</button>
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
              <div className="del-msg">Are you sure you want to delete <strong>{deleteTarget.name}</strong>?</div>
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

export default SkillsPage;