import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

// Single premium font — Inter with full weight range
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://ursulinstudycentre.in"
  ),
  title: {
    default: "Ursuline Study Centre | Premium Educational Institution in Ranchi",
    template: "%s | Ursuline Study Centre",
  },
  description:
    "Ursuline Study Centre - Premium educational institution in Ranchi offering Science, Commerce, and Humanities. Under the visionary guidance of Sr. Dr. Mary Grace.",
  keywords:
    "ursuline study centre, education ranchi, science commerce humanities ranchi, school education ranchi, academic excellence, ursuline convent ranchi, best educational institution ranchi",
  authors: [{ name: "Ursuline Study Centre" }],
  creator: "Academic Origin",
  openGraph: {
    title: "Ursuline Study Centre | Premium Educational Institution in Ranchi",
    description:
      "Premium educational institution in Ranchi for Science, Commerce, and Humanities. Empowering Students. Building Futures.",
    url: "https://ursulinstudycentre.in",
    siteName: "Ursuline Study Centre",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ursuline Study Centre | Premium Educational Institution in Ranchi",
    description:
      "Premium educational institution in Ranchi. Stream-wise academic excellence in Science, Commerce, and Humanities.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  verification: {
    google: "fE5LEUYc8qbxtL9wk3Y_78lZYZgtTc9-PEf2wlv-lL4",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              fontSize: "0.9rem",
            },
            success: {
              iconTheme: { primary: "#C9A84C", secondary: "#fff" },
            },
            error: {
              iconTheme: { primary: "#800000", secondary: "#fff" },
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
