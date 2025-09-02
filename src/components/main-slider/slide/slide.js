"use client";

import Image from "next/image";
import styles from "./slide.module.css";
import { useEffect, useRef, useState } from "react";

export default function Slide({ data, style }) {
    //lo slope dipende dal ratio dello schermo, anche la grandezza delle immagini e la rotazione
    const [slope, setSlope] = useState(1);

    function calcSizeSloped(size) {
        return size / (slope * 1.3);
    }

    useEffect(() => {
        function updateSlope() {
            setSlope(window.innerHeight / window.innerWidth);
        }
        updateSlope();
        window.addEventListener("resize", updateSlope);
        return () => window.removeEventListener("resize", updateSlope);
    }, []);

    const titleRef = useRef(null);
    const scaleFactor = 1;

    const width = 450;
    const height = 275;

    const minWidth = width * 0.8;
    const minHeight = height * 0.8;

    const imageWidth = Math.max(
        calcSizeSloped(Math.round(width * scaleFactor)),
        minWidth
    );
    const imageHeight = Math.max(
        calcSizeSloped(Math.round(height * scaleFactor)),
        minHeight
    );

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
