"use client";

import Image from "next/image";
import styles from "./navbar.module.css";
import Button from "@/components/button/button";
import Link from "next/link";
import ThemeToggle from "./theme-toggler";
import React from "react";
import AnimatedLink from "@/components/animated-link/animated-link";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = React.useState(false);

    return (
        <>
            <nav className={`${styles.navbar} onlyDesktop`}>
                <div className={styles.buttons}>
                    <Button href="/">Home</Button>
                    <Button href="/about">About</Button>
                    <Button href="/projects">Projects</Button>
                </div>
                <AnimatedLink href="/">
                    <Image
                        src="/images/logo/logo-dark.png"
                        alt="Logo"
                        width={172}
                        height={31}
                        className={styles.logo}
                        priority={true}
                    />
                </AnimatedLink>
                <div className={`${styles.buttons} ${styles.right}`}>
                    <Button href="/contacts">Contacts</Button>
                    <ThemeToggle styles={styles} />
                </div>
            </nav>

            <nav
                className={`${styles.navbar} onlyMobile ${
                    menuOpen ? styles.open : ""
                }`}
            >
                <div className={`${styles.buttons} ${styles.themeToggle}`}>
                    <ThemeToggle styles={styles} />
                </div>
                <AnimatedLink href="/" onClick={() => setMenuOpen(false)}>
                    <Image
                        src="/images/logo/icona-dark.png"
                        alt="Logo"
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
                        <AnimatedLink
                            href="/"
                            onClick={() => setMenuOpen(false)}
                        >
                            Home
                        </AnimatedLink>
                    </li>
                    <li>
                        <AnimatedLink
                            href="/projects"
                            onClick={() => setMenuOpen(false)}
                        >
                            Projects
                        </AnimatedLink>
                    </li>
                    <li>
                        <AnimatedLink
                            href="/about"
                            onClick={() => setMenuOpen(false)}
                        >
                            About
                        </AnimatedLink>
                    </li>
                    <li>
                        <AnimatedLink
                            href="/contacts"
                            onClick={() => setMenuOpen(false)}
                        >
                            Contacts
                        </AnimatedLink>
                    </li>
                </ul>
            </div>
        </>
    );
}
