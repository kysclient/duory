"use client";

import { useFcmToken } from "@/hooks/use-fcm-token";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

export const FcmManager = () => {
  const { token } = useFcmToken();
  const { user } = useAuth();

  useEffect(() => {
    const saveToken = async () => {
      if (user?.id && token) {
        try {
          const { error } = await supabase
            .from("users")
            .update({ fcm_token: token })
            .eq("id", user.id);

          if (error) {
            console.error("Error saving FCM token:", error);
          } else {
            console.log("FCM Token saved to database");
          }
        } catch (error) {
          console.error("Failed to save FCM token:", error);
        }
      }
    };

    saveToken();
  }, [user, token]);

  return null; // Headless component
};
