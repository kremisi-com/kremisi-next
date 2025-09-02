import styles from "./button.module.css";

export default function Button({ children, onClick, className }) {
    return (
        <button className={`${styles.button} ${className}`} onClick={onClick}>
            <span className={`${styles.text} ${styles.top}`}>{children}</span>
            <span className={`${styles.text} ${styles.bottom}`}>
                {children}
            </span>
        </button>
    );
}
