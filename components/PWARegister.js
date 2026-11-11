
"use client";

import { useEffect } from "react";

export default function PWARegister() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      return;
    }

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        console.log(
          "KaazBazar PWA registered:",
          registration.scope
        );
      })
      .catch((error) => {
        console.error(
          "PWA registration failed:",
          error
        );
      });
  }, []);

  return null;
}
