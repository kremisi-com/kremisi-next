import styles from "./button.module.css";

export default function Button({
    children,
    onClick,
    className,
    animation = true,
}) {
    return animation ? (
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
}
