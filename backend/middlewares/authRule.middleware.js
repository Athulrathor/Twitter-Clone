export const authRules = (req, res, next) => {
  const userAgent = req.headers["user-agent"] || "";
  const device = req.deviceInfo;

  const isChrome = userAgent.includes("Chrome") && !userAgent.includes("Edg");
  const isEdge = userAgent.includes("Edg");

  let blocked = false;
  let blockedReason = "";

  if (device.deviceType === "mobile") {
    const hour = new Date().getHours();

    if (hour < 10 || hour >= 13) {

      blocked = true;
      blockedReason = "Mobile login allowed only between 10 AM and 1 PM.";
      return res.status(200).json({
        message: "Mobile access allowed only between 10 AM - 1 PM",
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
