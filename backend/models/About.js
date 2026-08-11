import mongoose from 'mongoose';

const aboutSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: 'Pravin Mali',
    },
    title: {
      type: String,
      default: 'About Me',
    },
    subtitle: {
      type: String,
      default: 'Full Stack Developer',
    },
    titles: [
      {
        type: String,
      },
    ],
    portfolioUrl: {
      type: String,
      default: null,
    },
    resumeFile: {
      type: String,
      default: null,
    },
    summary: {
      type: String,
      required: [true, 'Please provide a summary'],
    },
    fullDescription: {
      type: String,
      default: null,
    },
    profileImage: {
      type: String,
      default: null,
    },
    yearsExperience: {
      type: Number,
      default: 1,
    },
    projectsCompleted: {
      type: Number,
      default: 5,
    },
    technologiesLearned: {
      type: Number,
      default: 10,
    },
    strengths: [
      {
        type: String,
      },
    ],
    languages: [
      {
        name: String,
        flag: String,
        level: String,
      },
    ],
    education: [
      {
        period: String,
        title: String,
        institution: String,
        description: String,
      },
    ],
    location: {
      city: { type: String, default: 'Surat' },
      state: { type: String, default: 'Gujarat' },
      country: { type: String, default: 'India' },
    },
contactInfo: {
      email: { type: String, default: null },
      phone: { type: String, default: null },
        whatsapp: { type: String, default: null },
      linkedin: { type: String, default: null },
      github: { type: String, default: null },
    },
    // Admin-controlled toggle for the "GitHub Activity" section (stats /
    // streak / contribution graph) on the public portfolio. Off by default.
    showGithubActivity: {
      type: Boolean,
      default: false,
    },
    statCardType: {
      type: String,
      enum: ['years', 'skills'],
      default: 'years',
    },
    statCardValue: {
      type: Number,
      default: null,
    },
    showSkillPercentage: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
  //   title: {
  //     type: String,
  //     default: 'About Me',
  //   },
  //   subtitle: {
  //     type: String,
  //     default: 'Full Stack Developer',
  //   },
  //   summary: {
  //     type: String,
  //     required: [true, 'Please provide a summary'],
  //   },
  //   fullDescription: {
  //     type: String,
  //     default: null,
  //   },
  //   profileImage: {
  //     type: String,
  //     default: null,
  //   },
  //   yearsExperience: {
  //     type: Number,
  //     default: 1,
  //   },
  //   projectsCompleted: {
  //     type: Number,
  //     default: 5,
  //   },
  //   technologiesLearned: {
  //     type: Number,
  //     default: 10,
  //   },
  //   strengths: [
  //     {
  //       type: String,
  //     },
  //   ],
  //   languages: [
  //     {
  //       name: String,
  //       flag: String,
  //       level: String,
  //     },
  //   ],
  //   location: {
  //     city: { type: String, default: 'Surat' },
  //     state: { type: String, default: 'Gujarat' },
  //     country: { type: String, default: 'India' },
  //   },
  //   contactInfo: {
  //     email: { type: String, default: null },
  //     phone: { type: String, default: null },
  //     linkedin: { type: String, default: null },
  //     github: { type: String, default: null },
  //   },
  // },
  // { timestamps: true }
);
export default mongoose.model('About', aboutSchema);