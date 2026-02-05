import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";
import {
  getAnalytics,
  isSupported as isAnalyticsSupported,
} from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyC-kAVMGPQ1C--W1mtv2tpSvI8rSF6Z1eg",
  authDomain: "duory-baf79.firebaseapp.com",
  projectId: "duory-baf79",
  storageBucket: "duory-baf79.firebasestorage.app",
  messagingSenderId: "523423142845",
  appId: "1:523423142845:web:fbf9c1b8b645118d5978d4",
  measurementId: "G-54Y4M3VQMT",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Messaging
// export const messaging = async () => (await isSupported()) ? getMessaging(app) : null;
// We need to handle SSR safely.
let messaging: any = null;
let analytics: any = null;

if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      messaging = getMessaging(app);
    }
  });

  isAnalyticsSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, messaging, analytics };

export const requestForToken = async () => {
  if (typeof window === "undefined") return null;

  try {
    const supported = await isSupported();
    if (!supported) {
      console.log("Firebase Messaging not supported");
      return null;
    }

    if (!messaging) {
      messaging = getMessaging(app);
    }

    console.log("Requesting permission...");
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Notification permission not granted");
      return null;
    }

    console.log("Waiting for Service Worker...");
    const registration = await navigator.serviceWorker.ready;
    console.log("Service Worker ready:", registration);

    console.log("Fetching FCM token...");
    const currentToken = await getToken(messaging, {
      serviceWorkerRegistration: registration,
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY, // Get from .env
    });
    console.log("Token fetched:", currentToken);

    if (currentToken) {
      return currentToken;
    } else {
      console.log(
        "No registration token available. Request permission to generate one.",
      );
      return null;
    }
  } catch (err) {
    console.error("An error occurred while retrieving token: ", err);
    return null;
  }
};
