
"use client";

import { useEffect } from "react";

export default function PWARegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      return;
    }

    const registerWorker = async () => {
      try {
        const registration =
          await navigator.serviceWorker.register("/sw.js", {
            scope: "/",
            updateViaCache: "none",
          });

        console.log(
          "KaazBazar PWA registered:",
          registration.scope
        );
      } catch (error) {
        console.error(
          "KaazBazar PWA registration failed:",
          error
        );
      }
    };

    registerWorker();
  }, []);

  return null;
}
