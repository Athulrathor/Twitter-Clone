import admin from "firebase-admin";
import fireAuth from "../libs/firebaseAdmin.js";

export const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const loginMethod = req.body;

    console.log(loginMethod);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = await fireAuth.verifyIdToken(token);

    req.user = decoded;
    req.loginMethod = loginMethod;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid Firebase token" });
  }
};