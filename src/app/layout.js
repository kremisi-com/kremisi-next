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

const BASE_URL = "https://kremisi.com";
const ORGANIZATION_ID = `${BASE_URL}/#organization`;
const WEBSITE_ID = `${BASE_URL}/#website`;
const SERVICE_ID = `${BASE_URL}/#professional-service`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": ORGANIZATION_ID,
      name: "Kremisi",
      url: BASE_URL,
      logo: `${BASE_URL}/images/logo/logo-dark.png`,
      email: "info@kremisi.com",
      telephone: "+393517444749",
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: "info@kremisi.com",
          telephone: "+393517444749",
          availableLanguage: ["English", "Italian"],
        },
      ],
    },
    {
      "@type": "ProfessionalService",
      "@id": SERVICE_ID,
      name: "Kremisi",
      url: BASE_URL,
      image: `${BASE_URL}/og-image.jpg`,
      email: "info@kremisi.com",
      telephone: "+393517444749",
      brand: {
        "@id": ORGANIZATION_ID,
      },
      areaServed: "Worldwide",
      availableLanguage: ["English", "Italian"],
      serviceType: [
        "Web Design",
        "Web Development",
        "Design & Development",
        "Data & Analytics",
      ],
    },
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      name: "Kremisi",
      url: BASE_URL,
      inLanguage: "en",
      publisher: {
        "@id": ORGANIZATION_ID,
      },
    },
  ],
};

export const metadata = {
  title: {
    default: "Kremisi | Web Design, Development & Data Analytics Agency",
    template: "%s | Kremisi",
  },
  description:
    "Kremisi is a distributed agency building fast, scalable websites, digital products, and data & analytics solutions for SMEs and established companies worldwide.",
  metadataBase: new URL(BASE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Kremisi | Web Design, Development & Data Analytics Agency",
    description:
      "Kremisi is a distributed agency building fast, scalable websites, digital products, and data & analytics solutions for SMEs and established companies worldwide.",
    url: "/",
    siteName: "Kremisi",
    images: [
      {
        url: "/og-image.jpg",
        alt: "Kremisi preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kremisi | Web Design, Development & Data Analytics Agency",
    description:
      "Kremisi is a distributed agency building fast, scalable websites, digital products, and data & analytics solutions for SMEs and established companies worldwide.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </body>
    </html>
  );
}
