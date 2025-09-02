import Image from "next/image";
import styles from "./slide.module.css";
import { useRef } from "react";

export default function Slide({ data, style, width, height }) {
    const titleRef = useRef(null);
    const scaleFactor = 1;

    const imageWidth = Math.round(width * scaleFactor);
    const imageHeight = Math.round(height * scaleFactor);

    function handleMouseEnter() {
        titleRef.current.style.opacity = 1;
    }
    function handleMouseLeave() {
        titleRef.current.style.opacity = 0;
    }
    function handleMouseMove(e) {
        const x = e.clientX + 15;
        const y = e.clientY + 2;

        titleRef.current.style.top = `${y}px`;
        titleRef.current.style.left = `${x}px`;
    }

    return (
        <>
            <div
                className={`${styles.ortho} ${styles.slide}`}
                style={{
                    ...style,
                    width: `${imageWidth}px`,
                    height: `${imageHeight}px`,
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouseMove}
            >
                <Image
                    src={data.image}
                    width={imageWidth}
                    height={imageHeight}
                    alt={data.title}
                    style={{ "--image-width": `${imageWidth}px` }}
                />
            </div>
            <label
                className={styles.title}
                ref={titleRef}
                style={{
                    opacity: 0,
                    color: data.blackText ? "black" : "white",
                }}
            >
                {data.title}
            </label>
        </>
    );
}
