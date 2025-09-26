"use client";
import React, { useEffect, useRef } from "react";
import styles from "./colored-list.module.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ColoredList({ items }) {
    const listRef = useRef(null);

    useEffect(() => {
        const elements = listRef.current.querySelectorAll("li");

        gsap.fromTo(
            elements,
            {
                opacity: 0,
                y: 0,
                scale: 0.9,
            },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.7,
                ease: "back.out(1.7)",
                stagger: 0.1,
                scrollTrigger: {
                    trigger: listRef.current,
                    start: "top 80%",
                    toggleActions: "play none none reverse",
                },
            }
        );
    }, []);

    return (
        <ul ref={listRef} className={styles.list}>
            {items.map((item, index) =>
                item.level === "rainbow" ? (
                    <li key={index} className={styles.rainbowContainer}>
                        <div className={styles.rainbowContent}>{item.name}</div>
                    </li>
                ) : (
                    <li key={index} className={styles[item.level]}>
                        {item.name}
                    </li>
                )
            )}
        </ul>
    );
}
