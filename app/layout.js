// app/layout.js
import ClientProviders from "@/components/ClientProviders";
import { AdminAuthProvider } from "@/context/AdminAuthContext";
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
        <ClientProviders>
          <AdminAuthProvider>
            {children}
          </AdminAuthProvider>
        </ClientProviders>
      </body>
    </html>
  );
}