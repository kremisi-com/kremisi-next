import Image from "next/image";
import styles from "./navbar.module.css";

export default function Navbar() {
    return (
        <nav className={styles.navbar}>
            <div className={styles.buttons}>
                <button>Home</button>
                <button>About</button>
            </div>
            <Image
                src="/images/logo/logo-dark.png"
                alt="Logo"
                width={172}
                height={31}
                className={styles.logo}
            />
            <div className={`${styles.buttons} ${styles.right}`}>
                <button>Contact</button>
                <button>Language</button>
            </div>
        </nav>
    );
}
