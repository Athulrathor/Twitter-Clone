
export const getLocation = async (ip) => {
  try {
    // remove local IP cases
    if (!ip || ip === "unknown" || ip === "::1") {
      return null;
    }

    const res = await fetch(`https://ipapi.co/${ip}/json/`);

    return {
      country: res.data?.country_name,
      region: res.data?.region,
      city: res.data?.city,
      latitude: res.data?.latitude,
      longitude: res.data?.longitude,
      timezone: res.data?.timezone,
    };
  } catch (error) {
    console.log("Location fetch failed:", error.message);
    return null;
  }
};