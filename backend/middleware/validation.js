import { body, validationResult, param } from 'express-validator';

// Validation middleware - checks for errors and returns them
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({
        field: e.param,
        message: e.msg,
      })),
    });
  }
  next();
};

// Validation rules for different routes
export const validateProject = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('category').isIn(['FULLSTACK', 'FRONTEND', 'BACKEND', 'AI']).withMessage('Invalid category'),
  body('technologies').isArray().withMessage('Technologies must be an array'),
  body('githubUrl').optional().isURL().withMessage('Invalid GitHub URL'),
  body('liveUrl').optional().isURL().withMessage('Invalid Live URL'),
];

export const validateSkill = [
  body('name').trim().notEmpty().withMessage('Skill name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('category').isIn(['FRONTEND', 'BACKEND', 'DATABASE', 'TOOLS']).withMessage('Invalid category'),
  body('proficiency').isInt({ min: 0, max: 100 }).withMessage('Proficiency must be between 0 and 100'),
];

export const validateCertification = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('issuer').trim().notEmpty().withMessage('Issuer is required').isLength({ min: 2 }).withMessage('Issuer must be at least 2 characters'),
  body('credentialUrl').optional({ checkFalsy: true }).isURL().withMessage('Invalid credential URL'),
];

export const validateMessage = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('subject').trim().notEmpty().withMessage('Subject is required').isLength({ min: 3 }).withMessage('Subject must be at least 3 characters'),
  body('message').trim().notEmpty().withMessage('Message is required').isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
];

export const validateLogin = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const validatePasswordChange = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),
];

export const validateAbout = [
  body('summary').trim().notEmpty().withMessage('Summary is required').isLength({ min: 10 }).withMessage('Summary must be at least 10 characters'),
  body('yearsExperience').isInt({ min: 0 }).withMessage('Years of experience must be a positive number'),
];

export const validateId = [param('id').isMongoId().withMessage('Invalid ID format')];
