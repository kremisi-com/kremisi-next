"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircleMore } from "lucide-react";
import styles from "./footer.module.css";
import Button from "../button/button";

export default function Footer() {
    const pathname = usePathname();
    const [isVATHidden, setIsVATHidden] = useState(pathname === "/");

    useEffect(() => {
        if (pathname !== "/") {
            setIsVATHidden(false);
            return;
        }

        setIsVATHidden(true);

        function handleSliderVisibility(event) {
            setIsVATHidden(Boolean(event.detail?.isSliderActive));
        }

        window.addEventListener("home-slider-visibility", handleSliderVisibility);
        return () => {
            window.removeEventListener(
                "home-slider-visibility",
                handleSliderVisibility
            );
        };
    }, [pathname]);

    return (
        <>
            <footer className={`${styles.footer} onlyDesktop`}>
                <address className={styles.info}>
                    <a href="mailto:info@kremisi.com">info@kremisi.com</a>
                </address>
                <span className={styles.info}></span>
                <span
                    className={`${styles.info} ${styles.vatInfo} ${
                        isVATHidden ? styles.vatHidden : ""
                    }`}
                    aria-hidden={isVATHidden}
                >
                    VAT IT03894640121 - © 2022{" "}
                    <span className="color-primary">Kremisi</span>
                </span>
            </footer>
            <footer className={`${styles.footer} onlyMobile`}>
                <address className={styles.info}>
                    <a href="mailto:info@kremisi.com">info@kremisi.com</a>
                </address>
                <div className={`${styles.buttons} ${styles.right} whatsapp-floating-button`}>
                    <Button
                        className={styles.whatsappButton}
                        href="https://wa.me/393517444749?text=Can%20I%20have%20more%20informations%3F"
                        target="_blank"
                    >
                        <MessageCircleMore />
                    </Button>
                </div>
            </footer>
        </>
    );
}
