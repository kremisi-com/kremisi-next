import Image from "next/image";
import styles from "./page.module.css";
import MainSlider from "@/components/main-slider/main-slider";

export default function Home() {
    return (
        <div className={styles.page}>
            <MainSlider />
        </div>
    );
}
