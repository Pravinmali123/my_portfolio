import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

/**
 * Resizes + compresses an uploaded image IN PLACE (same path, same file
 * extension) so full-size phone-camera photos (often 3-8MB) aren't served
 * to every visitor at original size. Runs after multer has already saved
 * the file to disk.
 *
 * - Auto-orients using EXIF data (fixes sideways phone photos).
 * - Downscales to `maxWidth` only if the original is larger
 *   (withoutEnlargement — never upsizes a small image).
 * - Re-compresses at `quality` using the same format as the upload
 *   (jpeg/png/webp), so nothing else in the app needs to change (URLs,
 *   stored filenames, and extensions all stay identical).
 *
 * Best-effort: if anything goes wrong (corrupt file, unsupported format,
 * sharp not available on this platform), the original upload is left
 * untouched rather than failing the whole request — image optimization
 * should never be the reason an admin can't upload something.
 */
export const optimizeImageFile = async (filePath, { maxWidth = 1600, quality = 80 } = {}) => {
  const tmpPath = `${filePath}.tmp`;
  try {
    const ext = path.extname(filePath).toLowerCase();
    let pipeline = sharp(filePath).rotate().resize({ width: maxWidth, withoutEnlargement: true });

    if (ext === '.png') {
      pipeline = pipeline.png({ quality, compressionLevel: 8 });
    } else if (ext === '.webp') {
      pipeline = pipeline.webp({ quality });
    } else {
      // .jpg / .jpeg and anything else falls back to JPEG output
      pipeline = pipeline.jpeg({ quality, mozjpeg: true });
    }

    await pipeline.toFile(tmpPath);
    await fs.promises.rename(tmpPath, filePath);
  } catch (error) {
    // Clean up a partial temp file if the pipeline failed mid-way.
    await fs.promises.unlink(tmpPath).catch(() => {});
    console.error('Image optimization skipped:', error.message);
  }
};