
export default function manifest() {
  return {
    id: "/",
    name: "KaazBazar",
    short_name: "KaazBazar",
    description:
      "KaazBazar - Your Trusted Local Service Marketplace",

    start_url: "/",
    scope: "/",

    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0f766e",

    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
