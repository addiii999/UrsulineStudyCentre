import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ursuline Study Centre | Premium Girls Coaching in Ranchi",
  description:
    "Ursuline Study Centre — Premium girls-only coaching institute in Ranchi for Classes 9–12, JEE, NEET & Board preparation (JAC & CBSE). Under the visionary guidance of Sr. Dr. Mary Grace.",
  keywords:
    "ursuline study centre, girls coaching ranchi, jee neet coaching ranchi, jac cbse coaching, ursuline convent ranchi",
  openGraph: {
    title: "Ursuline Study Centre | Premium Girls Coaching in Ranchi",
    description:
      "Premium girls-only coaching in Ranchi. JAC & CBSE, JEE, NEET. Empowering Girls. Building Futures.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfairDisplay.variable} ${inter.variable}`}>
      <body>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: "var(--font-sans)",
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
