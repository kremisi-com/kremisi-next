import { Geist, Geist_Mono } from "next/font/google";
import "./fonts.css";
import "./globals.css";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import CursorTrailCanvas from "@/components/cursor-trail-canvas";
import { ThemeProvider } from "next-themes";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: "Kremisi - Web Design & Development",
    description: "Expand your digital presence with Kremisi",
};

export default async function RootLayout({ children }) {
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
                    <Navbar />
                    {children}
                    <Footer />
                    <Toaster position="bottom-center" reverseOrder={false} />
                </ThemeProvider>
            </body>
        </html>
    );
}
