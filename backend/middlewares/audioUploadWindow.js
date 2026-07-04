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

  const startMinutes = 14 * 60; // 2:00 PM
  const endMinutes = 19 * 60;   // 7:00 PM

  if (currentMinutes < startMinutes || currentMinutes >= endMinutes) {
    return res.status(403).json({
      success: false,
      message:
        "Audio uploads are allowed only between 2:00 PM and 7:00 PM IST.",
    });
  }

  next();
}