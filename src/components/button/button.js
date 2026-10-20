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
    const content = animation ? (
        <>
            <span className={`${styles.text} ${styles.top}`}>{children}</span>
            <span className={`${styles.text} ${styles.bottom}`} aria-hidden="true">
                {children}
            </span>
        </>
    ) : children;
    return href !== "" ? (
        <AnimatedLink
            href={href}
            className={`${styles.button} ${className}`}
            onClick={onClick}
            target={target}
            {...buttonProps}
        >
            {content}
        </AnimatedLink>
    ) : <button type="button" className={`${styles.button} ${className}`} onClick={onClick} {...buttonProps}>
        {content}
    </button>;
}
