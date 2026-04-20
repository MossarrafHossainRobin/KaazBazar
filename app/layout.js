// app/layout.js
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import FirebaseProvider from "@/components/FirebaseProvider";
import "./globals.css";

export const metadata = {
  title: "Kaazbazar - Local Service Marketplace",
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
            <FirebaseProvider>
              {children}
            </FirebaseProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}