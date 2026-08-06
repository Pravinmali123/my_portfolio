import mongoose from 'mongoose';

const visitSchema = new mongoose.Schema(
  {
    ip: {
      type: String,
      default: 'unknown',
      trim: true,
    },
    userAgent: {
      type: String,
      default: '',
    },
    browser: {
      type: String,
      default: 'Unknown',
    },
    os: {
      type: String,
      default: 'Unknown',
    },
    device: {
      type: String,
      enum: ['Mobile', 'Tablet', 'Desktop'],
      default: 'Desktop',
    },
    page: {
      type: String,
      default: '/',
    },
    referrer: {
      type: String,
      default: 'Direct',
    },
    country: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Fast lookups for stats (recent visits, per-ip grouping)
visitSchema.index({ createdAt: -1 });
visitSchema.index({ ip: 1 });

export default mongoose.model('Visit', visitSchema);
