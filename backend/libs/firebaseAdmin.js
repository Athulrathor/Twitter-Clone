import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import serviceAccount from "../twitter-a638f-firebase-adminsdk-fbsvc-2335018a9d.json" with { type: "json" };

const firebaseApp = initializeApp({
  credential: cert(serviceAccount),
});

// export const fireAuth = getAuth(firebaseApp);S

// import { initializeApp, cert } from "firebase-admin/app";
// import { getAuth } from "firebase-admin/auth";

// if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
//   throw new Error("FIREBASE_SERVICE_ACCOUNT is missing");
// }

// const serviceAccount = JSON.parse(
//   process.env.FIREBASE_SERVICE_ACCOUNT
// );

// const firebaseApp = initializeApp({
//   credential: cert(serviceAccount),
// });

const fireAuth = getAuth(firebaseApp);

export default fireAuth;