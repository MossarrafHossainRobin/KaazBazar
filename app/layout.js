// app/layout.js
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import ClientProviders from "@/components/ClientProviders";
import "./globals.css";

export const metadata = {
  title: "Kaazbazar - Local Service Marketplace ",
  description: "Connect with local service providers in your area",
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <head>
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />

        {/* ✅ JSON-LD Schema (Organization) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "KaazBazar",
              "url": "https://kaazbazar.com",
              "logo": "https://kaazbazar.com/favicon.ico"
            }),
          }}
        />
      </head>

      <body className="antialiased">
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
