import { Geist, Geist_Mono } from "next/font/google";
import "./fonts.css";
import "./globals.css";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import CursorTrailCanvas from "@/components/cursor-trail-canvas";
import { ThemeProvider } from "next-themes";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "react-hot-toast";
import Scripts from "@/components/scripts/scripts";
import { TransitionProvider } from "@/context/transition-context/transition-context";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@next/third-parties/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "Web Design & Development Agency in Italy",
    template: "%s | Kremisi",
  },
  description:
    "Kremisi is an Italy-based web design and web development agency building fast, scalable websites and digital products for growing businesses.",
  metadataBase: new URL("https://kremisi.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Web Design & Development Agency in Italy",
    description:
      "Kremisi is an Italy-based web design and web development agency building fast, scalable websites and digital products for growing businesses.",
    url: "/",
    siteName: "Kremisi",
    images: [
      {
        url: "/og-image.jpg",
        alt: "Kremisi preview",
      },
    ],
    locale: "it_IT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Web Design & Development Agency in Italy",
    description:
      "Kremisi is an Italy-based web design and web development agency building fast, scalable websites and digital products for growing businesses.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <CursorTrailCanvas />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <TransitionProvider>
            <Navbar />
            {children}
            <Footer />
            <Toaster position="bottom-center" reverseOrder={false} />
            <Scripts />
          </TransitionProvider>
        </ThemeProvider>

        <Analytics />
        <SpeedInsights />
        <GoogleAnalytics gaId="G-TK345YVSSJ" />
      </body>
    </html>
  );
}
