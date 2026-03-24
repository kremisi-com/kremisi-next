"use client";
import styles from './social-proof.module.css';

export default function SocialProof() {
    return (
        <section className={styles.socialProofSection} id="social-proof">
            <div className={styles.gallery}>
                <div className={styles.galleryInner}>
                    <div className={`${styles.placeholder} ${styles.p1}`}></div>
                    <div className={`${styles.placeholder} ${styles.p2}`}></div>
                    <div className={`${styles.placeholder} ${styles.p3}`}></div>
                    <div className={`${styles.placeholder} ${styles.p4}`}></div>
                    <div className={`${styles.placeholder} ${styles.p5}`}></div>
                    <div className={`${styles.placeholder} ${styles.p6}`}></div>
                    <div className={`${styles.placeholder} ${styles.p7}`}></div>
                    <div className={`${styles.placeholder} ${styles.p8}`}></div>
                    <div className={`${styles.placeholder} ${styles.p9}`}></div>
                    <div className={`${styles.placeholder} ${styles.p10}`}></div>
                </div>
            </div>

            <div className={styles.container}>
                <div className={styles.badge}>Testimonials</div>
                
                <h2 className={styles.title}>
                    Trusted by leaders<br/>
                    <span className={styles.titleLight}>from various industries</span>
                </h2>
                
                <p className={styles.description}>
                    Learn why professionals trust our solutions to<br/>
                    complete their customer journeys.
                </p>
                
                <button className={styles.button}>
                    Read Success Stories
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
            </div>
        </section>
    );
}
