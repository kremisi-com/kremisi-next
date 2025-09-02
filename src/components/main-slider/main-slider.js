"use client";

import { useState, useEffect } from "react";
import styles from "./main-slider.module.css";
import Slide from "./slide/slide";

export default function MainSlider({ projectsData }) {
    const [scrollPosition, setScrollPosition] = useState(0);
    const scalingOffset = 15;

    function handleScroll(e) {
        const speed = 2;
        const shift = e.deltaY > 0 ? -speed : speed;
        setScrollPosition((prev) => prev + shift);
    }

    return (
        <div className={styles.slider} onWheel={handleScroll}>
            {projectsData.map((slideData, index) => (
                <Slide
                    key={slideData.id}
                    data={slideData}
                    style={{
                        top: `${
                            (projectsData.length - 1) * scalingOffset -
                            index * scalingOffset +
                            scrollPosition
                        }vh`,
                        right: `${
                            (projectsData.length - 1) * scalingOffset -
                            index * scalingOffset +
                            scrollPosition
                        }vh`,
                        zIndex: projectsData.length - index,
                    }}
                />
            ))}
        </div>
    );
}
