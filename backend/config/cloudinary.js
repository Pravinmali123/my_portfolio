import { v2 as cloudinary } from 'cloudinary';

// All uploaded files (project images/videos, profile photo, certification
// images, resumes) are stored on Cloudinary instead of the server's local
// disk. This is what makes them survive redeploys/restarts on Vercel,
// Render, Railway, etc. — a serverless/ephemeral filesystem wipes anything
// written to local disk the moment the instance restarts, but Cloudinary
// is a separate, persistent storage service.
//
// Set these three values in your backend's environment variables (both in
// your local .env AND in your hosting provider's dashboard — .env files
// are not deployed):
//   CLOUDINARY_CLOUD_NAME
//   CLOUDINARY_API_KEY
//   CLOUDINARY_API_SECRET
// Get them for free at https://cloudinary.com/users/register/free — after
// signing up they're shown right on your Cloudinary dashboard homepage.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;