import {UAParser} from "ua-parser-js";

export const getDeviceInfo = (req) => {
  const parser = new UAParser(req.headers["user-agent"]);

  const uaResult = parser.getResult();

  // Browser
  const browser = uaResult.browser.name || "unknown";

  // OS
  const os = uaResult.os.name || "unknown";

  // Device type detection
  let deviceType = "unknown";

  const deviceModel = uaResult.device.type;

  if (deviceModel === "mobile") deviceType = "mobile";
  else if (deviceModel === "tablet") deviceType = "tablet";
  else if (!deviceModel) deviceType = "desktop";

  // IP Address extraction
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket?.remoteAddress ||
    "unknown";

  return {
    ipAddress: ip,
    browser,
    os,
    deviceType,
  };
};