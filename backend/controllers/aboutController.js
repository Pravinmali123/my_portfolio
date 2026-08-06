import About from '../models/About.js';
import { uploadBufferToCloudinary, optimizedImageUrl } from '../utils/cloudinaryUpload.js';

// Get about info
export const getAbout = async (req, res, next) => {
  try {
    let about = await About.findOne();

    // Create default if doesn't exist
    if (!about) {
      about = await About.create({
        summary: 'Full Stack Developer specializing in MERN stack',
        strengths: ['Problem-solving', 'Fast learner', 'Strong UI sense', 'Clean Code', 'Team Collaboration'],
        languages: [
          { name: 'Gujarati', flag: '🇮🇳', level: 'Fluent' },
          { name: 'Hindi', flag: '🇮🇳', level: 'Fluent' },
          { name: 'English', flag: '🇬🇧', level: 'Intermediate' },
        ],
        education: [
          { period: '2021', title: 'B.A. – Bachelor of Arts', institution: 'Hemchandracharya North Gujarat University — HNGU', description: '' },
          { period: 'CDMI', title: 'Full Stack Web Development', institution: 'Creative Design & Multimedia Institute', description: 'React.js, Node.js, Express.js, MongoDB, MySQL, REST APIs, JWT Auth, Git & GitHub.' },
          { period: '2021 – 2024', title: 'Government Exam Preparation', institution: 'Self Study', description: '' },
        ],
      });
    }

    res.json({
      success: true,
      data: about,
    });
  } catch (error) {
    next(error);
  }
};

// Update about info
export const updateAbout = async (req, res, next) => {
  try {
    let about = await About.findOne();

    if (!about) {
      about = await About.create(req.body);
    } else {
      about = await About.findByIdAndUpdate(about._id, req.body, {
        new: true,
        runValidators: true,
      });
    }

    res.json({
      success: true,
      message: 'About information updated successfully',
      data: about,
    });
  } catch (error) {
    next(error);
  }
};


// Upload profile image
export const uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image provided' });
    }

    // Uploaded straight to Cloudinary (persistent) instead of local disk.
    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder: 'portfolio/about',
      resource_type: 'image',
    });

    // Profile photo only ever displays at small sizes (hero ring ~310px,
    // retina-safe up to ~800px), so a modest max width keeps it sharp
    // while cutting typical multi-MB phone photos down drastically.
    const profileImage = optimizedImageUrl(result.public_id, { maxWidth: 800 });

    let about = await About.findOne();
    if (!about) {
      about = await About.create({ summary: 'Full Stack Developer' });
    }

    about.profileImage = profileImage;
    await about.save();

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: about,
    });
  } catch (error) {
    next(error);
  }
};