"use client";

import { useState, useEffect } from "react";
import styles from "./main-slider.module.css";
import Slide from "./slide/slide";

export default function MainSlider({ projectsData }) {
    const [scrollPosition, setScrollPosition] = useState(0);
    //lo slope dipende dal ratio dello schermo, anche la grandezza delle immagini e la rotazione
    const [slope, setSlope] = useState(1);
    const scalingOffset = 15;

    useEffect(() => {
        function updateSlope() {
            setSlope(window.innerHeight / window.innerWidth);
        }
        updateSlope();
        window.addEventListener("resize", updateSlope);
        return () => window.removeEventListener("resize", updateSlope);
    }, []);

    function handleScroll(e) {
        const speed = 2;
        const shift = e.deltaY > 0 ? -speed : speed;
        setScrollPosition((prev) => prev + shift);
    }

    function calcSizeSloped(size) {
        return size / (slope * 1.3);
    }

    return (
        <div className={styles.slider} onWheel={handleScroll}>
            {projectsData.map((slideData, index) => (
                <Slide
                    key={slideData.id}
                    image={slideData.image}
                    title={slideData.id}
                    width={calcSizeSloped(450)}
                    height={calcSizeSloped(275)}
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
