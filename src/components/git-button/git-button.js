import styles from "./git-button.module.css";
import { LucideArrowRight, LucideArrowUpRight } from "lucide-react";

export default function GitButton({
    isSubmit = false,
    text = "Get in touch",
    disabled = false,
    leftShift = 0,
}) {
    return (
        <div style={{ marginLeft: leftShift }}>
            <div
                className={`${styles.container} ${
                    disabled ? styles.disabled : ""
                }`}
            >
                <div className={`${styles.left} ${styles.arrow}`}>
                    <LucideArrowRight />
                </div>
                <button
                    className={`${styles.button}`}
                    type={isSubmit ? "submit" : "button"}
                >
                    <span className={`${styles.text} ${styles.top}`}>
                        {isSubmit ? "Submit" : text}
                    </span>
                    <span className={`${styles.text} ${styles.bottom}`}>
                        {isSubmit ? "Submit" : text}
                    </span>
                </button>
                <div className={`${styles.right} ${styles.arrow}`}>
                    <LucideArrowUpRight />
                </div>
            </div>

            <svg xmlns="http://www.w3.org/2000/svg" style={{ display: "none" }}>
                <defs>
                    <filter id="goo">
                        <feGaussianBlur
                            in="SourceGraphic"
                            stdDeviation="4"
                            result="blur"
                        />
                        <feColorMatrix
                            in="blur"
                            mode="matrix"
                            values="
                                1 0 0 0 0
                                0 1 0 0 0
                                0 0 1 0 0
                                0 0 0 30 -15"
                            result="goo"
                        />
                        <feBlend in="SourceGraphic" in2="goo" />
                    </filter>
                </defs>
            </svg>
        </div>
    );
}
