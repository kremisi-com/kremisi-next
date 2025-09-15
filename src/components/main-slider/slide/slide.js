"use client";

import Image from "next/image";
import styles from "./slide.module.css";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import React from "react";

let n = 0;
export default React.memo(function Slide({
    data,
    style,
    updateTitleData,
    onImageLoad,
}) {
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
        updateTitleData(data.title, data.blackText);
    }

    // console.log("render slide", data.title, n++);

    return (
        <>
            <Link href={data.link}>
                <div
                    className={`${styles.ortho} ${styles.slide}`}
                    style={{
                        ...style,
                        width: `${imageWidth}px`,
                        height: `${imageHeight}px`,
                    }}
                    onMouseEnter={handleMouseEnter}
                >
                    <Image
                        src={data.image}
                        width={imageWidth}
                        height={imageHeight}
                        alt={data.title}
                        style={{ "--image-width": `${imageWidth}px` }}
                        priority={true}
                        onLoad={onImageLoad}
                    />
                </div>
            </Link>
        </>
    );
});
