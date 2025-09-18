import Link from "next/link";
import styles from "./button.module.css";

export default function Button({
    children,
    onClick,
    className = "",
    animation = true,
    href = "",
}) {
    const button = animation ? (
        <button className={`${styles.button} ${className}`} onClick={onClick}>
            <span className={`${styles.text} ${styles.top}`}>{children}</span>
            <span className={`${styles.text} ${styles.bottom}`}>
                {children}
            </span>
        </button>
    ) : (
        <button className={`${styles.button} ${className}`} onClick={onClick}>
            {children}
        </button>
    );
    return href !== "" ? (
        <Link href={href} className={styles.link} onClick={onClick}>
            {button}
        </Link>
    ) : (
        button
    );
}
