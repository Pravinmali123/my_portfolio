import path from 'path';
import fs from 'fs';
import Resume from '../models/Resume.js';
import { uploadBufferToCloudinary } from '../utils/cloudinaryUpload.js';

// Get all resumes
export const getResumes = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status) filter.status = status;

    const resumes = await Resume.find(filter).sort({ isPrimary: -1, createdAt: -1 });

    res.json({
      success: true,
      count: resumes.length,
      data: resumes,
    });
  } catch (error) {
    next(error);
  }
};

// Get primary resume (public endpoint)
export const getPrimaryResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ isPrimary: true, status: 'active' });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    // Increment downloads
    resume.downloads += 1;
    await resume.save();

    res.json({
      success: true,
      data: resume,
    });
  } catch (error) {
    next(error);
  }
};

// Download primary resume (public endpoint) - forces a real file download
// instead of opening the PDF inline in the browser tab.
export const downloadPrimaryResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ isPrimary: true, status: 'active' });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    resume.downloads += 1;
    await resume.save();

    const downloadName = `${resume.filename || 'Resume'}`.endsWith('.pdf')
      ? resume.filename
      : `${resume.filename || 'Resume'}.pdf`;

    // New uploads: fileUrl is a full Cloudinary URL (persistent storage).
    // We used to redirect to the URL with Cloudinary's fl_attachment flag
    // added, but that transformation isn't reliable for resource_type
    // 'raw' (Cloudinary tries to generate a derived copy on the fly, which
    // can fail depending on plan/settings and comes back as a broken
    // response in the browser — ERR_INVALID_RESPONSE). Instead, fetch the
    // file ourselves and stream it back with the Content-Disposition
    // header set directly, which forces the download with the right
    // filename regardless of Cloudinary's transformation support.
    if (/^https?:\/\//i.test(resume.fileUrl)) {
      const safeBaseName = downloadName
        .replace(/\.pdf$/i, '')
        .replace(/[^a-zA-Z0-9 _-]/g, '')
        .trim()
        .replace(/\s+/g, '_') || 'Resume';

      const cloudinaryResponse = await fetch(resume.fileUrl);
      if (!cloudinaryResponse.ok) {
        return res.status(502).json({ success: false, message: 'Could not fetch resume file' });
      }

      res.setHeader('Content-Type', resume.mimeType || 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${safeBaseName}.pdf"`);

      const arrayBuffer = await cloudinaryResponse.arrayBuffer();
      return res.send(Buffer.from(arrayBuffer));
    }

    // Legacy fallback: a resume uploaded before this project switched to
    // Cloudinary, still pointing at a local '/uploads/resumes/...' path.
    const absolutePath = path.join(process.cwd(), resume.fileUrl);
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ success: false, message: 'Resume file missing on server' });
    }
    res.download(absolutePath, downloadName, (err) => {
      if (err) next(err);
    });
  } catch (error) {
    next(error);
  }
};

// Get single resume
export const getResume = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    res.json({
      success: true,
      data: resume,
    });
  } catch (error) {
    next(error);
  }
};

// Upload resume
export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    // If setting as primary, unset other primary resumes
    if (req.body.isPrimary === 'true' || req.body.isPrimary === true) {
      await Resume.updateMany({}, { isPrimary: false });
    }

    // Uploaded straight to Cloudinary (persistent) instead of local disk.
    // resource_type 'raw' + an explicit public_id/format keeps it a plain
    // downloadable .pdf rather than something Cloudinary tries to render.
    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder: 'portfolio/resumes',
      resource_type: 'raw',
      public_id: `resume-${Date.now()}`,
      format: 'pdf',
    });

    const resume = await Resume.create({
      filename: req.file.originalname,
      fileUrl: result.secure_url,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      isPrimary: req.body.isPrimary === 'true' || req.body.isPrimary === true,
      description: req.body.description || null,
    });

    res.status(201).json({
      success: true,
      message: 'Resume uploaded successfully',
      data: resume,
    });
  } catch (error) {
    next(error);
  }
};

// Update resume
export const updateResume = async (req, res, next) => {
  try {
    let resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    // If setting as primary, unset other primary resumes
    if (req.body.isPrimary === true) {
      await Resume.updateMany({ _id: { $ne: req.params.id } }, { isPrimary: false });
    }

    resume = await Resume.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Resume updated successfully',
      data: resume,
    });
  } catch (error) {
    next(error);
  }
};

// Delete resume
export const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findByIdAndDelete(req.params.id);

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    res.json({
      success: true,
      message: 'Resume deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};