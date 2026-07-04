import Session from "../models/session.js";

export default async function verifyAudioPermission(req, res, next) {
  try {
    const session = await Session.findOne({
      firebaseUid: req.user.uid,
      isCurrent: true,
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Session not found.",
      });
    }

    if (!session.audioUploadVerified) {
      return res.status(403).json({
        success: false,
        message: "Verify OTP before uploading audio.",
      });
    }

    if (
      !session.audioUploadExpiresAt ||
      session.audioUploadExpiresAt < new Date()
    ) {
      return res.status(403).json({
        success: false,
        message: "Audio upload authorization expired.",
      });
    }

    req.session = session;

    next();
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Authorization failed.",
    });
  }
}
