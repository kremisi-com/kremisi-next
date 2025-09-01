import Image from "next/image";
import styles from "./slide.module.css";

export default function Slide({ image, title, description, style }) {
    const scaleFactor = 1;

    const imageWidth = Math.round(450 * scaleFactor);
    const imageHeight = Math.round(275 * scaleFactor);
    return (
        <div
            className={`${styles.ortho} ${styles.slide}`}
            style={{
                ...style,
                width: `${imageWidth}px`,
                height: `${imageHeight}px`,
            }}
        >
            <Image
                src={image}
                width={imageWidth}
                height={imageHeight}
                alt={title}
                style={{ "--image-width": `${imageWidth / 2}px` }}
            />
        </div>
    );
}
