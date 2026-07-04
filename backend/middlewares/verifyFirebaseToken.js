import admin from "firebase-admin";
import fireAuth from "../libs/firebaseAdmin.js";
import Session from "../models/session.js";

export const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = await fireAuth.verifyIdToken(token);

    req.user = decoded;

    await Session.findOneAndUpdate(
      {
        firebaseUid: decoded.uid,
        status: "active",
        isCurrent: true,
      },
      {
        lastActiveAt: new Date(),
      },
      {
        sort: { createdAt: -1 },
      },
    );

    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Invalid Firebase token" });
  }
};
