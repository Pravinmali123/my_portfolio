import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide skill name'],
    },
    category: {
      type: String,
      enum: ['FRONTEND', 'BACKEND', 'DATABASE', 'TOOLS', 'ALL'],
      required: [true, 'Please provide skill category'],
    },
    proficiency: {
      type: Number,
      min: 0,
      max: 100,
      default: 80,
    },
    icon: {
      type: String,
      default: null,
    },
    description: {
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

export default mongoose.model('Skill', skillSchema);
