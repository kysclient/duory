"use client";

import { useEffect } from "react";

export function RegisterServiceWorker() {
  useEffect(() => {
    // 개발 모드에서는 Service Worker 비활성화
    if (process.env.NODE_ENV === "development") {
      // 기존 Service Worker 제거
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => {
            registration.unregister();
            console.log("🗑️ Service Worker unregistered (dev mode)");
          });
        });
      }
      return;
    }

    // 프로덕션에서만 Service Worker 등록
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        })
        .then((registration) => {
          console.log("✅ Service Worker registered:", registration.scope);

          // 업데이트 확인
          registration.update();
        })
        .catch((error) => {
          console.error("❌ Service Worker registration failed:", error);
        });
    }
  }, []);

  return null;
}
