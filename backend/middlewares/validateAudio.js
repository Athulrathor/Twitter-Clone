import { parseBuffer } from "music-metadata";

const MAX_DURATION = 5 * 60;

export default async function validateAudio(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Audio file is required.",
      });
    }

    const metadata = await parseBuffer(
      req.file.buffer,
      {
        mimeType: req.file.mimetype,
      },
      {
        duration: true,
      }
    );

    const duration = metadata.format.duration || 0;

    if (duration > MAX_DURATION) {
      return res.status(400).json({
        success: false,
        message: "Audio duration cannot exceed 5 minutes.",
      });
    }

    // Store metadata for controller use
    req.audioMetadata = {
      duration,
      size: req.file.size,
      mimeType: req.file.mimetype,
    };

    next();
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      success: false,
      message: "Unable to read audio metadata.",
    });
  }
}