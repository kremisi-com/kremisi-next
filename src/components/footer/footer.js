"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { MessageCircleMore } from "lucide-react";
import toast from "react-hot-toast";
import styles from "./footer.module.css";

const CONTACT_EMAIL = "info@kremisi.com";
const CONTACT_EMAIL_HREF = `mailto:${CONTACT_EMAIL}`;

export default function Footer() {
    const pathname = usePathname();
    const t = useTranslations("footer");
    const [isHomeSliderActive, setIsHomeSliderActive] = useState(pathname === "/");

    async function handleEmailClick(event) {
        event.preventDefault();

        try {
            await navigator.clipboard.writeText(CONTACT_EMAIL);
            toast.success(t("copied"));
        } catch {
            toast.error(t("copyFailed"));
            window.location.href = CONTACT_EMAIL_HREF;
        }
    }

    useEffect(() => {
        if (pathname !== "/") {
            setIsHomeSliderActive(false);
            return;
        }

        setIsHomeSliderActive(true);

        function handleSliderVisibility(event) {
            setIsHomeSliderActive(Boolean(event.detail?.isSliderActive));
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
                    <a href={CONTACT_EMAIL_HREF} onClick={handleEmailClick}>
                        {CONTACT_EMAIL}
                    </a>
                </address>
                <span className={styles.info}></span>
                <span
                    className={`${styles.info} ${styles.vatInfo} ${
                        isHomeSliderActive ? styles.vatHidden : ""
                    }`}
                    aria-hidden={isHomeSliderActive}
                >
                    VAT IT03894640121 - © 2022{" "}
                    <span className="color-primary">Kremisi</span>
                </span>
            </footer>
            <footer className={`${styles.footer} onlyMobile`}>
                <address className={styles.info}>
                    <a href={CONTACT_EMAIL_HREF} onClick={handleEmailClick}>
                        {CONTACT_EMAIL}
                    </a>
                </address>
                <div className={`${styles.buttons} ${styles.right} whatsapp-floating-button`}>
                    <a
                        className={`${styles.whatsappButton} ${
                            isHomeSliderActive ? styles.whatsappHidden : ""
                        }`}
                        href={`https://wa.me/393517444749?text=${encodeURIComponent(t("whatsapp"))}`}
                        target="_blank"
                    >
                        <MessageCircleMore />
                    </a>
                </div>
            </footer>
        </>
    );
}
