
const SW_VERSION = "kaazbazar-pwa-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();

      await Promise.all(
        cacheNames
          .filter((name) => name.startsWith("kaazbazar-pwa-"))
          .map((name) => caches.delete(name))
      );

      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;
  if (request.mode !== "navigate") return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  event.respondWith(
    (async () => {
      try {
        // Always retrieve the latest page.
        // Never cache authenticated HTML.
        return await fetch(request);
      } catch (error) {
        return new Response(
          `<!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport"
                content="width=device-width, initial-scale=1" />
              <title>KaazBazar - Offline</title>
              <style>
                body {
                  font-family: system-ui, sans-serif;
                  text-align: center;
                  padding: 60px 20px;
                  color: #111827;
                }
                button {
                  background: #0f766e;
                  color: white;
                  padding: 12px 24px;
                  border: 0;
                  border-radius: 8px;
                  cursor: pointer;
                }
              </style>
            </head>
            <body>
              <h2>KaazBazar</h2>
              <p>You are currently offline.</p>
              <p>Connect to the internet and try again.</p>
              <button onclick="location.reload()">
                Try Again
              </button>
            </body>
          </html>`,
          {
            status: 503,
            headers: {
              "Content-Type": "text/html; charset=utf-8",
              "Cache-Control": "no-store",
            },
          }
        );
      }
    })()
  );
});
