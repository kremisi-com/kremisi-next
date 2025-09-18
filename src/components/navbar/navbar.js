import Image from "next/image";
import styles from "./navbar.module.css";
import Button from "@/components/button/button";
import Link from "next/link";
// import { Globe, Sun } from "lucide-react";
import ThemeToggle from "./theme-toggler";

export default function Navbar() {
    return (
        <nav className={styles.navbar}>
            <div className={styles.buttons}>
                <Button href="/">Home</Button>
                <Button href="/about">About</Button>
                <Button href="/projects">Projects</Button>
            </div>
            <Link href="/">
                <Image
                    src="/images/logo/logo-dark.png"
                    alt="Logo"
                    width={172}
                    height={31}
                    className={styles.logo}
                    priority={true}
                />
            </Link>
            <div className={`${styles.buttons} ${styles.right}`}>
                <Button>Contacts</Button>
                {/* <Link href="/" locale="it">
                    <Button className={styles.icon} animation={false}>
                        <Globe size={20} />
                    </Button>
                </Link> */}
                <ThemeToggle styles={styles} />
            </div>
        </nav>
    );
}
