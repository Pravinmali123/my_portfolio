import mongoose from 'mongoose';

const certificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide certification title'],
    },
    issuer: {
      type: String,
      required: [true, 'Please provide issuing organization'],
    },
    category: {
      type: String,
      default: 'General',
    },
    description: {
      type: String,
      default: null,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    credentialId: {
      type: String,
      default: null,
    },
    credentialUrl: {
      type: String,
      default: null,
    },
    image: {
      type: String,
      default: null,
    },
    order: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Certification', certificationSchema);
