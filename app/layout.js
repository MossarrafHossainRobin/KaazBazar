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