import jwt from 'jsonwebtoken';

// Generate JWT token
export const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Email validation regex
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// URL validation
export const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// File validation
export const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = parseInt(process.env.MAX_FILE_SIZE || 50000000);

  if (!file) return { valid: false, error: 'No file provided' };
  if (!allowedTypes.includes(file.mimetype)) return { valid: false, error: 'Invalid file type' };
  if (file.size > maxSize) return { valid: false, error: 'File size exceeds limit' };

  return { valid: true };
};

export const validateDocumentFile = (file) => {
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const maxSize = parseInt(process.env.MAX_FILE_SIZE || 50000000);

  if (!file) return { valid: false, error: 'No file provided' };
  if (!allowedTypes.includes(file.mimetype)) return { valid: false, error: 'Invalid file type' };
  if (file.size > maxSize) return { valid: false, error: 'File size exceeds limit' };

  return { valid: true };
};
