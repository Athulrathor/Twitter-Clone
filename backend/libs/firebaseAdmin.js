import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import serviceAccount from "../twitter-a638f-firebase-adminsdk-fbsvc-2335018a9d.json" with { type: "json" };

const firebaseApp = initializeApp({
  credential: cert(serviceAccount),
});

export const fireAuth = getAuth(firebaseApp);