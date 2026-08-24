import Link from "next/link";
import styles from "./button.module.css";
import AnimatedLink from "../animated-link/animated-link";

export default function Button({
    children,
    onClick,
    className = "",
    animation = true,
    href = "",
    target = "_self",
    ...buttonProps
}) {
    const button = animation ? (
        <button
            className={`${styles.button} ${className}`}
            onClick={onClick}
            {...buttonProps}
        >
            <span className={`${styles.text} ${styles.top}`}>{children}</span>
            <span className={`${styles.text} ${styles.bottom}`}>
                {children}
            </span>
        </button>
    ) : (
        <button
            className={`${styles.button} ${className}`}
            onClick={onClick}
            {...buttonProps}
        >
            {children}
        </button>
    );
    return href !== "" ? (
        <AnimatedLink
            href={href}
            className={styles.link}
            onClick={onClick}
            target={target}
        >
            {button}
        </AnimatedLink>
    ) : (
        button
    );
}
