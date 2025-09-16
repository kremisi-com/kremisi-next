"use client";

import React, {
    useState,
    useRef,
    useEffect,
    useCallback,
    useMemo,
} from "react";
import styles from "./main-slider.module.css";
import Slide from "./slide/slide";
import Loader from "@/components/loader/loader";
import throttle from "lodash/throttle";

export default function MainSlider({ projectsData }) {
    const [animationEnded, setAnimationEnded] = useState(false);

    const chunksNumber = 5;
    const relativeChunkSize = 1 / chunksNumber;
    const chunks = Array.from({ length: chunksNumber }, (_, i) =>
        Math.round(relativeChunkSize * (i + 1) * projectsData.length)
    );
    chunks.unshift(0);

    const slideSize = 15;
    const sliderSize = slideSize * projectsData.length;
    const sliderCenter = -slideSize * (projectsData.length / 2);
    const [scrollPosition, setScrollPosition] = useState(sliderCenter * 4);
    const animationDurationInitial = 1700;
    const [animationDuration, setAnimationDuration] = useState(
        `${animationDurationInitial}ms`
    );

    function findActualChunk(scroll) {
        const mod = -(sliderCenter + scroll) / sliderSize;
        const chunkNumber = Math.floor(mod / relativeChunkSize);
        return chunkNumber;
    }

    const animationTargetScroll = 0;
    let [actualChunk, setActualChunk] = useState(
        findActualChunk(animationTargetScroll)
    );
    useEffect(() => {
        if (!animationEnded) return;
        const newChunk = findActualChunk(scrollPosition);
        if (newChunk !== actualChunk) onChunkChange(actualChunk, newChunk);
    }, [scrollPosition]);

    const scalingOffset = 15;
    const scrollRef = useRef(scrollPosition);
    const ticking = useRef(false);
    const animationStartedRef = useRef(false);

    const runAnimation = useCallback(() => {
        if (animationStartedRef.current) return;
        animationStartedRef.current = true;
        setScrollPosition(animationTargetScroll);
        setTimeout(() => {
            setAnimationEnded(true);
            setAnimationDuration(".2s");
        }, animationDurationInitial);
    }, [animationDurationInitial, animationTargetScroll]);

    useEffect(() => {
        scrollRef.current = scrollPosition;
    }, [scrollPosition]);

    const speed = 4;
    const handleScroll = useCallback(
        throttle((e) => {
            const shift = e.deltaY > 0 ? -speed : speed;
            scrollRef.current += shift;

            if (!ticking.current) {
                window.requestAnimationFrame(() => {
                    setScrollPosition(scrollRef.current);
                    ticking.current = false;
                });
                ticking.current = true;
            }
        }, 50), // massimo una volta ogni 50ms
        []
    );

    const titleRef = useRef(null);
    const [darkText, setDarkText] = useState(false);
    const [title, setTitle] = useState("");
    const [translation, setTranslation] = useState("translate(-50%, -50%)");

    const updateTitleData = useCallback((newTitle, isDarkText) => {
        setTitle(newTitle);
        setDarkText(isDarkText);
    }, []);

    function handleMouseMove(e) {
        const x = e.clientX + 15;
        const y = e.clientY + 2;

        setTranslation(`translate(${x}px, ${y}px)`);
    }

    const [slidesPositions, setSlidesPositions] = useState(
        projectsData.map(
            (_, index) =>
                (projectsData.length - 1) * scalingOffset -
                index * scalingOffset
        )
    );
    const [areSlidesDisplayed, setAreSlidesDisplayed] = useState(
        projectsData.map((_, index) => true)
    );

    const [percentageLoaded, setPercentageLoaded] = useState(0);
    const onImageLoad = useCallback(() => {
        if (animationStartedRef.current) return;
        setPercentageLoaded((prev) => {
            if (animationStartedRef.current) return prev;
            const increment = (1 / projectsData.length) * 100;
            const newValue = Math.min(prev + increment, 100);
            if (newValue >= 100) runAnimation();
            return newValue;
        });
    }, [projectsData.length, runAnimation]);

    function onChunkChange(oldChunk, chunk) {
        setActualChunk(chunk);
        const direction = chunk > oldChunk ? 1 : -1;
        let chunkToMove = (chunk + 3 * -direction) % chunksNumber;
        if (chunkToMove < 0) chunkToMove = chunksNumber + chunkToMove;
        let indexesToMove = [];
        for (let i = chunks[chunkToMove]; i < chunks[chunkToMove + 1]; i++)
            indexesToMove.push(i);
        indexesToMove = indexesToMove.map((i) => projectsData.length - 1 - i);

        setAreSlidesDisplayed((prev) => {
            const newDisplay = [...prev];
            for (let i = 0; i < newDisplay.length; i++) newDisplay[i] = true;

            indexesToMove.forEach((i) => {
                newDisplay[i] = false;
            });
            return newDisplay;
        });

        setSlidesPositions((prev) => {
            const newPositions = [...prev];
            const chunkPositions = indexesToMove.map((i) => newPositions[i]);
            const chunkMin = Math.min(...chunkPositions);
            const chunkMax = Math.max(...chunkPositions);
            const chunkSpan = chunkMax - chunkMin;
            const offsets = chunkPositions.map((pos) => pos - chunkMin);

            const indexesSet = new Set(indexesToMove);
            const remainingPositions = newPositions.filter(
                (_, idx) => !indexesSet.has(idx)
            );
            const globalMax =
                remainingPositions.length > 0
                    ? Math.max(...remainingPositions)
                    : chunkMax;
            const globalMin =
                remainingPositions.length > 0
                    ? Math.min(...remainingPositions)
                    : chunkMin;

            let newStartPosition = 0;
            if (direction === 1) {
                newStartPosition = globalMax + scalingOffset;
            } else {
                newStartPosition = globalMin - scalingOffset - chunkSpan;
            }
            indexesToMove.forEach((i, idx) => {
                newPositions[i] = newStartPosition + offsets[idx];
            });
            return newPositions;
        });
    }

    // ------------------- SLIDES SIZES ------------------------- //
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

    // --------------------- SLIDES STYLES ------------------------ //

    const slideStyles = useMemo(() => {
        return projectsData.map((_, index) => ({
            top: `${slidesPositions[index]}vh`,
            right: `${slidesPositions[index]}vh`,
            zIndex: slidesPositions[index],
            transition: areSlidesDisplayed[index] ? "all .2s ease" : "0s",
            display: areSlidesDisplayed[index] ? "block" : "none",
        }));
    }, [projectsData, scalingOffset, slidesPositions]);

    return (
        <div onWheel={handleScroll}>
            {percentageLoaded < 99 && <Loader percentage={percentageLoaded} />}
            <div
                className={styles.slider}
                style={{
                    transform: `translate(${
                        -scrollPosition + sliderSize / 2 - 20
                    }vh, ${scrollPosition - sliderSize / 2}vh)`,
                    "--animation-duration": animationDuration,
                }}
                onMouseMove={handleMouseMove}
            >
                {projectsData.map((slideData, index) => (
                    <Slide
                        key={slideData.id + index}
                        data={slideData}
                        style={slideStyles[index]}
                        updateTitleData={updateTitleData}
                        onImageLoad={onImageLoad}
                        width={imageWidth}
                        height={imageHeight}
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
        </div>
    );
}
