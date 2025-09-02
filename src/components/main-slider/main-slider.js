"use client";

import { useState, useEffect } from "react";
import styles from "./main-slider.module.css";
import Slide from "./slide/slide";

export default function MainSlider({ projectsData }) {
    const [scrollPosition, setScrollPosition] = useState(
        -(400 / 31) * (projectsData.length / 2)
    );
    const scalingOffset = 15;

    function handleScroll(e) {
        const speed = 3;
        const shift = e.deltaY > 0 ? -speed : speed;
        setScrollPosition((prev) => prev + shift);
    }

    return (
        <div
            className={styles.slider}
            onWheel={handleScroll}
            style={{
                transform: `translate(${-scrollPosition}vh, ${scrollPosition}vh)`,
            }}
        >
            {projectsData.map((slideData, index) => (
                <Slide
                    key={slideData.id}
                    data={slideData}
                    style={{
                        top: `${
                            (projectsData.length - 1) * scalingOffset -
                            index * scalingOffset
                        }vh`,
                        right: `${
                            (projectsData.length - 1) * scalingOffset -
                            index * scalingOffset
                        }vh`,
                        zIndex: projectsData.length - index,
                    }}
                />
            ))}
        </div>
    );
}
