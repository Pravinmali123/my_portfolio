export const DEFAULT_ABOUT = {
  name: 'Pravin Mali',
  title: 'Full Stack Developer',
  summary:
    "I'm Pravin Mali, a passionate Full Stack Developer specializing in the MERN stack. I build clean, performant and responsive web applications.",
  yearsExperience: 1,
  projectsCompleted: 5,
  technologiesLearned: 10,
  strengths: ['Problem-solving', 'Fast learner', 'Strong UI sense', 'Clean Code', 'Team Collaboration', 'Consistent Practice', 'Analytical thinking'],
  languages: [
    { name: 'Hindi', flag: '🇮🇳', level: 'Fluent' },
    { name: 'Gujarati', flag: '🇮🇳', level: 'Fluent' },
    { name: 'English', flag: '🇬🇧', level: 'Intermediate' },
  ],
  education: [
    { period: '2021', title: 'B.A. – Bachelor of Arts', institution: 'Hemchandracharya North Gujarat University — HNGU', description: '' },
    { period: 'CDMI', title: 'Full Stack Web Development', institution: 'Creative Design & Multimedia Institute', description: 'React.js, Node.js, Express.js, MongoDB, MySQL, REST APIs, JWT Auth, Git & GitHub.' },
    { period: '2021 – 2024', title: 'Government Exam Preparation', institution: 'Self Study', description: '' },
  ],
  contactInfo: {
    email: 'pravinmali24899@gmail.com',
    phone: '+91 8469561982',
    whatsapp: '+91 8469561982',
    linkedin: 'https://www.linkedin.com/in/pmali123/',
    github: 'https://github.com/pravinmali',
  },
  location: 'Surat, Gujarat, India',
titles: [
    'Full Stack Developer',
    'React.js Specialist',
    'Node.js Developer',
    'MERN Stack Expert',
    'UI/UX Enthusiast',
  ],
  showGithubActivity: false,
};

export const DEFAULT_SKILLS = [
  { id: 1, name: 'React.js', icon: '⚛️', proficiency: 88, category: 'FRONTEND' },
  { id: 2, name: 'JavaScript ES6+', icon: '🟡', proficiency: 85, category: 'FRONTEND' },
  { id: 3, name: 'HTML5', icon: '🌐', proficiency: 92, category: 'FRONTEND' },
  { id: 4, name: 'CSS3', icon: '🎨', proficiency: 90, category: 'FRONTEND' },
  { id: 5, name: 'Tailwind CSS', icon: '💨', proficiency: 85, category: 'FRONTEND' },
  { id: 6, name: 'Bootstrap', icon: '🅱️', proficiency: 88, category: 'FRONTEND' },
  { id: 7, name: 'Material UI', icon: '🔷', proficiency: 80, category: 'FRONTEND' },
  { id: 8, name: 'Node.js', icon: '🟢', proficiency: 78, category: 'BACKEND' },
  { id: 9, name: 'Express.js', icon: '🚂', proficiency: 78, category: 'BACKEND' },
  { id: 10, name: 'REST API', icon: '🔗', proficiency: 82, category: 'BACKEND' },
  { id: 11, name: 'JWT Auth', icon: '🔐', proficiency: 75, category: 'BACKEND' },
  { id: 12, name: 'C/C++', icon: '⚙️', proficiency: 60, category: 'BACKEND' },
  { id: 13, name: 'MongoDB', icon: '🍃', proficiency: 80, category: 'DATABASE' },
  { id: 14, name: 'Mongoose', icon: '📦', proficiency: 78, category: 'DATABASE' },
  { id: 15, name: 'MySQL', icon: '🐬', proficiency: 65, category: 'DATABASE' },
  { id: 16, name: 'Git & GitHub', icon: '🐙', proficiency: 85, category: 'TOOLS' },
  { id: 17, name: 'VS Code', icon: '💙', proficiency: 92, category: 'TOOLS' },
  { id: 18, name: 'Postman', icon: '📮', proficiency: 80, category: 'TOOLS' },
  { id: 19, name: 'Formik', icon: '📝', proficiency: 72, category: 'TOOLS' },
];

export const DEFAULT_PROJECTS = [
  {
    id: 1,
    category: 'FULLSTACK',
    title: 'Car Rental Website',
    description:
      'Responsive Car Rental Web App with Admin Panel. Auth system (Login/Register), REST API, reusable components.',
    details:
      'Full-featured Car Rental platform with admin dashboard. Complete Login/Register auth system, REST API for dynamic car data, JWT-secured routes, error handling and form validation.',
    technologies: ['React.js', 'Material UI', 'Node.js', 'REST API', 'JWT Auth'],
    githubUrl: 'https://github.com/pravinmali',
    liveUrl: 'https://car-rental.com',
    videoUrl: '',
    image: '',
  },
  {
    id: 2,
    category: 'FRONTEND',
    title: 'Corporate Web',
    description:
      'Professional corporate website with responsive React layout, global state management, clean folder structure.',
    details:
      'Modern corporate website with React.js and Bootstrap. Global state management via Context API, React Router navigation.',
    technologies: ['React.js', 'Bootstrap', 'Context API'],
    githubUrl: 'https://github.com/pravinmali',
    liveUrl: 'https://corporate.com',
    videoUrl: '',
    image: '',
  },
  {
    id: 3,
    category: 'FULLSTACK',
    title: 'CRUD App (React)',
    description:
      'Full CRUD app — Add, Edit, Delete with React state. Formik forms, Context API global state, live API calls.',
    details:
      'Complete CRUD application with Formik+Yup validation, Context API state, Axios for REST API. Real-time UI refresh.',
    technologies: ['React.js', 'Formik', 'Context API', 'REST API'],
    githubUrl: 'https://github.com/pravinmali',
    liveUrl: 'https://crud.com',
    videoUrl: '',
    image: '',
  },
  {
    id: 4,
    category: 'FRONTEND',
    title: 'Rick & Morty API',
    description:
      'Interactive UI consuming The Rick and Morty public API. Browse, search, and filter characters.',
    details:
      'Character browser using the Rick and Morty REST API. Real-time search, filter by status/species/origin, paginated results, Material UI.',
    technologies: ['React.js', 'Material UI', 'REST API'],
    githubUrl: 'https://github.com/pravinmali',
    liveUrl: 'https://rickmorty.com',
    videoUrl: '',
    image: '',
  },
  {
    id: 5,
    category: 'FRONTEND',
    title: 'Yummi — Food Web',
    description:
      '"Enjoy Your Healthy Delicious Food" — Beautiful food delivery UI with React JS + Bootstrap.',
    details:
      'Responsive healthy food delivery app with food menu, category filtering, cart system. Fully responsive across all devices.',
    technologies: ['React.js', 'Bootstrap', 'CSS3'],
    githubUrl: 'https://github.com/pravinmali',
    liveUrl: 'https://yummi.com',
    videoUrl: '',
    image: '',
  },
];