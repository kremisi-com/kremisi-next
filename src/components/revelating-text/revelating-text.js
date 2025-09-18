"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import SplitType from "split-type";
import styles from "./revelating-text.module.css";

export default function RevelatingText({ children }) {
    const sectionRef = useRef(null);
    const textRef = useRef(null);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        const el = textRef.current;
        if (!el) return;

        const split = new SplitType(el, { types: "words" });
        gsap.set(el, { autoAlpha: 1 });

        const ctx = gsap.context(() => {
            gsap.fromTo(
                split.words,
                { yPercent: 100, opacity: 0 },
                {
                    yPercent: 0,
                    opacity: 1,
                    duration: 0.35,
                    ease: "power3.out",
                    stagger: 0.02,
                    scrollTrigger: {
                        trigger: sectionRef.current || el,
                        start: "top 80%",
                        once: true,
                    },
                }
            );
        }, sectionRef);

        ctx.add(() => {
            const words = el.querySelectorAll(`.word`);

            words.forEach((w) => {
                ScrollTrigger.create({
                    trigger: w,
                    start: "top 66%",
                    onEnter: () => {
                        const isHighlight = !!w.closest(`.highlight`);
                        const color = isHighlight
                            ? "var(--primary)"
                            : "var(--foreground)";
                        gsap.to(w, { color, duration: 0.2 });
                    },
                    onEnterBack: () => {
                        const isHighlight = !!w.closest(`.highlight`);
                        const color = isHighlight
                            ? "var(--primary)"
                            : "var(--foreground)";
                        gsap.to(w, { color, duration: 0.2 });
                    },
                    onLeave: () => gsap.set(w, { clearProps: "color" }),
                    onLeaveBack: () => gsap.set(w, { clearProps: "color" }),
                });
            });

            ScrollTrigger.refresh();
        });

        return () => {
            ctx.revert();
            gsap.set(el, { clearProps: "all" });
            split.revert();
        };
    }, []);

    return (
        <section ref={sectionRef} className={styles.section}>
            <p
                ref={textRef}
                className={`${styles.text} ${styles.hideUntilAnimated}`}
            >
                {children}
            </p>
        </section>
    );
}
