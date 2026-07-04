import { UAParser } from "ua-parser-js";

export const getDeviceInfo = (req) => {
  const parser = new UAParser(req.headers["user-agent"]);

  const uaResult = parser.getResult();

  // Browser
  const browser = uaResult.browser.name || "unknown";

  // Operating System
  const os = uaResult.os.name || "unknown";

  // Device
  const deviceType = uaResult.device.type || "desktop";
  const vendor = uaResult.device.vendor || "";
  const model = uaResult.device.model || "";

  // Human-readable device name
  let deviceName = "Unknown Device";

  if (deviceType === "desktop") {
    deviceName = `${os} PC`;
  } else if (vendor || model) {
    deviceName = `${vendor} ${model}`.trim();
  } else {
    deviceName = `${os} ${deviceType}`;
  }

  // IP Address
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket?.remoteAddress ||
    "unknown";

  return {
    ipAddress: ip,
    browser,
    os,
    deviceType,
    deviceName,
  };
};