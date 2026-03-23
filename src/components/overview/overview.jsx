import RevelatingText from "@/components/revelating-text/revelating-text";
import styles from "./overview.module.css";

export default function Overview() {
    return (
        <section className={styles.overview} id="overview">
            <div className={styles.background}>
                <div className={styles.blob1}></div>
                <div className={styles.blob2}></div>
                <div className={styles.blob3}></div>
                <div className={styles.noise}></div>
            </div>
            
            <div className={styles.content}>
                <RevelatingText>
                    We shape the <span className="highlight">future</span><br/>through uncompromising <span className="highlight">digital design.</span>
                </RevelatingText>
            </div>
        </section>
    );
}