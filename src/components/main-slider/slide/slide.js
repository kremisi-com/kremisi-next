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
    width,
    height,
}) {
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
                        width: `${width}px`,
                        height: `${height}px`,
                    }}
                    onMouseEnter={handleMouseEnter}
                >
                    <Image
                        src={data.image}
                        width={width}
                        height={height}
                        alt={data.title}
                        style={{ "--image-width": `${height}px` }}
                        priority={true}
                        onLoad={onImageLoad}
                    />
                </div>
            </Link>
        </>
    );
});
