import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Kaazbazar",
  description: "Find Skilled Workers Fast | Kaazbazar",
};

// ...
export default function RootLayout({ children }) {
  return (
    // This prop tells React to ignore attribute differences during hydration for the <html> tag.
    <html lang="en" suppressHydrationWarning> 
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        // And here for the <body> tag.
        suppressHydrationWarning 
      >
        {children}
      </body>
    </html>
  );
}
