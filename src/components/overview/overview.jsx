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
                    We shape the <span className="highlight">future</span><br/>through uncompromising <span className="highlight">digital design.</span>
                </RevelatingText>
            </div>
        </section>
    );
}
