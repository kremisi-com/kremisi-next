import Image from "next/image";
import styles from "./navbar.module.css";
import Button from "@/components/button/button";
import Link from "next/link";

export default function Navbar() {
    return (
        <nav className={styles.navbar}>
            <div className={styles.buttons}>
                <Button>Home</Button>
                <Button>About</Button>
                <Button>Projects</Button>
            </div>
            <Link href="/">
                <Image
                    src="/images/logo/logo-dark.png"
                    alt="Logo"
                    width={172}
                    height={31}
                    className={styles.logo}
                />
            </Link>
            <div className={`${styles.buttons} ${styles.right}`}>
                <Button>Contact</Button>
                <Button className={styles.language} animation={false}>
                    <Image
                        src="/images/icons/language.png"
                        alt="Language"
                        width={20}
                        height={20}
                    />
                </Button>
            </div>
        </nav>
    );
}
