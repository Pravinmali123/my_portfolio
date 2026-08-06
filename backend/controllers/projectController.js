import Project from '../models/Project.js';
import { uploadBufferToCloudinary, optimizedImageUrl } from '../utils/cloudinaryUpload.js';

// Get all projects
export const getProjects = async (req, res, next) => {
  try {
    const { category, status } = req.query;
    const filter = {};

    if (category && category !== 'ALL') filter.category = category;
    if (status) filter.status = status;

    const projects = await Project.find(filter).sort({ order: 1, featured: -1, createdAt: -1 });

    res.json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

// Get single project
export const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// Create project
export const createProject = async (req, res, next) => {
  try {
    let payload = req.body;

    // If no explicit order was sent, push the new project to the END of the
    // list instead of letting it default to 0 — otherwise it ties with (and
    // due to the createdAt tiebreaker, jumps ahead of) whatever the admin
    // had already arranged via drag-and-drop reorder.
    if (payload.order === undefined || payload.order === null) {
      const lastProject = await Project.findOne().sort({ order: -1 });
      const nextOrder = lastProject ? lastProject.order + 1 : 0;
      payload = { ...payload, order: nextOrder };
    }

    const project = await Project.create(payload);

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// Update project
export const updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// Delete project
export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};


// Upload project thumbnail image
export const uploadProjectImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image provided' });
    }

    // Uploaded straight to Cloudinary (persistent) instead of local disk.
    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder: 'portfolio/projects',
      resource_type: 'image',
    });

    // Thumbnails render at up to ~330px in the grid but can be viewed
    // larger inside the Details modal, so allow more width than the
    // profile photo while still capping oversized camera uploads.
    const image = optimizedImageUrl(result.public_id, { maxWidth: 1600 });

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: { image },
    });
  } catch (error) {
    next(error);
  }
};

// Upload project demo video
export const uploadProjectVideo = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No video provided' });
    }

    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder: 'portfolio/projects/videos',
      resource_type: 'video',
    });

    res.json({
      success: true,
      message: 'Video uploaded successfully',
      data: { video: result.secure_url },
    });
  } catch (error) {
    next(error);
  }
};