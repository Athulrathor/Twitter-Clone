import { getDeviceInfo } from "../libs/getDeviceInfo.js";
import { getLocation } from "../libs/getLocation.js";

export const deviceInfoMiddleware = async (req, res, next) => {
  try {
    const deviceInfo = getDeviceInfo(req);

    const location = await getLocation(deviceInfo.ipAddress);

    req.deviceInfo = {
      ...deviceInfo,
      location,
    };

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      code: "DEVICE_ERROR",
      message: "Unable to verify your device.",
    });
  }
};
