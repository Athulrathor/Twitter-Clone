import jwt from "jsonwebtoken";

export const signAccessToken = async (id, email) => {
  return await jwt.sign(
    {
      id: id,
      email
    },
    { algorithm: "RS256" },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY },
  );
};

export const signRefreshToken = async (id, email,) => {
  return await jwt.sign(
    {
      id: id,
      email
    },
    { algorithm: "RS256" },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY },
  );
};

export const verifyAccessToken = async (token) => {
  try {
    const decoded = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    return decoded;
  } catch (err) {
    console.error("JWT Verification failed:", err.message);
    if (err.name === "TokenExpiredError") {
      return {
        name: "TokenExpiredError",
        message: "jwt expired",
        expiredAt: 1408621000,
      };
    }

    if (err.name === "TokenExpiredError") {
      return {
        name: "JsonWebTokenError",
        message: "jwt malformed",
      };
    }
    return {
      name: "JsonWebTokenError",
      message: "Jwt Error",
    };
  }
};

export const verifyRefreshToken = async (token) => {
  try {
    const decoded = await jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    return decoded;
  } catch (err) {
    console.error("JWT Verification failed:", err.message);
    if (err.name === "TokenExpiredError") {
      return {
        name: "TokenExpiredError",
        message: "jwt expired",
        expiredAt: 1408621000,
      };
    }

    if (err.name === "TokenExpiredError") {
      return {
        name: "JsonWebTokenError",
        message: "jwt malformed",
      };
    }
    return {
      name: "JsonWebTokenError",
      message: "Jwt Error",
    };
  }
};
