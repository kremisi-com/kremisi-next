import { Geist, Geist_Mono } from "next/font/google";
import styles from "./layout.module.css";
import "./fonts.css";
import "./globals.css";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import CursorTrailCanvas from "@/components/CursorTrailCanvas";
import { ThemeProvider } from "next-themes";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";

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

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({ children, params }) {
    const { locale } = await params;

    if (!hasLocale(routing.locales, locale)) notFound();
    return (
        <html suppressHydrationWarning>
            <body className={`${geistSans.variable} ${geistMono.variable}`}>
                <CursorTrailCanvas />
                <NextIntlClientProvider>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="dark"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <Navbar />
                        {children}
                        <Footer />
                    </ThemeProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
