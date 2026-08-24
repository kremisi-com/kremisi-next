import RevelatingText from "@/components/revelating-text/revelating-text";
import styles from "./overview.module.css";
import { useTranslations } from "next-intl";

export default function Overview({
    isVisible = true,
    textShouldAnimate,
    onFadeInComplete,
}) {
    const t = useTranslations("overview");
    function handleTransitionEnd(event) {
        if (
            !isVisible ||
            event.target !== event.currentTarget ||
            event.propertyName !== "opacity"
        ) {
            return;
        }

        onFadeInComplete?.();
    }

    return (
        <section
            className={`${styles.overview} ${isVisible ? styles.visible : styles.hidden}`}
            id="overview"
            onTransitionEnd={handleTransitionEnd}
        >
            <div className={styles.background}>
                <div className={styles.blob1}></div>
                <div className={styles.blob2}></div>
                <div className={styles.blob3}></div>
                <div className={styles.noise}></div>
            </div>
            
            <div className={styles.content}>
                <RevelatingText play={textShouldAnimate}>
                    <span className={styles.line1}>{t("line1")}</span><br/>
                    <span className={`highlight ${styles.line2}`}>{t("highlight")}</span><br/>
                    <span className={styles.line3}>{t("line3")}</span><br/>
                    <span className={styles.line3Emph}>{t("emphasis")}</span>
                </RevelatingText>
            </div>
        </section>
    );
}
