import { api, axiosPrivate } from './api';

export const getAbout = async () => {
  const response = await api.get('/api/about');
  return response.data;
};

export const updateAbout = async (about) => {
  const response = await axiosPrivate.put('/api/about', about);
  return response.data;
};

export const uploadProfileImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await axiosPrivate.post('/api/about/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getSkills = async () => {
  const response = await api.get('/api/skills', { params: { _: Date.now() } });
  return response.data;
};

export const createSkill = async (skill) => {
  const response = await axiosPrivate.post('/api/skills', skill);
  return response.data;
};

export const updateSkill = async (id, skill) => {
  const response = await axiosPrivate.put(`/api/skills/${id}`, skill);
  return response.data;
};

export const deleteSkill = async (id) => {
  const response = await axiosPrivate.delete(`/api/skills/${id}`);
  return response.data;
};

export const getCertifications = async () => {
  const response = await api.get('/api/certifications', { params: { _: Date.now() } });
  return response.data;
};

export const createCertification = async (certification) => {
  const response = await axiosPrivate.post('/api/certifications', certification);
  return response.data;
};

export const updateCertification = async (id, certification) => {
  const response = await axiosPrivate.put(`/api/certifications/${id}`, certification);
  return response.data;
};

export const deleteCertification = async (id) => {
  const response = await axiosPrivate.delete(`/api/certifications/${id}`);
  return response.data;
};

export const uploadCertificationImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await axiosPrivate.post('/api/certifications/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getProjects = async () => {
  const response = await api.get('/api/projects', { params: { _: Date.now() } });
  return response.data;
};

export const createProject = async (project) => {
  const response = await axiosPrivate.post('/api/projects', project);
  return response.data;
};

export const updateProject = async (id, project) => {
  const response = await axiosPrivate.put(`/api/projects/${id}`, project);
  return response.data;
};

export const deleteProject = async (id) => {
  const response = await axiosPrivate.delete(`/api/projects/${id}`);
  return response.data;
};

export const uploadProjectImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await axiosPrivate.post('/api/projects/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const uploadProjectVideo = async (file) => {
  const formData = new FormData();
  formData.append('video', file);
  const response = await axiosPrivate.post('/api/projects/upload-video', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getMessages = async () => {
  const response = await axiosPrivate.get('/api/messages');
  return response.data;
};

export const deleteMessage = async (id) => {
  const response = await axiosPrivate.delete(`/api/messages/${id}`);
  return response.data;
};

export const createMessage = async (message) => {
  const response = await api.post('/api/messages', message);
  return response.data;
};

export const getPrimaryResume = async () => {
  const response = await api.get('/api/resume/primary');
  return response.data;
};

export const uploadResume = async (file, description = '') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('isPrimary', 'true');
  formData.append('description', description);
  const response = await axiosPrivate.post('/api/resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// ---------- Visitor tracking (who viewed the portfolio) ----------

// Called from the public portfolio page — logs a page view
export const trackVisit = async (page = '/') => {
  try {
    const response = await api.post('/api/visits/track', {
      page,
      referrer: document.referrer || 'Direct',
    });
    return response.data;
  } catch (error) {
    // Never let analytics break the visitor's experience
    console.error('Visit tracking failed', error);
    return null;
  }
};

// Admin: paginated list of raw visits
export const getVisits = async (page = 1, limit = 20) => {
  const response = await axiosPrivate.get('/api/visits', { params: { page, limit } });
  return response.data;
};

// Admin: summary stats for the Overview dashboard
export const getVisitStats = async () => {
  const response = await axiosPrivate.get('/api/visits/stats');
  return response.data;
};

export const deleteVisit = async (id) => {
  const response = await axiosPrivate.delete(`/api/visits/${id}`);
  return response.data;
};

export const clearVisits = async () => {
  const response = await axiosPrivate.delete('/api/visits/clear');
  return response.data;
};