import styles from "./footer.module.css";

export default function Footer() {
    return (
        <>
            <footer className={`${styles.footer} onlyDesktop`}>
                <address className={styles.info}>
                    <a href="mailto:info@kremisi.com">info@kremisi.com</a>
                </address>
                <span className={styles.info}></span>
                <span className={styles.info}>
                    VAT IT03894640121 - © 2022{" "}
                    <span className="color-primary">Kremisi</span>
                </span>
            </footer>
            <footer className={`${styles.footer} onlyMobile`}>
                <address className={styles.info}>
                    <a href="mailto:info@kremisi.com">info@kremisi.com</a>
                </address>
            </footer>
        </>
    );
}
