"use client";
import { useEffect, useState } from "react";
import { app, requestForToken, messaging } from "@/lib/firebase";
import { onMessage, MessagePayload } from "firebase/messaging";
import { toast } from "sonner"; // Assuming sonner is used based on package.json

export const useFcmToken = () => {
  const [token, setToken] = useState<string | null>(null);
  const [notificationPermissionStatus, setNotificationPermissionStatus] =
    useState<NotificationPermission>("default");

  useEffect(() => {
    const retrieveToken = async () => {
      try {
        if (typeof window !== "undefined" && "serviceWorker" in navigator) {
          // Retrieve permission status
          setNotificationPermissionStatus(Notification.permission);

          // If already granted, update token
          if (Notification.permission === "granted") {
            const token = await requestForToken();
            if (token) setToken(token);
          }
        }
      } catch (error) {
        console.error("An error occurred while retrieving token:", error);
      }
    };

    retrieveToken();
  }, []);

  // Listen for foreground messages
  useEffect(() => {
    if (typeof window !== "undefined" && messaging) {
      const unsubscribe = onMessage(messaging, (payload: MessagePayload) => {
        console.log("Foreground message received:", payload);
        const { notification } = payload;
        if (notification) {
          toast(notification.title || "New Notification", {
            description: notification.body,
            // action: {
            //     label: "View",
            //     onClick: () => console.log("Notification clicked")
            // }
          });
        }
      });
      return () => unsubscribe();
    }
  }, [token]); // Re-run if messaging initializes late

  return { token, notificationPermissionStatus, requestForToken };
};
