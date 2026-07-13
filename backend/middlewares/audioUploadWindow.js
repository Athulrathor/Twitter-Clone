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
    req.uploadAudioWindow = {
      success: false,
      message:
        "Audio uploads are available only between 2:00 PM and 7:00 PM IST.",
    };
  } else {
    req.uploadAudioWindow = {
      success: true,
      message: "You can upload audio!",
    };
  }

  next();
}
