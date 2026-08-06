import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
    },
email: {
  type: String,
  required: [true, 'Please provide your email'],
  lowercase: true,
  match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
},
phone: {                    
  type: String,
  default: '',
  trim: true,
},
    subject: {
      type: String,
      required: [true, 'Please provide a subject'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Please provide a message'],
    },
    status: {
      type: String,
      enum: ['new', 'read', 'replied', 'archived'],
      default: 'new',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    reply: {
      type: String,
      default: null,
    },
    replyDate: {
      type: Date,
      default: null,
    },
    attachments: [
      {
        filename: String,
        url: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Message', messageSchema);
