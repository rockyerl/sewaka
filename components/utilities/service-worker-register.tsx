"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      // Register service worker
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          console.log("Sewaka SW registered:", registration.scope);

          // Check for updates every 60 seconds
          const updateInterval = setInterval(() => {
            registration.update();
          }, 60000);

          // Handle updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  console.log("Sewaka SW: Update available, reload to get new version");
                }
              });
            }
          });

          // Handle online/offline status
          const handleOnline = () => {
            console.log("Sewaka: Back online");
          };

          const handleOffline = () => {
            console.log("Sewaka: Offline mode");
          };

          window.addEventListener("online", handleOnline);
          window.addEventListener("offline", handleOffline);

          return () => {
            clearInterval(updateInterval);
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
          };
        })
        .catch((error) => {
          console.error("Sewaka SW registration failed:", error);
        });
    }
  }, []);

  return null;
}
