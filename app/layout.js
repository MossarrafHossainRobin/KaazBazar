<<<<<<< HEAD

=======
// app/layout.js
>>>>>>> origin/main
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import ClientProviders from "@/components/ClientProviders";
<<<<<<< HEAD
import PWARegister from "@/components/PWARegister";
import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://kaazbazar.com"),
  applicationName: "KaazBazar",
  title: "KaazBazar - Local Service Marketplace",
  description: "Connect with local service providers in your area",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "KaazBazar",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      {
        url: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0f766e",
=======
import "./globals.css";

export const metadata = {
  title: "Kaazbazar - Local Service Marketplace ",
  description: "Connect with local service providers in your area",
>>>>>>> origin/main
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <head>
<<<<<<< HEAD
        <meta
          name="format-detection"
          content="telephone=no, date=no, email=no, address=no"
        />

=======
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />

        {/* ✅ JSON-LD Schema (Organization) */}
>>>>>>> origin/main
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
<<<<<<< HEAD
              name: "KaazBazar",
              url: "https://kaazbazar.com",
              logo: "https://kaazbazar.com/favicon.ico",
=======
              "name": "KaazBazar",
              "url": "https://kaazbazar.com",
              "logo": "https://kaazbazar.com/favicon.ico"
>>>>>>> origin/main
            }),
          }}
        />
      </head>

      <body className="antialiased">
<<<<<<< HEAD
        <PWARegister />

=======
>>>>>>> origin/main
        <LanguageProvider>
          <AuthProvider>
            <AdminAuthProvider>
              <ClientProviders>
                {children}
              </ClientProviders>
            </AdminAuthProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
