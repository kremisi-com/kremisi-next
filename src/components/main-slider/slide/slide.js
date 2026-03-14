"use client";

import Image from "next/image";
import styles from "./slide.module.css";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import React from "react";
import AnimatedLink from "@/components/animated-link/animated-link";
import { trackSelectItem } from "@/lib/analytics";

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
            <AnimatedLink
                href={data.link}
                onClick={() => trackSelectItem(data.title, data.id)}
            >
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
                        alt={data.previewImageAlt || data.title}
                        style={{ "--image-width": `${height}px` }}
                        priority={true}
                        onLoad={onImageLoad}
                    />
                </div>
            </AnimatedLink>
        </>
    );
});
