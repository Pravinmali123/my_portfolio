import Certification from '../models/Certification.js';
import { uploadBufferToCloudinary, optimizedImageUrl } from '../utils/cloudinaryUpload.js';

// Get all certifications
export const getCertifications = async (req, res, next) => {
  try {
    const filter = { status: 'active' };
    const certifications = await Certification.find(filter).sort({ order: 1, issueDate: -1 });

    res.json({
      success: true,
      count: certifications.length,
      data: certifications,
    });
  } catch (error) {
    next(error);
  }
};

// Get single certification
export const getCertification = async (req, res, next) => {
  try {
    const certification = await Certification.findById(req.params.id);
    if (!certification) {
      return res.status(404).json({ success: false, message: 'Certification not found' });
    }

    res.json({
      success: true,
      data: certification,
    });
  } catch (error) {
    next(error);
  }
};

// Create certification
export const createCertification = async (req, res, next) => {
  try {
    let payload = req.body;

    if (payload.order === undefined || payload.order === null) {
      const lastCertification = await Certification.findOne().sort({ order: -1 });
      const nextOrder = lastCertification ? lastCertification.order + 1 : 0;
      payload = { ...payload, order: nextOrder };
    }

    const certification = await Certification.create(payload);

    res.status(201).json({
      success: true,
      message: 'Certification created successfully',
      data: certification,
    });
  } catch (error) {
    next(error);
  }
};

// Update certification
export const updateCertification = async (req, res, next) => {
  try {
    let certification = await Certification.findById(req.params.id);
    if (!certification) {
      return res.status(404).json({ success: false, message: 'Certification not found' });
    }

    certification = await Certification.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Certification updated successfully',
      data: certification,
    });
  } catch (error) {
    next(error);
  }
};

// Delete certification
export const deleteCertification = async (req, res, next) => {
  try {
    const certification = await Certification.findByIdAndDelete(req.params.id);
    if (!certification) {
      return res.status(404).json({ success: false, message: 'Certification not found' });
    }

    res.json({
      success: true,
      message: 'Certification deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};


export const uploadCertificationImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    // Uploaded straight to Cloudinary (persistent) instead of local disk.
    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder: 'portfolio/certifications',
      resource_type: 'image',
    });

    // Certificate scans are typically screenshots/exports and can be quite
    // large — cap width while keeping detail readable inside the lightbox.
    const image = optimizedImageUrl(result.public_id, { maxWidth: 1400 });

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: { image },
    });
  } catch (error) {
    next(error);
  }
};