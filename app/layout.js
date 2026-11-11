
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import ClientProviders from "@/components/ClientProviders";
import PWARegister from "@/components/PWARegister";
import "./globals.css";

// ==========================================
// KAAZBAZAR - APP CONFIGURATION
// ==========================================

const SITE_URL = "https://kaazbazar.com";
const APP_NAME = "KaazBazar";
const APP_DESCRIPTION =
  "KaazBazar - Find trusted local service providers, book services, and manage your orders easily.";

// ==========================================
// SEO + PWA + ANDROID + IOS METADATA
// ==========================================

export const metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "KaazBazar",
    template: "%s | KaazBazar",
  },

  applicationName: APP_NAME,

  description: APP_DESCRIPTION,

  keywords: [
    "KaazBazar",
    "Kaaz Bazar",
    "Local Services",
    "Service Marketplace",
    "Home Services",
    "Service Providers",
    "Bangladesh",
    "Online Service Booking",
  ],

  // PWA Manifest
  manifest: "/manifest.webmanifest",

  // Application Icons
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
      },
      {
        url: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],

    shortcut: "/favicon.ico",

    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },

  // Apple iOS PWA Support
  appleWebApp: {
    capable: true,
    title: APP_NAME,
    statusBarStyle: "default",
  },

  // Android App Identification
  other: {
    "mobile-web-app-capable": "yes",
  },

  // Search Engine Configuration
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Canonical URL
  alternates: {
    canonical: SITE_URL,
  },

  // Open Graph
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: APP_NAME,
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "KaazBazar Logo",
      },
    ],
  },

  // Twitter / X Sharing
  twitter: {
    card: "summary",
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: ["/icon-512.png"],
  },

  // Auto Detection
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },

  category: "business",
};

// ==========================================
// MOBILE VIEWPORT CONFIGURATION
// ==========================================

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    {
      media: "(prefers-color-scheme: light)",
      color: "#0f766e",
    },
    {
      media: "(prefers-color-scheme: dark)",
      color: "#0f766e",
    },
  ],
};

// ==========================================
// STRUCTURED DATA - ORGANIZATION
// ==========================================

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: APP_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/icon-512.png`,
  description: APP_DESCRIPTION,
};

// ==========================================
// STRUCTURED DATA - WEBSITE
// ==========================================

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: APP_NAME,
  url: SITE_URL,
  description: APP_DESCRIPTION,
  inLanguage: ["bn", "en"],
};

// ==========================================
// ROOT LAYOUT
// ==========================================

export default function RootLayout({ children }) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <head>
        {/* Organization Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              organizationSchema
            ).replace(/</g, "\\u003c"),
          }}
        />

        {/* Website Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              websiteSchema
            ).replace(/</g, "\\u003c"),
          }}
        />
      </head>

      <body className="antialiased">
        {/* PWA Service Worker Registration */}
        <PWARegister />

        {/* Language Provider */}
        <LanguageProvider>

          {/* Firebase Authentication */}
          <AuthProvider>

            {/* Admin Authentication */}
            <AdminAuthProvider>

              {/* Existing Client Providers */}
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
