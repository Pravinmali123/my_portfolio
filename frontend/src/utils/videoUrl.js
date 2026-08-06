// A project's videoUrl is either a YouTube/embed link (typed in by the admin)
// or a path to a video file that was uploaded and stored on the server
// (e.g. "/uploads/projects/videos/project-video-123.mp4"). This tells the two
// apart so the UI knows whether to render an <iframe> or a native <video>.
export const isHostedVideoFile = (value) => {
  if (!value) return false;
  if (value.includes('youtube.com') || value.includes('youtu.be')) return false;
  if (value.startsWith('/uploads/')) return true;
  return /\.(mp4|webm|mov|ogg)$/i.test(value.split('?')[0]);
};