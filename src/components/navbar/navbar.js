import Image from "next/image";
import styles from "./navbar.module.css";
import Button from "@/components/button/button";
import Link from "next/link";
import { ModeToggle } from "../dark-mode/ModeToggle";
import { Globe, Sun } from "lucide-react";

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
        <Button>Contacts</Button>
        <Button className={styles.icon} animation={false}>
          <Globe size={20} />
        </Button>
        <Button className={styles.icon} animation={false}>
          <Sun size={20} />
        </Button>
      </div>
    </nav>
  );
}
