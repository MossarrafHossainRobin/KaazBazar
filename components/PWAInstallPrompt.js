
"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "kaazbazar-install-dismissed";
const DISMISS_DAYS = 7;

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;

    const ios = /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" &&
        navigator.maxTouchPoints > 1);

    const mobile = /Android|iPhone|iPad|iPod/i.test(ua);

    const safari =
      ios &&
      /Safari/i.test(ua) &&
      !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);

    setIsIOS(ios);
    setIsSafari(safari);

    const isInstalled = () =>
      window.matchMedia("(display-mode: standalone)").matches ||
      navigator.standalone === true;

    if (!mobile || isInstalled()) {
      setInstalled(isInstalled());
      return;
    }

    const dismissedAt = Number(
      localStorage.getItem(DISMISS_KEY) || 0
    );

    const recentlyDismissed =
      Date.now() - dismissedAt <
      DISMISS_DAYS * 24 * 60 * 60 * 1000;

    const handleInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);

      if (!recentlyDismissed) {
        setShowPopup(true);
      }
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setShowPopup(false);
      setDeferredPrompt(null);
      localStorage.removeItem(DISMISS_KEY);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleInstallPrompt
    );

    window.addEventListener(
      "appinstalled",
      handleAppInstalled
    );

    // On iOS, show instructions after page load.
    let timer;

    if (ios && !recentlyDismissed) {
      timer = setTimeout(() => {
        setShowPopup(true);
      }, 1800);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleInstallPrompt
      );

      window.removeEventListener(
        "appinstalled",
        handleAppInstalled
      );

      clearTimeout(timer);
    };
  }, []);

  const dismissPopup = () => {
    setShowPopup(false);
    setShowInstructions(false);
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      const prompt = deferredPrompt;
      setDeferredPrompt(null);
      setShowPopup(false);

      try {
        await prompt.prompt();

        const result = await prompt.userChoice;

        if (result.outcome !== "accepted") {
          localStorage.setItem(
            DISMISS_KEY,
            String(Date.now())
          );
        }
      } catch (error) {
        console.error("KaazBazar install error:", error);
      }

      return;
    }

    // iOS requires manual Add to Home Screen.
    setShowInstructions(true);
  };

  if (!showPopup || installed) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        background: "rgba(0,0,0,0.45)",
        padding: "16px",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="kb-install-title"
        style={{
          width: "100%",
          maxWidth: "410px",
          background: "#ffffff",
          color: "#171717",
          borderRadius: "22px",
          padding: "22px",
          boxShadow: "0 12px 35px rgba(0,0,0,0.18)",
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            aria-label="Close install popup"
            onClick={dismissPopup}
            style={{
              background: "transparent",
              border: "none",
              fontSize: "24px",
              color: "#666",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ textAlign: "center" }}>
          <img
            src="/icon-192.png"
            alt="KaazBazar"
            width="84"
            height="84"
            style={{
              width: "84px",
              height: "84px",
              borderRadius: "18px",
              margin: "0 auto 14px",
              objectFit: "cover",
            }}
          />

          <h2
            id="kb-install-title"
            style={{
              fontSize: "22px",
              fontWeight: "700",
              margin: "0 0 10px",
            }}
          >
            Install KaazBazar
          </h2>

          <p
            style={{
              fontSize: "14px",
              color: "#666",
              lineHeight: 1.6,
              marginBottom: "20px",
            }}
          >
            Add KaazBazar to your home screen for
            quick access to services, bookings,
            and your dashboard.
          </p>
        </div>

        {showInstructions && (
          <div
            style={{
              background: "#fff7ed",
              border: "1px solid #fed7aa",
              borderRadius: "12px",
              padding: "14px",
              fontSize: "14px",
              lineHeight: "1.8",
              marginBottom: "16px",
            }}
          >
            {isIOS ? (
              isSafari ? (
                <>
                  <strong>Install on iPhone:</strong>
                  <p>1. Tap the Share button in Safari.</p>
                  <p>2. Select Add to Home Screen.</p>
                  <p>3. Tap Add to confirm.</p>
                </>
              ) : (
                <>
                  <strong>Install on iPhone:</strong>
                  <p>
                    Open kaazbazar.com in Safari,
                    tap Share, then Add to Home Screen.
                  </p>
                </>
              )
            ) : (
              <>
                <strong>Install on Android:</strong>
                <p>
                  Open Chrome's three-dot menu and
                  select Install app or Add to Home screen.
                </p>
              </>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={handleInstall}
          style={{
            width: "100%",
            background: "#ff6500",
            color: "#ffffff",
            border: "none",
            borderRadius: "12px",
            padding: "14px",
            fontSize: "15px",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          {showInstructions
            ? "View Install Steps"
            : isIOS
            ? "Add to Home Screen"
            : "Install App"}
        </button>

        <button
          type="button"
          onClick={dismissPopup}
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            color: "#777",
            marginTop: "14px",
            padding: "8px",
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          Not Now
        </button>
      </div>
    </div>
  );
}
