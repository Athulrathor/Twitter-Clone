
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBMokJKUh-U_uXwYqDUd6zT8CTYztB5X8U",
  authDomain: "twitter-a638f.firebaseapp.com",
  projectId: "twitter-a638f",
  storageBucket: "twitter-a638f.firebasestorage.app",
  messagingSenderId: "640784774910",
  appId: "1:640784774910:web:3e529389bf421c5b0357af",
  measurementId: "G-KB333GWK6T"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
