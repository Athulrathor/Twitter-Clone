export const authRules = (req, res, next) => {
  const userAgent = req.headers["user-agent"] || "";
  const device = req.deviceInfo;

  const isChrome = userAgent.includes("Chrome") && !userAgent.includes("Edg");
  const isEdge = userAgent.includes("Edg");

  let blocked = false;
  let blockedReason = "";
      
if (device.deviceType === "mobile") {
  const indiaTime = new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    })
  );

  const hour = indiaTime.getHours();

  if (hour < 10 || hour >= 13) {
    blocked = true;
    blockedReason =
      "Mobile login is allowed only between 10:00 AM and 1:00 PM IST.";

      console.log("login_blocked");

    return res.status(403).json({
      success: false,
      code: "LOGIN_BLOCKED",
      timestamp: Date.now(),
      message: blockedReason,
    });
  }
}

  req.securityFlags = {
    requiresStepUp: isChrome,
    trusted: isEdge,
    blocked,
    blockedReason,
  };

  next();
};
