import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: [true, 'Please provide filename'],
    },
    fileUrl: {
      type: String,
      required: [true, 'Please provide file URL'],
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    mimeType: {
      type: String,
      default: 'application/pdf',
    },
    isPrimary: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      default: null,
    },
    downloads: {
      type: Number,
      default: 0,
    },
    version: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Resume', resumeSchema);
