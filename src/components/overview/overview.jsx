import RevelatingText from "@/components/revelating-text/revelating-text";
import styles from "./overview.module.css";

export default function Overview({
    isVisible = true,
    textShouldAnimate,
    onFadeInComplete,
}) {
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
                    <span className={styles.line1}>We design, build and scale</span><br/>
                    <span className={`highlight ${styles.line2}`}>digital products</span><br/>
                    <span className={styles.line3}>that drive <span className={styles.line3Emph}>real results.</span></span>
                </RevelatingText>
            </div>
        </section>
    );
}
