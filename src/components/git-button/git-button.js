import Link from "next/link";
import styles from "./git-button.module.css";
import { LucideArrowRight, LucideArrowUpRight } from "lucide-react";

export default function GitButton() {
    return (
        <Link href={""} className={styles.link}>
            <div className={styles.container}>
                <div className={`${styles.left} ${styles.arrow}`}>
                    <LucideArrowRight />
                </div>
                <button className={`${styles.button}`}>
                    <span className={`${styles.text} ${styles.top}`}>
                        Get in touch
                    </span>
                    <span className={`${styles.text} ${styles.bottom}`}>
                        Get in touch
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
        </Link>
    );
}
