export default function audioUploadWindow(req, res, next) {

  const now = new Date();

  const formatter = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });

  const parts = formatter.formatToParts(now);

  const hour = Number(parts.find((p) => p.type === "hour").value);
  const minute = Number(parts.find((p) => p.type === "minute").value);

  const currentMinutes = hour * 60 + minute;

  // 2:00 PM
  const startMinutes = 14 * 60;

  // 7:00 PM
  const endMinutes = 19 * 60;

  if (currentMinutes < startMinutes || currentMinutes >= endMinutes) {
    return res.status(403).json({
      success: false,
      code: "AUDIO_UPLOAD_WINDOW_CLOSED",
      timestamp: Date.now(),
      message:
        "Audio uploads are available only between 2:00 PM and 7:00 PM IST.",
      allowedWindow: {
        start: "2:00 PM IST",
        end: "7:00 PM IST",
      },
    });
  }

  next();
}