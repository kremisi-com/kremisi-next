"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./main-slider.module.css";
import Slide from "./slide/slide";

export default function MainSlider({ projectsData }) {
    const [scrollPosition, setScrollPosition] = useState(
        -(400 / 31) * (projectsData.length / 2)
    );

    const scalingOffset = 15;
    const scrollRef = useRef(scrollPosition);
    const ticking = useRef(false);

    useEffect(() => {
        scrollRef.current = scrollPosition;
    }, [scrollPosition]);

    function handleScroll(e) {
        const speed = 4;
        const shift = e.deltaY > 0 ? -speed : speed;
        scrollRef.current += shift;

        if (!ticking.current) {
            window.requestAnimationFrame(() => {
                setScrollPosition(scrollRef.current);
                ticking.current = false;
            });
            ticking.current = true;
        }
    }

    const titleRef = useRef(null);
    const [darkText, setDarkText] = useState(false);
    const [title, setTitle] = useState("");
    const [translation, setTranslation] = useState("translate(-50%, -50%)");

    function updateTitleData(newTitle, isDarkText) {
        setTitle(newTitle);
        setDarkText(isDarkText);
    }

    function handleMouseMove(e) {
        const x = e.clientX + 15;
        const y = e.clientY + 2;

        setTranslation(`translate(${x}px, ${y}px)`);
    }

    return (
        <>
            <div
                className={styles.slider}
                onWheel={handleScroll}
                style={{
                    transform: `translate(${-scrollPosition}vh, ${scrollPosition}vh)`,
                }}
                onMouseMove={handleMouseMove}
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
                        updateTitleData={updateTitleData}
                    />
                ))}
            </div>
            <label
                className={styles.title}
                ref={titleRef}
                style={{
                    color: darkText ? "black" : "white",
                    transform: translation,
                }}
            >
                {title}
            </label>
        </>
    );
}
