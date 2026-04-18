import { LanguageProvider } from "@/context/LanguageContext";
import "./globals.css";

export const metadata = {
  title: "Kaazbazar - Local Service Marketplace",
  description: "Connect with local service providers in your area",
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <body className="antialiased">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}