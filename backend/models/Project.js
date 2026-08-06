import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide project title'],
    },
    description: {
      type: String,
      required: [true, 'Please provide project description'],
    },
    image: {
      type: String,
      default: null,
    },
    category: {
      type: String,
      enum: ['FULLSTACK', 'FRONTEND', 'BACKEND', 'AI', 'ALL'],
      default: 'FULLSTACK',
    },
    technologies: [
      {
        type: String,
      },
    ],
    features: [
      {
        type: String,
      },
    ],
    githubUrl: {
      type: String,
      default: null,
    },
    liveUrl: {
      type: String,
      default: null,
    },
    videoUrl: {
      type: String,
      default: null,
    },
    details: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['completed', 'in-progress', 'archived'],
      default: 'completed',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Project', projectSchema);