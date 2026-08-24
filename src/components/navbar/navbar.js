"use client";

import Image from "next/image";
import styles from "./navbar.module.css";
import Button from "@/components/button/button";
import ThemeToggle from "./theme-toggler";
import LanguageToggle from "./language-toggle";
import React from "react";
import AnimatedLink from "@/components/animated-link/animated-link";
import { GalleryVerticalEnd } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = React.useState(false);
    const animationDelay = 300;
    const pathname = usePathname();
    const t = useTranslations("navigation");
    
    React.useEffect(() => {
        window.dispatchEvent(new CustomEvent("mobile-menu-visibility", {
            detail: { isMenuOpen: menuOpen }
        }));
    }, [menuOpen]);

    const reopenHomeSlider = React.useCallback(() => {
        if (pathname !== "/") return;
        window.dispatchEvent(new CustomEvent("home-slider-reopen"));
    }, [pathname]);

    const handleSliderButtonClick = React.useCallback(() => {
        reopenHomeSlider();
    }, [reopenHomeSlider]);

    const handleHomeClick = React.useCallback(() => {
        reopenHomeSlider();
    }, [reopenHomeSlider]);

    return (
        <>
            <nav className={`${styles.navbar} onlyDesktop`}>
                <div className={styles.buttons}>
                    <Button
                        className={styles.icon}
                        animation={false}
                        onClick={handleSliderButtonClick}
                        href={pathname === "/" ? "" : "/"}
                    >
                        <GalleryVerticalEnd size={17} />
                    </Button>
                    <Button
                        onClick={handleHomeClick}
                        href={pathname === "/" ? "" : "/"}
                    >
                        {t("home")}
                    </Button>
                    <Button href="/about">{t("about")}</Button>
                    <Button href="/projects">{t("projects")}</Button>
                </div>
                <AnimatedLink href="/" onClick={handleHomeClick} className={styles.logoWrapper}>
                    <Image
                        src="/images/logo/logo-dark.png"
                        alt="Kremisi logo"
                        width={172}
                        height={31}
                        className={styles.logo}
                        priority={true}
                    />
                </AnimatedLink>
                <div className={`${styles.buttons} ${styles.right}`}>
                    <Button href="/contacts">{t("contacts")}</Button>
                    <ThemeToggle styles={styles} />
                    <LanguageToggle styles={styles} />
                </div>
            </nav>

            <nav
                className={`${styles.navbar} onlyMobile ${
                    menuOpen ? styles.open : ""
                }`}
            >
                <div className={`${styles.buttons} ${styles.themeToggle}`}>
                    <ThemeToggle styles={styles} />
                    <LanguageToggle styles={styles} />
                </div>
                <AnimatedLink
                    href="/"
                    className={styles.logoWrapper}
                    onClick={() => {
                        setMenuOpen(false);
                        handleHomeClick();
                    }}
                >
                    <Image
                        src="/images/logo/icona-dark.png"
                        alt="Kremisi logo"
                        width={40}
                        height={40}
                        className={styles.logo}
                        priority={true}
                    />
                </AnimatedLink>
                <div
                    className={`${styles.buttons} ${styles.right}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    <button className={styles.menuIcon}>
                        <div className={styles.bar}></div>
                        <div className={styles.bar}></div>
                    </button>
                </div>
            </nav>
            <div
                className={`${styles.mobileMenu} onlyMobileFlex ${
                    menuOpen ? styles.open : ""
                }`}
            >
                <ul>
                    <li>
                        <Link
                            href="/"
                            onClick={() =>
                                setTimeout(
                                    () => setMenuOpen(false),
                                    animationDelay
                                )
                            }
                        >
                            {t("home")}
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/projects"
                            onClick={() =>
                                setTimeout(
                                    () => setMenuOpen(false),
                                    animationDelay
                                )
                            }
                        >
                            {t("projects")}
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/about"
                            onClick={() =>
                                setTimeout(
                                    () => setMenuOpen(false),
                                    animationDelay
                                )
                            }
                        >
                            {t("about")}
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/contacts"
                            onClick={() =>
                                setTimeout(
                                    () => setMenuOpen(false),
                                    animationDelay
                                )
                            }
                        >
                            {t("contacts")}
                        </Link>
                    </li>
                </ul>
            </div>
        </>
    );
}
